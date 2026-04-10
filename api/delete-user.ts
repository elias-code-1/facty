import type { VercelRequest, VercelResponse } from '@vercel/node'
import { z } from 'zod'
import { checkRateLimit, extractToken, verifyAdmin, handleError } from './_utils'

const deleteUserSchema = z.object({
  userId: z.string().uuid("Format d'ID invalide")
})

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Rate Limiting: Max 10 deletions per minute per IP
  const clientIp = req.headers['x-forwarded-for']?.toString() || 'unknown'
  if (!checkRateLimit(`delete_user_${clientIp}`, 10, 60000)) {
    return res.status(429).json({ error: 'Trop de requêtes, veuillez patienter' })
  }

  try {
    const validatedData = deleteUserSchema.parse(req.body)

    const token = extractToken(req)
    if (!token) throw new Error('UNAUTHORIZED')

    const { adminSupabase } = await verifyAdmin(token)

    // 4. Supprimer l'utilisateur
    const { error: deleteError } = await adminSupabase.auth.admin.deleteUser(validatedData.userId)

    if (deleteError) {
      console.error('[Supabase Auth Delete Error]', deleteError)
      return res.status(400).json({ error: "Impossible de supprimer l'utilisateur" })
    }

    return res.status(200).json({ success: true })
  } catch (err) {
    return handleError(res, err)
  }
}
