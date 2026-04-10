import { createClient } from '@supabase/supabase-js'
import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const authHeader = req.headers.authorization

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

    const { data: members, error: membersError } = await adminSupabase
      .from('team_members')
      .select('*')
      .order('created_at', { ascending: false })

    if (membersError) {
      return res.status(400).json({ error: membersError.message })
    }

    return res.status(200).json({ members })
  } catch (err: any) {
    return res.status(500).json({ error: err.message })
  }
}
