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
        return res.json({ free_plan_invoice_limit: '999999' }); // Fallback
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
      res.json({ free_plan_invoice_limit: '999999' }); // Fallback en cas d'erreur
    }
  });

  // API: Suppression d'utilisateur (nécessite SUPABASE_SERVICE_ROLE_KEY)
  app.post("/api/admin/delete-user", async (req, res) => {
    console.log("--- Requête DELETE USER reçue ---");
    const { userId } = req.body;
    const authHeader = req.headers.authorization;

    if (!userId) {
      console.warn("userId manquant");
      return res.status(400).json({ error: "userId est requis" });
    }

    try {
      const supabaseUrl = process.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

      if (!supabaseUrl || !supabaseServiceKey) {
        return res.status(500).json({ 
          error: "Configuration serveur incomplète (SUPABASE_SERVICE_ROLE_KEY manquante)" 
        });
      }

      // 1. Vérifier que l'appelant est admin (via son token)
      console.log("Tentative de suppression de l'utilisateur:", userId);
      console.log("Authorization Header présent:", !!authHeader);
      
      const clientSupabase = createClient(supabaseUrl, supabaseAnonKey!);
      const token = authHeader?.replace("Bearer ", "");
      
      if (!token) {
        console.error("Token manquant dans la requête");
        return res.status(401).json({ error: "Non authentifié (Token manquant)" });
      }

      const { data: { user }, error: authError } = await clientSupabase.auth.getUser(token);

      if (authError || !user) {
        console.error("Erreur Supabase Auth:", authError?.message || "Utilisateur non trouvé");
        return res.status(401).json({ error: `Non authentifié: ${authError?.message || "Utilisateur non trouvé"}` });
      }

      console.log("Utilisateur authentifié:", user.email);

      // 2. Initialiser le client Admin (Service Role)
      const adminSupabase = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      });

      // 3. Vérifier le rôle via le client Admin pour bypasser les RLS
      const { data: profile, error: profileError } = await adminSupabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error("Erreur lors de la récupération du profil:", profileError.message);
        return res.status(500).json({ error: "Impossible de vérifier votre rôle d'administrateur." });
      }

      if (profile?.role !== "admin") {
        console.warn("Tentative d'accès non autorisé par:", user.email);
        return res.status(403).json({ error: "Accès refusé : Vous devez être administrateur." });
      }

      // 4. Supprimer l'utilisateur via la Service Role Key
      console.log("Suppression effective de l'utilisateur:", userId);
      const { error: deleteError } = await adminSupabase.auth.admin.deleteUser(userId);

      if (deleteError) {
        console.error("Erreur Supabase Admin Delete:", deleteError.message);
        return res.status(400).json({ 
          error: `Erreur Supabase: ${deleteError.message}`,
          details: deleteError
        });
      }

      console.log("Utilisateur supprimé avec succès");
      res.json({ success: true });
    } catch (err: any) {
      console.error("Erreur serveur delete-user:", err);
      res.status(500).json({ 
        error: `Erreur interne serveur: ${err.message}`,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
      });
    }
  });

  // API: Invitation d'utilisateur (nécessite SUPABASE_SERVICE_ROLE_KEY)
  app.post("/api/admin/invite-user", async (req, res) => {
    const { email, full_name, team_role } = req.body;
    const authHeader = req.headers.authorization;

    if (!email) {
      return res.status(400).json({ error: "L'email est requis" });
    }

    try {
      const supabaseUrl = process.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

      if (!supabaseUrl || !supabaseServiceKey) {
        return res.status(500).json({ error: "Configuration serveur incomplète" });
      }

      const clientSupabase = createClient(supabaseUrl, supabaseAnonKey!);
      const token = authHeader?.replace("Bearer ", "");
      
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
        return res.status(403).json({ error: "Accès refusé : Vous devez être administrateur." });
      }

      const { data: inviteData, error: inviteError } = await adminSupabase.auth.admin.inviteUserByEmail(email, {
        data: {
          full_name,
          team_role
        },
        redirectTo: 'https://factyapp.logonova.site/auth'
      });

      if (inviteError) {
        return res.status(400).json({ error: inviteError.message });
      }

      res.json({ success: true, user: inviteData.user });
    } catch (err: any) {
      res.status(500).json({ error: `Erreur interne serveur: ${err.message}` });
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
