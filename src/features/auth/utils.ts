import { dialCodes, IDENTIFIER_ALPHABET, IDENTIFIER_LENGTH, PASSWORD_MIN_LENGTH } from './constants'

/** Identifiant saisi : sans espaces, en majuscules. */
export const normalizeIdentifier = (value: string) => value.replace(/\s/g, '').toUpperCase()

export const IDENTIFIER_PATTERN = new RegExp(`^[A-Z0-9]{${IDENTIFIER_LENGTH}}$`)

/** Nouvel identifiant aléatoire, avec au moins une lettre et un chiffre. */
export function generateIdentifier(isTaken: (id: string) => boolean): string {
  const random = () => {
    const values = crypto.getRandomValues(new Uint32Array(IDENTIFIER_LENGTH))
    return Array.from(values, (v) => IDENTIFIER_ALPHABET[v % IDENTIFIER_ALPHABET.length]).join('')
  }
  for (;;) {
    const id = random()
    if (/[A-Z]/.test(id) && /\d/.test(id) && !isTaken(id)) return id
  }
}

export const randomToken = () =>
  Array.from(crypto.getRandomValues(new Uint8Array(24)), (b) =>
    b.toString(16).padStart(2, '0'),
  ).join('')

/** Numéro international sans séparateurs (+221 77 123 45 67 → +221771234567). */
export const normalizePhone = (phone: string) => `+${phone.replace(/\D/g, '')}`

export const normalizeEmail = (email: string) => email.trim().toLowerCase()

/** Règles du mot de passe, affichées en direct sous le champ. */
export const passwordRules = {
  length: (v: string) => v.length >= PASSWORD_MIN_LENGTH,
  letter: (v: string) => /\p{L}/u.test(v),
  digit: (v: string) => /\d/.test(v),
} as const
export type PasswordRule = keyof typeof passwordRules

export const isStrongPassword = (v: string) => Object.values(passwordRules).every((rule) => rule(v))

/** « fredi@example.com » → « f•••i@example.com » */
export function maskEmail(email: string): string {
  const [user, domain] = email.split('@')
  if (!domain || !user) return email
  const visible = user.length <= 2 ? user[0] : `${user[0]}•••${user.at(-1)}`
  return `${visible}@${domain}`
}

/** « +221771234567 » → « +221 •• ••• •• 67 » (seuls les 2 derniers chiffres restent lisibles). */
export function maskPhone(phone: string): string {
  const dialCode = dialCodes.find((d) => phone.startsWith(d.code))?.code ?? ''
  const national = phone.slice(dialCode.length)
  return `${dialCode} ${'•'.repeat(Math.max(national.length - 2, 0))}${national.slice(-2)}`
}

/** Taille de fichier lisible (Ko / Mo). */
export function formatFileSize(bytes: number, locale: string): string {
  const fmt = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 })
  if (bytes < 1024 * 1024)
    return `${fmt.format(Math.max(bytes / 1024, 0.1))} ${locale.startsWith('fr') ? 'Ko' : 'KB'}`
  return `${fmt.format(bytes / (1024 * 1024))} ${locale.startsWith('fr') ? 'Mo' : 'MB'}`
}
