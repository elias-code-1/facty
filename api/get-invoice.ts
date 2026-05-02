import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  const token = req.headers.authorization?.split('Bearer ')[1];
  
  if (!token || !id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Missing token or id' });
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY || '';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  // 1. Authenticate user
  const authClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } }
  });

  const { data: { user }, error: authError } = await authClient.auth.getUser();
  if (authError || !user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // 2. Fetch using service role to bypass RLS for invoice_items
  const adminClient = createClient(supabaseUrl, serviceKey);

  // We explicitly filter by user_id to ensure safety
  const { data, error } = await adminClient
    .from('invoices')
    .select('*, items:invoice_items(*), clients(*)')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ data });
}
