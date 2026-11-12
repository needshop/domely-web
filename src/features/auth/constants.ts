import type { DocumentType, ProfessionalKind } from './types'

/** Longueur de l'identifiant de connexion. */
export const IDENTIFIER_LENGTH = 7
/** Lettres et chiffres sans les caractères ambigus (0/O, 1/I/L). */
export const IDENTIFIER_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'

export const OTP_LENGTH = 6
/** Durée de validité d'un code OTP (ms). */
export const OTP_TTL_MS = 5 * 60_000
/** Délai avant de pouvoir redemander un code (s). */
export const OTP_RESEND_SECONDS = 60
export const OTP_MAX_ATTEMPTS = 5
/** Simulation : code accepté tant que l'envoi de SMS n'est pas branché. */
export const DEMO_OTP_CODE = '123456'

/** Validité d'une invitation de gestionnaire (ms). */
export const INVITATION_TTL_MS = 7 * 24 * 60 * 60_000

/** Validité d'un lien de réinitialisation du mot de passe (ms). */
export const RESET_TOKEN_TTL_MS = 30 * 60_000

export const PASSWORD_MIN_LENGTH = 8

/** Téléversement des justificatifs. */
export const DOCUMENT_MAX_BYTES = 5 * 1024 * 1024
export const DOCUMENT_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/png'] as const

/** Justificatifs demandés selon le statut professionnel. */
export const requiredDocuments: Record<
  ProfessionalKind,
  { type: DocumentType; required: boolean }[]
> = {
  agency: [
    { type: 'businessRegistration', required: true },
    { type: 'professionalCard', required: true },
    { type: 'managerId', required: true },
  ],
  agent: [
    { type: 'identity', required: true },
    { type: 'registrationCertificate', required: true },
    { type: 'mandate', required: false },
  ],
}

/** Indicatifs proposés : zone UEMOA + Guinée, et la France (propriétaires de la diaspora). */
export const dialCodes = [
  { country: 'SN', code: '+221' },
  { country: 'CI', code: '+225' },
  { country: 'TG', code: '+228' },
  { country: 'BJ', code: '+229' },
  { country: 'ML', code: '+223' },
  { country: 'BF', code: '+226' },
  { country: 'NE', code: '+227' },
  { country: 'GW', code: '+245' },
  { country: 'GN', code: '+224' },
  { country: 'FR', code: '+33' },
] as const
export type DialCountry = (typeof dialCodes)[number]['country']

/** Clés localStorage du module. */
export const ACCOUNTS_STORAGE_KEY = 'domely-accounts'
export const SESSION_STORAGE_KEY = 'domely-session'
export const REMEMBERED_IDENTIFIER_KEY = 'domely-remembered-identifier'
