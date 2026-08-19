import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { status, transactionId, reason } = req.body;
  const token = req.headers.authorization?.split('Bearer ')[1];

  if (!token) {
    return res.status(400).json({ error: 'Missing token' });
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  // 1. Authenticate user
  const authClient = createClient(supabaseUrl, process.env.VITE_SUPABASE_ANON_KEY || '', {
    global: { headers: { Authorization: `Bearer ${token}` } }
  });

  const { data: { user }, error: authError } = await authClient.auth.getUser();

  if (authError || !user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // 2. Insert into payments
  const adminClient = createClient(supabaseUrl, serviceKey);

  const { error: insertError } = await adminClient
    .from('payments')
    .insert({
      user_id: user.id,
      amount: 2000,
      currency: 'XOF',
      transaction_id: transactionId ?? null,
      status: status || 'failed',
      failure_reason: reason ?? 'Annulé ou refusé'
    });

  if (insertError) {
    console.error('Error inserting failed payment:', insertError);
    return res.status(500).json({ error: 'Erreur lors de l\'enregistrement' });
  }

  return res.status(200).json({ success: true });
}
