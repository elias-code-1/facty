import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// --- Rate Limiting (In-Memory per Lambda Instance) ---
const rateLimitCache = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(ip: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const record = rateLimitCache.get(ip);

  if (!record) {
    rateLimitCache.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (now > record.resetTime) {
    rateLimitCache.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= limit) {
    return false;
  }

  record.count += 1;
  return true;
}

// --- Auth Utilities ---
export function extractToken(req: VercelRequest): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || typeof authHeader !== 'string') return null;
  
  const parts = authHeader.split(' ');
  if (parts.length === 2 && parts[0] === 'Bearer') {
    return parts[1];
  }
  return null;
}

export async function verifyAdmin(token: string) {
  const supabaseUrl = process.env.VITE_SUPABASE_URL!;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
    throw new Error('SERVER_CONFIG_ERROR');
  }

  // 1. Verify token validity and get user using anon key
  const clientSupabase = createClient(supabaseUrl, supabaseAnonKey);
  const { data: { user }, error: authError } = await clientSupabase.auth.getUser(token);

  if (authError || !user) {
    throw new Error('UNAUTHORIZED');
  }

  // 2. Verify admin role using service key
  const adminSupabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  const { data: profile, error: profileError } = await adminSupabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileError || profile?.role !== 'admin') {
    throw new Error('FORBIDDEN');
  }

  return { user, adminSupabase };
}

// --- Error Handling ---
export function handleError(res: VercelResponse, error: unknown) {
  console.error('[API Error]', error); // Log for internal monitoring

  if (error instanceof Error) {
    if (error.message === 'UNAUTHORIZED') {
      return res.status(401).json({ error: 'Non authentifié' });
    }
    if (error.message === 'FORBIDDEN') {
      return res.status(403).json({ error: 'Accès refusé' });
    }
    if (error.message === 'SERVER_CONFIG_ERROR') {
      return res.status(500).json({ error: 'Erreur de configuration serveur' });
    }
    
    // Zod validation errors
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Données invalides', details: JSON.parse(error.message) });
    }
  }

  // Generic fallback for production to avoid leaking sensitive info
  return res.status(500).json({ error: 'Une erreur interne est survenue' });
}
