import { DEMO_OTP_CODE, OTP_MAX_ATTEMPTS, OTP_TTL_MS } from './constants'
import { AuthError } from './errors'

/**
 * Codes de vérification envoyés par SMS — simulation en mémoire : aucun SMS n'est envoyé et le
 * code de démonstration est toujours accepté. L'API générera, enverra et vérifiera le code.
 */
interface PendingOtp {
  code: string
  expiresAt: number
  attempts: number
}

const pending = new Map<string, PendingOtp>()

export function issueOtp(phone: string) {
  pending.set(phone, { code: DEMO_OTP_CODE, expiresAt: Date.now() + OTP_TTL_MS, attempts: 0 })
}

export function checkOtp(phone: string, code: string) {
  const otp = pending.get(phone)
  if (!otp || Date.now() > otp.expiresAt) throw new AuthError('otpExpired')
  if (otp.attempts >= OTP_MAX_ATTEMPTS) throw new AuthError('otpTooManyAttempts')
  if (code !== otp.code) {
    otp.attempts += 1
    throw new AuthError(otp.attempts >= OTP_MAX_ATTEMPTS ? 'otpTooManyAttempts' : 'otpInvalid')
  }
  pending.delete(phone)
}
