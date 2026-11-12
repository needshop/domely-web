import { useMemo, useSyncExternalStore } from 'react'
import { todayIso } from '@/lib/dates'
import { INVITATION_TTL_MS, RESET_TOKEN_TTL_MS } from './constants'
import { AuthError } from './errors'
import { checkOtp, issueOtp } from './otp'
import { canManageLandlords, canManageWorkspace, rolesForProfile } from './permissions'
import { authStore } from './store'
import type { Account, Invitation, NewAccount, Session, Workspace } from './types'
import { generateIdentifier, normalizeEmail, normalizeIdentifier, randomToken } from './utils'

/**
 * Seul point d'accès du module d'authentification. Simulation dans le navigateur : à remplacer
 * par les appels à l'API (`/auth/*`, `/workspaces/*`) sans toucher aux composants.
 */

/** Latence simulée, pour que les états de chargement soient visibles. */
const latency = (ms = 350) => new Promise((resolve) => setTimeout(resolve, ms))

const newId = (prefix: string) => `${prefix}-${randomToken().slice(0, 12)}`
const isTaken = (id: string) => authStore.getAccounts().some((a) => a.identifier === id)
const byContact = (email: string, phone: string) =>
  authStore.findAccount((a) => a.email === normalizeEmail(email) && a.phone === phone)

// — Session et droits —

/** Utilisateur connecté, ou `null`. */
export function useSession(): Session | null {
  return useSyncExternalStore(authStore.subscribe, authStore.getSession)
}

/** Module Bailleurs : admins et gestionnaires d'une agence. */
export function useCanManageLandlords(): boolean {
  return canManageLandlords(useSession())
}

/** Module Workspace : admins d'une agence. */
export function useCanManageWorkspace(): boolean {
  return canManageWorkspace(useSession())
}

export async function login(identifier: string, password: string): Promise<Session> {
  await latency()
  const id = normalizeIdentifier(identifier)
  const account = authStore.findAccount((a) => a.identifier === id)
  if (!account || account.password !== password) throw new AuthError('invalidCredentials')
  if (account.status === 'disabled') throw new AuthError('accountDisabled')
  authStore.setSession(account.id)
  return authStore.getSession()!
}

export async function logout(): Promise<void> {
  authStore.setSession(null)
}

// — Inscription —

/** Contrôle d'unicité avant l'envoi du code (inscription, invitation). */
function assertContactAvailable(email: string, phone: string) {
  if (authStore.findAccount((a) => a.email === normalizeEmail(email)))
    throw new AuthError('emailTaken')
  if (authStore.findAccount((a) => a.phone === phone)) throw new AuthError('phoneTaken')
}

export async function checkContactAvailability(email: string, phone: string): Promise<void> {
  await latency()
  assertContactAvailable(email, phone)
}

/** Envoie un code de vérification par SMS au numéro (international, sans espaces). */
export async function sendOtp(phone: string): Promise<void> {
  await latency()
  issueOtp(phone)
}

export async function verifyOtp(phone: string, code: string): Promise<void> {
  await latency()
  checkOtp(phone, code)
}

/**
 * Crée le compte et renvoie son identifiant de connexion (envoyé aussi par e-mail). Rôles
 * selon le profil ; une agence crée son workspace, dont elle devient l'admin.
 */
export async function registerAccount(data: NewAccount): Promise<Account> {
  await latency(500)
  const email = normalizeEmail(data.email)
  assertContactAvailable(email, data.phone)
  const id = newId('acc')
  const isAgency = data.profile === 'professional' && data.professionalKind === 'agency'
  const workspace: Workspace | undefined = isAgency
    ? {
        id: newId('ws'),
        name: data.agencyName ?? '',
        registrationNumber: data.registrationNumber,
        ownerAccountId: id,
        createdAt: todayIso(),
      }
    : undefined
  if (workspace) authStore.addWorkspace(workspace)
  const account: Account = {
    ...data,
    email,
    id,
    identifier: generateIdentifier(isTaken),
    roles: rolesForProfile(data.profile, data.professionalKind),
    workspaceId: workspace?.id,
    status: 'active',
    // Les justificatifs des professionnels sont contrôlés par l'équipe Domely
    verification: data.profile === 'professional' ? 'pending' : 'verified',
    createdAt: todayIso(),
  }
  authStore.addAccount(account)
  return account
}

// — Récupération et réinitialisation —

/**
 * Récupération (mot de passe ou identifiant oublié) : l'e-mail et le téléphone doivent
 * correspondre au même compte avant l'envoi du code.
 */
export async function startRecovery(email: string, phone: string): Promise<void> {
  await latency()
  if (!byContact(email, phone)) throw new AuthError('accountNotFound')
  issueOtp(phone)
}

/**
 * Après validation du code : génère le lien de réinitialisation (envoyé par e-mail).
 * Le lien est renvoyé pour la démonstration, faute d'envoi d'e-mails.
 */
export async function requestPasswordReset(email: string, phone: string): Promise<string> {
  await latency()
  const account = byContact(email, phone)
  if (!account) throw new AuthError('accountNotFound')
  const token = randomToken()
  authStore.addResetToken({
    token,
    accountId: account.id,
    expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS).toISOString(),
  })
  return `/reset-password?token=${token}`
}

/** Après validation du code : envoie l'identifiant par e-mail (renvoyé pour la démonstration). */
export async function sendIdentifierReminder(email: string, phone: string): Promise<string> {
  await latency()
  const account = byContact(email, phone)
  if (!account) throw new AuthError('accountNotFound')
  return account.identifier
}

const validToken = (token: string) => {
  const entry = authStore.findResetToken(token)
  return entry && new Date(entry.expiresAt).getTime() > Date.now() ? entry : null
}

/** Le lien de réinitialisation est-il encore valable ? (lecture synchrone, sans latence) */
export function isResetTokenValid(token: string | null): boolean {
  return Boolean(token && validToken(token))
}

/** Change le mot de passe ; le lien n'est plus utilisable ensuite. Renvoie l'identifiant. */
export async function resetPassword(token: string, password: string): Promise<string> {
  await latency()
  const entry = validToken(token)
  const account = entry && authStore.findAccount((a) => a.id === entry.accountId)
  if (!entry || !account) throw new AuthError('resetLinkInvalid')
  authStore.updateAccount(account.id, { password })
  authStore.removeResetToken(token)
  return account.identifier
}

// — Workspace d'agence —

export const isInvitationExpired = (invitation: Invitation) =>
  new Date(invitation.expiresAt).getTime() <= Date.now()

const invitationLink = (token: string) => `/invitation?token=${token}`

/** Membre du workspace : compte (actif ou désactivé) ou invitation en attente. */
export type WorkspaceMember =
  | { type: 'account'; account: Account; isOwner: boolean }
  | { type: 'invitation'; invitation: Invitation; expired: boolean }

/** Workspace de l'utilisateur connecté et ses membres (comptes, puis invitations en attente). */
export function useWorkspace(): { workspace: Workspace; members: WorkspaceMember[] } | null {
  const session = useSession()
  const accounts = useSyncExternalStore(authStore.subscribe, authStore.getAccounts)
  const workspaces = useSyncExternalStore(authStore.subscribe, authStore.getWorkspaces)
  const invitations = useSyncExternalStore(authStore.subscribe, authStore.getInvitations)
  return useMemo(() => {
    const workspace = workspaces.find((w) => w.id === session?.workspaceId)
    if (!workspace) return null
    const members: WorkspaceMember[] = [
      ...accounts
        .filter((a) => a.workspaceId === workspace.id)
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
        .map((account) => ({
          type: 'account' as const,
          account,
          isOwner: account.id === workspace.ownerAccountId,
        })),
      ...invitations
        .filter((i) => i.workspaceId === workspace.id && i.status === 'pending')
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .map((invitation) => ({
          type: 'invitation' as const,
          invitation,
          expired: isInvitationExpired(invitation),
        })),
    ]
    return { workspace, members }
  }, [session?.workspaceId, accounts, workspaces, invitations])
}

/** Vérifie que l'utilisateur connecté administre le workspace. */
function requireAdmin(): { session: Session; workspaceId: string } {
  const session = authStore.getSession()
  if (!canManageWorkspace(session) || !session?.workspaceId) throw new AuthError('forbidden')
  return { session, workspaceId: session.workspaceId }
}

export interface InvitationInput {
  firstName: string
  lastName: string
  email: string
  /** Numéro international, sans espaces */
  phone: string
}

/**
 * Invite un gestionnaire : le lien est envoyé par e-mail (renvoyé ici pour la démonstration).
 * E-mail et téléphone ne doivent appartenir ni à un compte ni à une invitation en attente.
 */
export async function inviteMember(input: InvitationInput): Promise<string> {
  await latency()
  const { session, workspaceId } = requireAdmin()
  const email = normalizeEmail(input.email)
  assertContactAvailable(email, input.phone)
  const pending = authStore
    .getInvitations()
    .some(
      (i) =>
        i.status === 'pending' &&
        !isInvitationExpired(i) &&
        (i.email === email || i.phone === input.phone),
    )
  if (pending) throw new AuthError('alreadyInvited')
  const token = randomToken()
  authStore.addInvitation({
    id: newId('inv'),
    token,
    workspaceId,
    firstName: input.firstName.trim(),
    lastName: input.lastName.trim(),
    email,
    phone: input.phone,
    invitedBy: session.accountId,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + INVITATION_TTL_MS).toISOString(),
    status: 'pending',
  })
  return invitationLink(token)
}

/** Renvoie l'invitation : nouveau lien, valable 7 jours ; l'ancien n'est plus utilisable. */
export async function resendInvitation(id: string): Promise<string> {
  await latency()
  requireAdmin()
  const token = randomToken()
  authStore.updateInvitation(id, {
    token,
    expiresAt: new Date(Date.now() + INVITATION_TTL_MS).toISOString(),
  })
  return invitationLink(token)
}

export async function revokeInvitation(id: string): Promise<void> {
  await latency()
  requireAdmin()
  authStore.updateInvitation(id, { status: 'revoked' })
}

/** Désactive ou réactive un membre (jamais son propre compte ni celui du créateur de l'agence). */
export async function setMemberStatus(accountId: string, status: Account['status']): Promise<void> {
  await latency()
  const { session, workspaceId } = requireAdmin()
  const account = authStore.findAccount((a) => a.id === accountId)
  const workspace = authStore.getWorkspaces().find((w) => w.id === workspaceId)
  if (
    !account ||
    account.workspaceId !== workspaceId ||
    account.id === session.accountId ||
    account.id === workspace?.ownerAccountId
  ) {
    throw new AuthError('forbidden')
  }
  authStore.updateAccount(accountId, { status })
}

/** Invitation encore valable pour ce lien, avec l'agence et la personne qui invite. */
export function getInvitation(token: string | null) {
  const invitation = token ? authStore.getInvitations().find((i) => i.token === token) : undefined
  if (!invitation || invitation.status !== 'pending' || isInvitationExpired(invitation)) return null
  const workspace = authStore.getWorkspaces().find((w) => w.id === invitation.workspaceId)
  const inviter = authStore.findAccount((a) => a.id === invitation.invitedBy)
  if (!workspace) return null
  return {
    invitation,
    workspace,
    inviterName: inviter ? `${inviter.firstName} ${inviter.lastName}` : undefined,
  }
}

/**
 * Accepte l'invitation (après validation du téléphone par OTP) : crée le compte du
 * gestionnaire dans le workspace, avec le rôle `property_manager`.
 */
export async function acceptInvitation(token: string, password: string): Promise<Account> {
  await latency(500)
  const found = getInvitation(token)
  if (!found) throw new AuthError('invitationInvalid')
  const { invitation, workspace } = found
  assertContactAvailable(invitation.email, invitation.phone)
  const account: Account = {
    id: newId('acc'),
    identifier: generateIdentifier(isTaken),
    profile: 'professional',
    professionalKind: 'agency',
    roles: ['property_manager'],
    workspaceId: workspace.id,
    status: 'active',
    firstName: invitation.firstName,
    lastName: invitation.lastName,
    email: invitation.email,
    phone: invitation.phone,
    password,
    agencyName: workspace.name,
    documents: [],
    // L'agence est déjà vérifiée : pas de justificatifs pour ses gestionnaires
    verification: 'verified',
    createdAt: todayIso(),
  }
  authStore.addAccount(account)
  authStore.updateInvitation(invitation.id, { status: 'accepted' })
  return account
}
