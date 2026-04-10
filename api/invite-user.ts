import { createClient } from '@supabase/supabase-js'
import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { email, full_name, team_role } = req.body
  const authHeader = req.headers.authorization

  if (!email) {
    return res.status(400).json({ error: 'Email requis' })
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL!
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  if (!supabaseUrl || !supabaseServiceKey) {
    return res.status(500).json({ error: 'Configuration incomplète' })
  }

  try {
    const clientSupabase = createClient(supabaseUrl, supabaseAnonKey)
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return res.status(401).json({ error: 'Non authentifié' })
    }

    const { data: { user }, error: authError } = await clientSupabase.auth.getUser(token)

    if (authError || !user) {
      return res.status(401).json({ error: 'Non authentifié' })
    }

    const adminSupabase = createClient(supabaseUrl, supabaseServiceKey, {
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

    const { data: inviteData, error: inviteError } = await adminSupabase.auth.admin.inviteUserByEmail(email, {
      data: { full_name, team_role },
      redirectTo: 'https://factyapp.logonova.site/auth'
    })

    if (inviteError) {
      return res.status(400).json({ error: inviteError.message })
    }

    return res.status(200).json({ success: true, user: inviteData.user })
  } catch (err: any) {
    return res.status(500).json({ error: err.message })
  }
}
