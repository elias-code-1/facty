import type {
  VercelRequest,
  VercelResponse
} from '@vercel/node'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'

const ALLOWED_KEYS = [
  'maintenance_enabled',
  'maintenance_title',
  'maintenance_message',
  'feature_pdf_export',
  'feature_print',
  'feature_csv_export',
  'feature_clients',
  'feature_invoice_share',
  'feature_recurring',
  'free_plan_invoice_limit',
  'admin_online',
  'registrations_enabled',
]

const schema = z.object({
  key: z.string().refine(
    k => ALLOWED_KEYS.includes(k),
    { message: 'Clé non autorisée' }
  ),
  value: z.string().max(5000),
})

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed'
    })
  }

  const supabaseUrl =
    process.env.VITE_SUPABASE_URL
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY
  const anonKey =
    process.env.VITE_SUPABASE_ANON_KEY

  if (!supabaseUrl || !serviceKey ||
    !anonKey) {
    return res.status(500).json({
      error: 'Configuration serveur manquante'
    })
  }

  // Vérifier le token admin
  const authHeader = req.headers.authorization
  const token = authHeader?.replace(
    'Bearer ', ''
  )

  if (!token) {
    return res.status(401).json({
      error: 'Non authentifié'
    })
  }

  const clientSupabase = createClient(
    supabaseUrl, anonKey,
    { auth: {
      autoRefreshToken: false,
      persistSession: false
    }}
  )

  const { data: { user }, error: authError } =
    await clientSupabase.auth.getUser(token)

  if (authError || !user) {
    return res.status(401).json({
      error: 'Token invalide'
    })
  }

  // Vérifier rôle admin
  const adminSupabase = createClient(
    supabaseUrl, serviceKey,
    { auth: {
      autoRefreshToken: false,
      persistSession: false
    }}
  )

  const { data: profile } =
    await adminSupabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

  if (profile?.role !== 'admin') {
    return res.status(403).json({
      error: 'Accès refusé'
    })
  }

  // Valider les données
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({
      error: parsed.error.errors[0].message
    })
  }

  const { key, value } = parsed.data

  // Mettre à jour le paramètre
  const { error: updateError } =
    await adminSupabase
      .from('platform_settings')
      .update({
        value,
        updated_at: new Date().toISOString()
      })
      .eq('key', key)

  if (updateError) {
    return res.status(500).json({
      error: 'Erreur lors de la mise à jour'
    })
  }

  // Logger l'action
  await adminSupabase
    .from('audit_logs')
    .insert({
      user_id: user.id,
      action: 'platform.setting_updated',
      entity_type: 'platform_settings',
      metadata: { key, value }
    })

  return res.status(200).json({
    success: true,
    key,
    value
  })
}
