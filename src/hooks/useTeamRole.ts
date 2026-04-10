import { useAuth } from './useAuth'
import { useProfile } from './useProfile'
import { TEAM_ROLES } from '../data/teamRoles'

export function useTeamRole() {
  const { user } = useAuth()
  const { profile } = useProfile(user)

  // Si admin → pas de restriction
  if (profile?.role === 'admin') {
    return {
      isTeamMember: false,
      teamRole: null,
      canAccess: () => true,
      permissions: []
    }
  }

  const teamRole = profile?.team_role ?? null

  const permissions = teamRole
    ? TEAM_ROLES[teamRole as keyof typeof TEAM_ROLES]?.pages ?? []
    : []

  const canAccess = (path: string) => {
    if (!teamRole) return false
    return permissions.some(
      p => path.startsWith(p)
    )
  }

  return {
    isTeamMember: !!teamRole,
    teamRole,
    canAccess,
    permissions
  }
}
