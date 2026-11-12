import { Button, InputOTP, Label, REGEXP_ONLY_DIGITS } from '@heroui/react'
import { ArrowLeft, MessageSquareText } from 'lucide-react'
import { useEffect, useId, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { verifyOtp } from '../api'
import { DEMO_OTP_CODE, OTP_LENGTH, OTP_RESEND_SECONDS } from '../constants'
import { authErrorCode } from '../errors'
import { maskPhone } from '../utils'
import { AuthAlert } from './AuthAlert'
import { useAuthErrorMessage } from '../hooks/useAuthErrorMessage'

/**
 * Saisie du code reçu par SMS. Le premier code est envoyé par la page appelante avant
 * l'affichage ; « Renvoyer » est disponible après un délai.
 */
export function OtpVerification({
  phone,
  onResend,
  onVerified,
  onBack,
  backLabel,
  submitLabel,
}: {
  /** Numéro international, sans espaces */
  phone: string
  onResend: () => Promise<void>
  onVerified: () => Promise<void> | void
  onBack: () => void
  backLabel: string
  submitLabel?: string
}) {
  const { t } = useTranslation()
  const errorMessage = useAuthErrorMessage()
  const labelId = useId()
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [blocked, setBlocked] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [resent, setResent] = useState(false)
  const [cooldown, setCooldown] = useState(OTP_RESEND_SECONDS)

  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setTimeout(() => setCooldown((s) => s - 1), 1000)
    return () => clearTimeout(timer)
  }, [cooldown])

  const verify = async (value = code) => {
    if (value.length < OTP_LENGTH) {
      setError(t('auth.otp.incomplete'))
      return
    }
    setIsVerifying(true)
    setError(null)
    try {
      await verifyOtp(phone, value)
      await onVerified()
    } catch (e) {
      const code = authErrorCode(e)
      setError(errorMessage(e))
      // Trop d'essais ou code expiré : il faut un nouveau code
      if (code === 'otpTooManyAttempts' || code === 'otpExpired') setBlocked(true)
      setCode('')
    } finally {
      setIsVerifying(false)
    }
  }

  const resend = async () => {
    setIsResending(true)
    try {
      await onResend()
      setCode('')
      setError(null)
      setBlocked(false)
      setResent(true)
      setCooldown(OTP_RESEND_SECONDS)
    } catch (e) {
      setError(errorMessage(e))
    } finally {
      setIsResending(false)
    }
  }

  return (
    <form
      noValidate
      className="flex flex-col gap-5"
      onSubmit={(e) => {
        e.preventDefault()
        void verify()
      }}
    >
      <div className="flex items-start gap-3 rounded-xl bg-surface-secondary p-3 text-sm">
        <MessageSquareText className="mt-0.5 size-5 shrink-0 text-muted" aria-hidden />
        <p>
          {t('auth.otp.sentTo')} <strong className="whitespace-nowrap">{maskPhone(phone)}</strong>
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <Label id={labelId}>{t('auth.otp.label')}</Label>
        <InputOTP
          aria-labelledby={labelId}
          maxLength={OTP_LENGTH}
          pattern={REGEXP_ONLY_DIGITS}
          inputMode="numeric"
          autoComplete="one-time-code"
          autoFocus
          value={code}
          onChange={(v) => {
            setCode(v)
            if (error && !blocked) setError(null)
          }}
          onComplete={(v: string) => void verify(v)}
          isInvalid={Boolean(error)}
          isDisabled={isVerifying || blocked}
        >
          <InputOTP.Group>
            {Array.from({ length: OTP_LENGTH / 2 }, (_, i) => (
              <InputOTP.Slot key={i} index={i} />
            ))}
          </InputOTP.Group>
          <InputOTP.Separator />
          <InputOTP.Group>
            {Array.from({ length: OTP_LENGTH / 2 }, (_, i) => (
              <InputOTP.Slot key={i} index={i + OTP_LENGTH / 2} />
            ))}
          </InputOTP.Group>
        </InputOTP>
        {error && (
          <p role="alert" className="text-xs text-danger">
            {error}
          </p>
        )}
      </div>

      <AuthAlert>{t('auth.otp.demoHint', { code: DEMO_OTP_CODE })}</AuthAlert>

      <Button
        type="submit"
        variant="primary"
        fullWidth
        isPending={isVerifying}
        isDisabled={blocked}
      >
        {submitLabel ?? t('auth.otp.verify')}
      </Button>

      <div className="flex flex-col items-center gap-2 text-sm">
        <p aria-live="polite" className="text-muted">
          {cooldown > 0 ? (
            t('auth.otp.resendIn', { seconds: cooldown })
          ) : (
            <Button variant="ghost" size="sm" onPress={() => void resend()} isPending={isResending}>
              {t('auth.otp.resend')}
            </Button>
          )}
          {resent && cooldown > 0 && (
            <span className="block text-success-soft-foreground">{t('auth.otp.resent')}</span>
          )}
        </p>
        <Button variant="ghost" size="sm" onPress={onBack}>
          <ArrowLeft className="size-4" aria-hidden />
          {backLabel}
        </Button>
      </div>
    </form>
  )
}
