import type { VercelRequest, VercelResponse } from '@vercel/node'
import { checkRateLimit, extractToken, verifyAdmin, handleError } from './_utils'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Rate Limiting: Max 30 requests per minute per IP
  const clientIp = req.headers['x-forwarded-for']?.toString() || 'unknown'
  if (!checkRateLimit(`get_team_${clientIp}`, 30, 60000)) {
    return res.status(429).json({ error: 'Trop de requêtes, veuillez patienter' })
  }

  try {
    const token = extractToken(req)
    if (!token) throw new Error('UNAUTHORIZED')

    const { adminSupabase } = await verifyAdmin(token)

    const { data: members, error: membersError } = await adminSupabase
      .from('team_members')
      .select('*')
      .order('created_at', { ascending: false })

    if (membersError) {
      console.error('[Supabase DB Error]', membersError)
      return res.status(500).json({ error: 'Erreur lors de la récupération des membres' })
    }

    return res.status(200).json({ members })
  } catch (err) {
    return handleError(res, err)
  }
}
