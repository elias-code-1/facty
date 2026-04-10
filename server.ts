import express from "express";
import { createServer as createViteServer } from "vite";
import { createClient } from "@supabase/supabase-js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API: Récupérer les paramètres publics
  app.get("/api/settings/public", async (req, res) => {
    try {
      const supabaseUrl = process.env.VITE_SUPABASE_URL;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

      if (!supabaseUrl || !supabaseServiceKey) {
        return res.status(500).json({ error: 'SERVER_CONFIG_ERROR' });
      }

      const adminSupabase = createClient(supabaseUrl, supabaseServiceKey, {
        auth: { autoRefreshToken: false, persistSession: false }
      });

      const { data, error } = await adminSupabase
        .from('platform_settings')
        .select('key, value')
        .in('key', ['free_plan_invoice_limit']);

      if (error) throw error;

      const settings = data.reduce((acc: any, item) => {
        acc[item.key] = item.value;
        return acc;
      }, {});

      res.json(settings);
    } catch (err: any) {
      console.error("Erreur récupération settings publics:", err);
      res.status(500).json({ error: 'DATABASE_ERROR' });
    }
  });

  // API: Suppression d'utilisateur (nécessite SUPABASE_SERVICE_ROLE_KEY)
  app.post("/api/admin/delete-user", async (req, res) => {
    const { userId } = req.body;
    const authHeader = req.headers.authorization;

    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ error: "userId est requis et doit être une chaîne" });
    }

    try {
      const supabaseUrl = process.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

      if (!supabaseUrl || !supabaseServiceKey) {
        return res.status(500).json({ error: "Configuration serveur incomplète" });
      }

      // 1. Vérifier que l'appelant est admin (via son token)
      const clientSupabase = createClient(supabaseUrl, supabaseAnonKey!);
      const token = authHeader?.split(' ')[1]; // Extraction plus robuste
      
      if (!token) {
        return res.status(401).json({ error: "Non authentifié" });
      }

      const { data: { user }, error: authError } = await clientSupabase.auth.getUser(token);

      if (authError || !user) {
        return res.status(401).json({ error: "Non authentifié" });
      }

      // 2. Initialiser le client Admin (Service Role)
      const adminSupabase = createClient(supabaseUrl, supabaseServiceKey, {
        auth: { autoRefreshToken: false, persistSession: false }
      });

      // 3. Vérifier le rôle via le client Admin pour bypasser les RLS
      const { data: profile, error: profileError } = await adminSupabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profileError || profile?.role !== "admin") {
        return res.status(403).json({ error: "Accès refusé" });
      }

      // 4. Supprimer l'utilisateur via la Service Role Key
      const { error: deleteError } = await adminSupabase.auth.admin.deleteUser(userId);

      if (deleteError) {
        console.error("[Supabase Admin Delete Error]", deleteError);
        return res.status(400).json({ error: "Impossible de supprimer l'utilisateur" });
      }

      res.json({ success: true });
    } catch (err) {
      console.error("Erreur serveur delete-user:", err);
      res.status(500).json({ error: "Une erreur interne est survenue" });
    }
  });

  // API: Invitation d'utilisateur (nécessite SUPABASE_SERVICE_ROLE_KEY)
  app.post("/api/admin/invite-user", async (req, res) => {
    const { email, full_name, team_role } = req.body;
    const authHeader = req.headers.authorization;

    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: "L'email est requis et doit être valide" });
    }

    try {
      const supabaseUrl = process.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

      if (!supabaseUrl || !supabaseServiceKey) {
        return res.status(500).json({ error: "Configuration serveur incomplète" });
      }

      const clientSupabase = createClient(supabaseUrl, supabaseAnonKey!);
      const token = authHeader?.split(' ')[1]; // Extraction plus robuste
      
      if (!token) {
        return res.status(401).json({ error: "Non authentifié" });
      }

      const { data: { user }, error: authError } = await clientSupabase.auth.getUser(token);

      if (authError || !user) {
        return res.status(401).json({ error: "Non authentifié" });
      }

      const adminSupabase = createClient(supabaseUrl, supabaseServiceKey, {
        auth: { autoRefreshToken: false, persistSession: false }
      });

      const { data: profile, error: profileError } = await adminSupabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profileError || profile?.role !== "admin") {
        return res.status(403).json({ error: "Accès refusé" });
      }

      const redirectUrl = process.env.VITE_APP_URL || 'https://factyapp.logonova.site';

      const { data: inviteData, error: inviteError } = await adminSupabase.auth.admin.inviteUserByEmail(email, {
        data: {
          full_name: full_name?.toString() || '',
          team_role: team_role?.toString() || 'member'
        },
        redirectTo: `${redirectUrl}/auth`
      });

      if (inviteError) {
        console.error("[Supabase Admin Invite Error]", inviteError);
        return res.status(400).json({ error: "Impossible d'envoyer l'invitation" });
      }

      res.json({ success: true, user: inviteData.user });
    } catch (err) {
      console.error("Erreur serveur invite-user:", err);
      res.status(500).json({ error: "Une erreur interne est survenue" });
    }
  });

  // Vite middleware pour le développement
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  }

  // Production static files
  if (process.env.NODE_ENV === "production") {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
  });
}

startServer();
