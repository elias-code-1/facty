import { createClient } from '@supabase/supabase-js'
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { checkRateLimit, handleError } from './_utils'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Rate Limiting: Max 60 requests per minute per IP for public settings
  const clientIp = req.headers['x-forwarded-for']?.toString() || 'unknown'
  if (!checkRateLimit(`settings_${clientIp}`, 60, 60000)) {
    return res.status(429).json({ error: 'Trop de requêtes, veuillez patienter' })
  }

  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('SERVER_CONFIG_ERROR')
    }

    const adminSupabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })

    const { data, error } = await adminSupabase
      .from('platform_settings')
      .select('key, value')
      .in('key', ['free_plan_invoice_limit'])

    if (error) {
      console.error('[Supabase DB Error]', error)
      throw new Error('DATABASE_ERROR')
    }

    const settings = data.reduce((acc: any, item) => {
      acc[item.key] = item.value
      return acc
    }, {})

    return res.json(settings)
  } catch (err) {
    return handleError(res, err)
  }
}
