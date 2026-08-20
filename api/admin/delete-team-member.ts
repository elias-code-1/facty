import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { memberId, email } = req.body || {}

  if (!memberId || !email) {
    return res.status(400).json({ error: 'memberId et email requis' })
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY

  if (!supabaseUrl || !serviceKey || !anonKey) {
    return res.status(500).json({ error: 'Configuration serveur manquante' })
  }

  const authHeader = req.headers.authorization
  const token = authHeader?.replace('Bearer ', '')

  if (!token) {
    return res.status(401).json({ error: 'Non authentifié' })
  }

  const clientSupabase = createClient(supabaseUrl, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })

  const { data: { user }, error: authError } = await clientSupabase.auth.getUser(token)

  if (authError || !user) {
    return res.status(401).json({ error: 'Token invalide' })
  }

  const adminSupabase = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })

  const { data: profile } = await adminSupabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return res.status(403).json({ error: 'Accès refusé' })
  }

  const { error: deleteError } = await adminSupabase
    .from('team_members')
    .delete()
    .eq('id', memberId)

  if (deleteError) {
    return res.status(500).json({ error: deleteError.message })
  }

  const { error: updateError } = await adminSupabase
    .from('profiles')
    .update({ team_role: null })
    .eq('email', email)

  if (updateError) {
    return res.status(500).json({ error: updateError.message })
  }

  return res.status(200).json({ success: true })
}
