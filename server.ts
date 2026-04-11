import express from "express";
import { createServer as createViteServer } from "vite";
import { createClient } from "@supabase/supabase-js";
import path from "path";
import { fileURLToPath } from "url";
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Headers sécurité
  app.use(helmet());

  // CORS restrictif
  app.use((req, res, next) => {
    const allowed = [
      'https://factyapp.logonova.site',
      'https://factyapp.com'
    ];
    const origin = req.headers.origin;
    if (origin && allowed.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }
    next();
  });

  app.use(express.json());

  // Serve public directory (sitemap.xml, robots.txt, etc.)
  app.use(express.static(path.join(__dirname, "public")));

  // Rate limiting global
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 min
    max: 100,
    message: { error: 'Trop de requêtes' }
  });
  app.use('/api/', limiter);

  // Rate limiting strict pour auth
  const authLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 5
  });
  app.use('/api/admin/', authLimiter);

  // Helper pour vérifier si l'utilisateur est admin
  const verifyAdmin = async (req: express.Request, res: express.Response) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];

    if (!token) {
      res.status(401).json({ error: "Non authentifié" });
      return null;
    }

    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey || !supabaseAnonKey) {
      res.status(500).json({ error: "Configuration serveur incomplète" });
      return null;
    }

    const clientSupabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data: { user }, error: authError } = await clientSupabase.auth.getUser(token);

    if (authError || !user) {
      res.status(401).json({ error: "Non authentifié" });
      return null;
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
      res.status(403).json({ error: "Accès refusé" });
      return null;
    }

    return { adminSupabase, user };
  };

  // API: Récupérer les paramètres publics
  app.get("/api/settings-public", async (req, res) => {
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

      const settings = data.reduce(
        (acc: Record<string, string>, item) => {
          acc[item.key] = item.value;
          return acc;
        },
        {} as Record<string, string>
      );

      res.json(settings);
    } catch (err: any) {
      console.error("Erreur récupération settings publics:", err);
      res.status(500).json({ error: 'DATABASE_ERROR' });
    }
  });

  // API: Liste des membres de l'équipe
  app.get("/api/admin/team-members", async (req, res) => {
    const admin = await verifyAdmin(req, res);
    if (!admin) return;

    try {
      const { data: members, error } = await admin.adminSupabase
        .from('team_members')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      res.json({ members });
    } catch (err) {
      console.error("Erreur team-members:", err);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  // API: Suppression d'utilisateur (Auth + Profile)
  app.post("/api/admin/delete-user", async (req, res) => {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: "userId requis" });

    const admin = await verifyAdmin(req, res);
    if (!admin) return;

    try {
      const { error: deleteError } = await admin.adminSupabase.auth.admin.deleteUser(userId);
      if (deleteError) throw deleteError;
      res.json({ success: true });
    } catch (err) {
      console.error("Erreur delete-user:", err);
      res.status(400).json({ error: "Impossible de supprimer l'utilisateur" });
    }
  });

  // API: Suppression d'un membre de l'équipe
  app.post("/api/admin/delete-team-member", async (req, res) => {
    const { memberId, email } = req.body;
    if (!memberId || !email) return res.status(400).json({ error: "memberId et email requis" });

    const admin = await verifyAdmin(req, res);
    if (!admin) return;

    try {
      // 1. Trouver l'ID utilisateur via l'email
      const { data: profile, error: profileError } = await admin.adminSupabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();

      // 2. Supprimer de Auth si trouvé
      if (!profileError && profile?.id) {
        await admin.adminSupabase.auth.admin.deleteUser(profile.id);
      }

      // 3. Supprimer de team_members
      const { error: deleteError } = await admin.adminSupabase
        .from('team_members')
        .delete()
        .eq('id', memberId);

      if (deleteError) throw deleteError;

      res.json({ success: true });
    } catch (err) {
      console.error("Erreur delete-team-member:", err);
      res.status(500).json({ error: "Erreur lors de la suppression" });
    }
  });

  // API: Invitation d'utilisateur
  app.post("/api/admin/invite-user", async (req, res) => {
    const inviteSchema = z.object({
      email: z.string().email(),
      full_name: z.string().min(2).max(100),
      team_role: z.enum([
        'manager', 'landing_editor',
        'chat_agent', 'user_manager',
        'support_agent', 'member'
      ]).optional().default('member')
    });

    const parsed = inviteSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Données invalides' });

    const admin = await verifyAdmin(req, res);
    if (!admin) return;

    const { email, full_name, team_role } = parsed.data;
    const redirectUrl = process.env.VITE_APP_URL || 'https://factyapp.logonova.site';

    try {
      const { data: inviteData, error: inviteError } = await admin.adminSupabase.auth.admin.inviteUserByEmail(email, {
        data: {
          full_name: full_name?.toString() || '',
          team_role: team_role?.toString() || 'member'
        },
        redirectTo: `${redirectUrl}/auth`
      });

      if (inviteError) throw inviteError;
      res.json({ success: true, user: inviteData.user });
    } catch (err) {
      console.error("Erreur invite-user:", err);
      res.status(400).json({ error: "Impossible d'envoyer l'invitation" });
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
