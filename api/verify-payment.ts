import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { transactionId } = req.body;
  const token = req.headers.authorization?.split('Bearer ')[1];
  
  if (!token || !transactionId) {
    return res.status(400).json({ error: 'Missing token or transactionId' });
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  const kkiapayPrivateKey = process.env.KKIAPAY_PRIVATE_KEY || '';

  if (!kkiapayPrivateKey) {
    return res.status(500).json({ error: 'KKIAPAY_PRIVATE_KEY is not configured on the server.' });
  }

  // 1. Authenticate user
  const authClient = createClient(supabaseUrl, process.env.VITE_SUPABASE_ANON_KEY || '', {
    global: { headers: { Authorization: `Bearer ${token}` } }
  });

  const { data: { user }, error: authError } = await authClient.auth.getUser();
  if (authError || !user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // 2. Verify payment with KKiaPay
  const isSandbox = kkiapayPrivateKey.startsWith('test_') || process.env.VITE_KKIAPAY_SANDBOX === 'true';
  const kkiapayUrl = isSandbox 
    ? 'https://api-sandbox.kkiapay.me/api/v1/transactions/status'
    : 'https://api.kkiapay.me/api/v1/transactions/status';

  try {
    const kkiapayResponse = await fetch(kkiapayUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'x-api-key': kkiapayPrivateKey
      },
      body: JSON.stringify({ transactionId })
    });

    const paymentData = await kkiapayResponse.json();
    
    // DEBUG - à retirer après diagnostic
    console.log('KKiaPay verify — URL appelée:', kkiapayUrl);
    console.log('KKiaPay verify — HTTP status:', kkiapayResponse.status);
    console.log('KKiaPay verify — Réponse complète:', JSON.stringify(paymentData));

    // 3. Update database using service role (bypass RLS)
    const adminClient = createClient(supabaseUrl, serviceKey);

    if (paymentData.status !== 'SUCCESS') {
      // Log the failure
      await adminClient.from('payments').insert({
        user_id: user.id,
        amount: paymentData.amount ?? 2000,
        currency: 'XOF',
        transaction_id: transactionId,
        status: 'failed',
        failure_reason: paymentData.reason ?? null
      });
      return res.status(400).json({ 
        error: 'Le paiement n\'a pas été validé par KKiaPay.',
        debug: paymentData
      });
    }

    // Verify the amount is correct (ex: 2000 FCFA)
    if (paymentData.amount < 2000) {
      return res.status(400).json({ error: 'Le montant payé est insuffisant.' });
    }

    // Check if transaction already exists to prevent double-crediting
    const { data: existingPayment } = await adminClient
      .from('payments')
      .select('id')
      .eq('transaction_id', transactionId)
      .single();

    if (existingPayment) {
      return res.status(400).json({ error: 'Cette transaction a déjà été traitée.' });
    }

    // Insert payment record
    const { error: insertError } = await adminClient
      .from('payments')
      .insert({
        user_id: user.id,
        amount: paymentData.amount,
        currency: 'XOF',
        transaction_id: transactionId,
        status: 'success',
        payment_method: paymentData.source ?? null,
        country: paymentData.country ?? null,
        fees: paymentData.fees ?? null
      });

    if (insertError) {
      console.error('Error inserting payment:', insertError);
      return res.status(500).json({ error: 'Erreur lors de l\'enregistrement du paiement.' });
    }

    // Update user profile to premium
    const { error: updateError } = await adminClient
      .from('profiles')
      .update({ is_premium: true })
      .eq('id', user.id);

    if (updateError) {
      console.error('Error updating profile:', updateError);
      return res.status(500).json({ error: 'Erreur lors de l\'activation du compte premium.' });
    }

    return res.status(200).json({ success: true, message: 'Compte premium activé avec succès !' });

  } catch (err: any) {
    console.error('KKiaPay verification error:', err);
    return res.status(500).json({ error: 'Échec de la vérification du paiement.' });
  }
}
