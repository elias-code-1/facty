import { createClient } from '@supabase/supabase-js'
import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { userId } = req.body
  const authHeader = req.headers.authorization

  if (!userId) {
    return res.status(400).json({ error: 'userId est requis' })
  }

  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL!
    const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    if (!supabaseUrl || !supabaseServiceKey) {
      return res.status(500).json({ error: 'Configuration incomplète' })
    }

    // 1. Vérifier que l'appelant est admin
    const clientSupabase = createClient(supabaseUrl, supabaseAnonKey)
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return res.status(401).json({ error: 'Non authentifié' })
    }

    const { data: { user }, error: authError } = await clientSupabase.auth.getUser(token)

    if (authError || !user) {
      return res.status(401).json({ error: 'Non authentifié' })
    }

    // 2. Initialiser le client Admin
    const adminSupabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })

    // 3. Vérifier le rôle admin
    const { data: profile } = await adminSupabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return res.status(403).json({ error: 'Accès refusé' })
    }

    // 4. Supprimer l'utilisateur
    const { error: deleteError } = await adminSupabase.auth.admin.deleteUser(userId)

    if (deleteError) {
      return res.status(400).json({ error: deleteError.message })
    }

    return res.status(200).json({ success: true })
  } catch (err: any) {
    return res.status(500).json({ error: err.message })
  }
}
