export const authErrorCodes = [
  'invalidCredentials',
  'emailTaken',
  'phoneTaken',
  'accountNotFound',
  'otpInvalid',
  'otpExpired',
  'otpTooManyAttempts',
  'resetLinkInvalid',
] as const
export type AuthErrorCode = (typeof authErrorCodes)[number]

/** Erreur métier du module (le libellé traduit est `auth.errors.<code>`). */
export class AuthError extends Error {
  readonly code: AuthErrorCode
  constructor(code: AuthErrorCode) {
    super(code)
    this.name = 'AuthError'
    this.code = code
  }
}

export const authErrorCode = (error: unknown): AuthErrorCode | null =>
  error instanceof AuthError ? error.code : null
