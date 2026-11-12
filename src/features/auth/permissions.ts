import type { AccountProfile, ProfessionalKind, Role, Session } from './types'

/**
 * Rôles attribués selon le profil choisi à l'inscription :
 * - propriétaire gestionnaire : bailleur et gestionnaire ;
 * - propriétaire mandant : bailleur ;
 * - agence : admin de son workspace et gestionnaire ;
 * - mandataire indépendant : gestionnaire.
 */
export function rolesForProfile(profile: AccountProfile, kind?: ProfessionalKind): Role[] {
  switch (profile) {
    case 'ownerManager':
      return ['landlord', 'property_manager']
    case 'ownerPrincipal':
      return ['landlord']
    case 'professional':
      return kind === 'agent' ? ['property_manager'] : ['admin', 'property_manager']
  }
}

export const hasRole = (session: Session | null, role: Role) =>
  Boolean(session?.roles.includes(role))

/** Membre du workspace d'une agence (admin ou gestionnaire invité). */
export const isWorkspaceMember = (session: Session | null) => Boolean(session?.workspaceId)

/** Module Bailleurs : admins et gestionnaires d'une agence. */
export const canManageLandlords = (session: Session | null) =>
  isWorkspaceMember(session) && (hasRole(session, 'admin') || hasRole(session, 'property_manager'))

/** Module Workspace : admins d'une agence. */
export const canManageWorkspace = (session: Session | null) =>
  isWorkspaceMember(session) && hasRole(session, 'admin')

/** Les rôles affichés, dans l'ordre de `roles` (du plus étendu au plus restreint). */
export const sortRoles = (list: Role[], order: readonly Role[]) =>
  [...list].sort((a, b) => order.indexOf(a) - order.indexOf(b))
