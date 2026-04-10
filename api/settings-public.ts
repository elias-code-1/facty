import { createClient } from '@supabase/supabase-js'
import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return res.json({ free_plan_invoice_limit: '999999' })
    }

    const adminSupabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })

    const { data, error } = await adminSupabase
      .from('platform_settings')
      .select('key, value')
      .in('key', ['free_plan_invoice_limit'])

    if (error) throw error

    const settings = data.reduce((acc: any, item) => {
      acc[item.key] = item.value
      return acc
    }, {})

    return res.json(settings)
  } catch (err: any) {
    console.error("Erreur récupération settings publics:", err)
    return res.json({ free_plan_invoice_limit: '999999' })
  }
}
