import type { VercelRequest, VercelResponse } from '@vercel/node'
import { z } from 'zod'
import { checkRateLimit, extractToken, verifyAdmin, handleError } from './_utils'

const deleteSchema = z.object({
  memberId: z.string().uuid("Format d'ID invalide"),
  email: z.string().email("Format d'email invalide")
})

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Rate Limiting: Max 10 deletions per minute per IP
  const clientIp = req.headers['x-forwarded-for']?.toString() || 'unknown'
  if (!checkRateLimit(`delete_team_${clientIp}`, 10, 60000)) {
    return res.status(429).json({ error: 'Trop de requêtes, veuillez patienter' })
  }

  try {
    const validatedData = deleteSchema.parse(req.body)

    const token = extractToken(req)
    if (!token) throw new Error('UNAUTHORIZED')

    const { adminSupabase } = await verifyAdmin(token)

    // 4. Supprimer de team_members
    const { error: dbError } = await adminSupabase
      .from('team_members')
      .delete()
      .eq('id', validatedData.memberId)

    if (dbError) {
      console.error('[Supabase DB Delete Error]', dbError)
      return res.status(500).json({ error: 'Erreur lors de la suppression de la base de données' })
    }

    // 5. Chercher l'utilisateur par email pour suppression complète
    const { data: userData } = await adminSupabase.auth.admin.listUsers()
    const targetUser = userData.users.find(u => u.email === validatedData.email)

    if (targetUser) {
      const { error: deleteError } = await adminSupabase.auth.admin.deleteUser(targetUser.id)
      if (deleteError) {
        console.warn('[Supabase Auth Delete Error] (peut-être déjà supprimé):', deleteError)
      }
    }

    return res.status(200).json({ success: true })
  } catch (err) {
    return handleError(res, err)
  }
}
