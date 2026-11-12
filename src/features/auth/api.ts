import { useSyncExternalStore } from 'react'
import { todayIso } from '@/lib/dates'
import { RESET_TOKEN_TTL_MS } from './constants'
import { AuthError } from './errors'
import { checkOtp, issueOtp } from './otp'
import { authStore } from './store'
import type { Account, NewAccount, Session } from './types'
import { generateIdentifier, normalizeEmail, normalizeIdentifier, randomToken } from './utils'

/**
 * Seul point d'accès du module d'authentification. Simulation dans le navigateur : à remplacer
 * par les appels à l'API (`/auth/*`) sans toucher aux composants.
 */

/** Latence simulée, pour que les états de chargement soient visibles. */
const latency = (ms = 350) => new Promise((resolve) => setTimeout(resolve, ms))

const toSession = (a: Account): Session => ({
  accountId: a.id,
  identifier: a.identifier,
  firstName: a.firstName,
  lastName: a.lastName,
  profile: a.profile,
  verification: a.verification,
  professionalKind: a.professionalKind,
  agencyName: a.agencyName,
  startedAt: new Date().toISOString(),
})

const byContact = (email: string, phone: string) =>
  authStore.findAccount((a) => a.email === normalizeEmail(email) && a.phone === phone)

/** Utilisateur connecté, ou `null`. */
export function useSession(): Session | null {
  return useSyncExternalStore(authStore.subscribe, authStore.getSession)
}

/** Compte professionnel (agence, mandataire) : accès au module Bailleurs. */
export function useIsProfessional(): boolean {
  return useSession()?.profile === 'professional'
}

export async function login(identifier: string, password: string): Promise<Session> {
  await latency()
  const id = normalizeIdentifier(identifier)
  const account = authStore.findAccount((a) => a.identifier === id)
  if (!account || account.password !== password) throw new AuthError('invalidCredentials')
  const session = toSession(account)
  authStore.setSession(session)
  return session
}

export async function logout(): Promise<void> {
  authStore.setSession(null)
}

/** Contrôle d'unicité avant l'envoi du code (étape « Informations » de l'inscription). */
export async function checkContactAvailability(email: string, phone: string): Promise<void> {
  await latency()
  if (authStore.findAccount((a) => a.email === normalizeEmail(email)))
    throw new AuthError('emailTaken')
  if (authStore.findAccount((a) => a.phone === phone)) throw new AuthError('phoneTaken')
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

/** Crée le compte et renvoie son identifiant de connexion (envoyé aussi par e-mail). */
export async function registerAccount(data: NewAccount): Promise<Account> {
  await latency(500)
  const email = normalizeEmail(data.email)
  if (authStore.findAccount((a) => a.email === email)) throw new AuthError('emailTaken')
  if (authStore.findAccount((a) => a.phone === data.phone)) throw new AuthError('phoneTaken')
  const account: Account = {
    ...data,
    email,
    id: `acc-${randomToken().slice(0, 12)}`,
    identifier: generateIdentifier((id) => authStore.accounts().some((a) => a.identifier === id)),
    // Les justificatifs des professionnels sont contrôlés par l'équipe Domely
    verification: data.profile === 'professional' ? 'pending' : 'verified',
    createdAt: todayIso(),
  }
  authStore.addAccount(account)
  return account
}

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
