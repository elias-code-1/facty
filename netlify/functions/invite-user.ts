import { createClient } from '@supabase/supabase-js'

export const handler = async (event: any) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405,
      body: JSON.stringify({
        error: 'Method not allowed'
      })
    }
  }

  const { email, full_name, team_role } =
    JSON.parse(event.body ?? '{}')
  const authHeader =
    event.headers.authorization

  if (!email) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: 'Email requis'
      })
    }
  }

  const supabaseUrl =
    process.env.VITE_SUPABASE_URL!
  const supabaseAnonKey =
    process.env.VITE_SUPABASE_ANON_KEY!
  const supabaseServiceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY!

  if (!supabaseUrl || !supabaseServiceKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Configuration incomplète'
      })
    }
  }

  try {
    // Vérifier le token admin
    const clientSupabase = createClient(
      supabaseUrl, supabaseAnonKey
    )
    const token = authHeader
      ?.replace('Bearer ', '')

    if (!token) {
      return {
        statusCode: 401,
        body: JSON.stringify({
          error: 'Non authentifié'
        })
      }
    }

    const { data: { user }, error: authError } =
      await clientSupabase.auth.getUser(token)

    if (authError || !user) {
      return {
        statusCode: 401,
        body: JSON.stringify({
          error: 'Non authentifié'
        })
      }
    }

    // Vérifier rôle admin
    const adminSupabase = createClient(
      supabaseUrl, supabaseServiceKey,
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
      return {
        statusCode: 403,
        body: JSON.stringify({
          error: 'Accès refusé'
        })
      }
    }

    // Envoyer invitation
    const { data: inviteData,
      error: inviteError } =
      await adminSupabase.auth.admin
        .inviteUserByEmail(email, {
          data: { full_name, team_role },
          redirectTo:
            'https://facty.netlify.app/auth'
        })

    if (inviteError) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: inviteError.message
        })
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        user: inviteData.user
      })
    }
  } catch (err: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: err.message
      })
    }
  }
}
