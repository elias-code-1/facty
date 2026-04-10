import type { VercelRequest, VercelResponse } from '@vercel/node'
import { z } from 'zod'
import { checkRateLimit, extractToken, verifyAdmin, handleError } from './_utils'

const inviteSchema = z.object({
  email: z.string().email("Format d'email invalide"),
  full_name: z.string().min(2, "Le nom doit contenir au moins 2 caractères").max(100),
  team_role: z.string().min(1, "Le rôle est requis")
})

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Rate Limiting: Max 5 invitations per minute per IP
  const clientIp = req.headers['x-forwarded-for']?.toString() || 'unknown'
  if (!checkRateLimit(`invite_${clientIp}`, 5, 60000)) {
    return res.status(429).json({ error: 'Trop de requêtes, veuillez patienter' })
  }

  try {
    // 1. Validation des entrées
    const validatedData = inviteSchema.parse(req.body)

    // 2. Extraction et vérification du token
    const token = extractToken(req)
    if (!token) throw new Error('UNAUTHORIZED')

    // 3. Vérification des droits admin
    const { adminSupabase } = await verifyAdmin(token)

    // 4. Détermination de l'URL de redirection
    const redirectUrl = process.env.VITE_APP_URL || 'https://factyapp.logonova.site'

    // 5. Envoi de l'invitation
    const { data: inviteData, error: inviteError } = await adminSupabase.auth.admin.inviteUserByEmail(validatedData.email, {
      data: { 
        full_name: validatedData.full_name, 
        team_role: validatedData.team_role 
      },
      redirectTo: `${redirectUrl}/auth`
    })

    if (inviteError) {
      // On ne renvoie pas l'erreur brute de Supabase en production, on la logge
      console.error('[Supabase Invite Error]', inviteError)
      return res.status(400).json({ error: "Impossible d'envoyer l'invitation" })
    }

    return res.status(200).json({ success: true, user: inviteData.user })
  } catch (err) {
    return handleError(res, err)
  }
}
