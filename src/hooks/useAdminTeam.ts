import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'
import { useState, useEffect, useCallback } from 'react'

interface TeamMember {
  id: string
  email: string
  full_name: string
  role: string
  status: 'pending' | 'active' | 'suspended'
  last_seen_at: string | null
  created_at: string
}

export function useAdminTeam() {
  const { user } = useAuth()
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)

  const fetchMembers = useCallback(async () => {
    setLoading(true)
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData.session?.access_token

      if (!token) {
        setMembers([])
        return
      }

      const response = await fetch('/api/get-team-members', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des membres')
      }

      const data = await response.json()
      setMembers(data.members || [])
    } catch (error) {
      console.error('Fetch members error:', error)
      setMembers([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMembers()
  }, [fetchMembers])

  const inviteMember = async (data: {
    email: string
    full_name: string
    role: string
  }) => {
    // 1. Vérifier si l'utilisateur existe déjà
    const { data: existingMember } = await supabase
      .from('team_members')
      .select('id, status')
      .eq('email', data.email)
      .single()

    if (existingMember) {
      if (existingMember.status === 'active') {
        throw new Error("Cet utilisateur fait déjà partie de l'équipe.")
      } else {
        // Mettre à jour l'invitation existante
        const { error: updateError } = await supabase
          .from('team_members')
          .update({
            full_name: data.full_name,
            role: data.role,
            invited_by: user?.id,
            status: 'pending'
          })
          .eq('id', existingMember.id)
          
        if (updateError) throw updateError
      }
    } else {
      // Insérer dans team_members
      const { error: insertError } = await supabase
        .from('team_members')
        .insert({
          email: data.email,
          full_name: data.full_name,
          role: data.role,
          invited_by: user?.id,
          status: 'pending'
        })

      if (insertError) throw insertError
    }

    // 2. Inviter via l'API serveur (qui utilise la Service Role Key)
    const { data: sessionData } = await supabase.auth.getSession()
    const token = sessionData.session?.access_token

    if (!token) throw new Error("Non authentifié")

    const response = await fetch('/api/invite-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        email: data.email,
        full_name: data.full_name,
        team_role: data.role
      })
    })

    const responseData = await response.json()

    if (!response.ok) {
      throw new Error(responseData.error || "Erreur lors de l'envoi de l'invitation")
    }

    // 3. Logger
    await supabase
      .from('audit_logs')
      .insert({
        user_id: user?.id,
        action: 'team.member_invited',
        entity_type: 'team',
        metadata: {
          email: data.email,
          role: data.role
        }
      })

    await fetchMembers()
  }

  const suspendMember = async (id: string, email: string) => {
    await supabase
      .from('team_members')
      .update({ status: 'suspended' })
      .eq('id', id)

    await supabase
      .from('profiles')
      .update({ is_suspended: true })
      .eq('email', email)

    await fetchMembers()
  }

  const reactivateMember = async (id: string, email: string) => {
    await supabase
      .from('team_members')
      .update({ status: 'active' })
      .eq('id', id)

    await supabase
      .from('profiles')
      .update({ is_suspended: false })
      .eq('email', email)

    await fetchMembers()
  }

  const removeMember = async (id: string, email: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token

      if (!token) throw new Error("Non authentifié")

      const response = await fetch('/api/delete-team-member', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ memberId: id, email })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erreur lors de la suppression")
      }

      await fetchMembers()
    } catch (err: any) {
      console.error('Error removeMember:', err)
      throw err
    }
  }

  return {
    members,
    loading,
    inviteMember,
    suspendMember,
    reactivateMember,
    removeMember,
    refetch: fetchMembers
  }
}
