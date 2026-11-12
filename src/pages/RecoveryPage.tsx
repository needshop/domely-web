import { zodResolver } from '@hookform/resolvers/zod'
import { Button, buttonVariants } from '@heroui/react'
import { ArrowLeft, MailCheck } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { FormTextField } from '@/components/form/fields'
import { requestPasswordReset, sendIdentifierReminder, startRecovery } from '@/features/auth/api'
import { AuthAlert } from '@/features/auth/components/AuthAlert'
import { AuthHeading } from '@/features/auth/components/AuthHeading'
import { IdentifierCard } from '@/features/auth/components/IdentifierCard'
import { OtpVerification } from '@/features/auth/components/OtpVerification'
import { toInternationalPhone } from '@/features/auth/form/phone'
import { FormPhoneField } from '@/features/auth/form/PhoneField'
import { makeRecoverySchema, type RecoveryValues } from '@/features/auth/form/schemas'
import { maskEmail } from '@/features/auth/utils'
import { useAuthErrorMessage } from '@/features/auth/hooks/useAuthErrorMessage'

type Mode = 'password' | 'identifier'

/**
 * Mot de passe ou identifiant oublié : e-mail et téléphone du compte, validation du téléphone
 * par OTP, puis envoi par e-mail du lien de réinitialisation ou de l'identifiant.
 */
export function RecoveryPage({ mode }: { mode: Mode }) {
  const { t } = useTranslation()
  const errorMessage = useAuthErrorMessage()
  const [contact, setContact] = useState<{ email: string; phone: string } | null>(null)
  const [result, setResult] = useState<string | null>(null)
  const schema = useMemo(() => makeRecoverySchema(t), [t])
  const { control, handleSubmit, formState, setError } = useForm<RecoveryValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', phoneCountry: 'SN', phoneNumber: '' },
  })

  const onSubmit = handleSubmit(async (values) => {
    const phone = toInternationalPhone(values.phoneCountry, values.phoneNumber)
    try {
      await startRecovery(values.email, phone)
      setContact({ email: values.email, phone })
    } catch (e) {
      setError('root', { message: errorMessage(e) })
    }
  })

  if (contact && result) {
    return (
      <div className="flex flex-col gap-5">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-success-soft text-success-soft-foreground">
            <MailCheck className="size-7" aria-hidden />
          </span>
          <h1 className="text-2xl">{t(`auth.recovery.${mode}.doneTitle`)}</h1>
          <p className="text-sm text-muted">
            {t(`auth.recovery.${mode}.doneDescription`, { email: maskEmail(contact.email) })}
          </p>
        </div>

        {mode === 'password' ? (
          <AuthAlert title={t('auth.recovery.demoTitle')}>
            {t('auth.recovery.password.demoHint')}{' '}
            <Link to={result} className="font-medium underline underline-offset-4">
              {t('auth.recovery.password.demoLink')}
            </Link>
          </AuthAlert>
        ) : (
          <>
            <p className="text-xs text-muted">{t('auth.recovery.identifier.demoHint')}</p>
            <IdentifierCard identifier={result} />
          </>
        )}

        <Link
          to="/login"
          state={mode === 'identifier' ? { identifier: result } : undefined}
          className={buttonVariants({ variant: 'primary', fullWidth: true })}
        >
          {t('auth.recovery.backToLogin')}
        </Link>
      </div>
    )
  }

  if (contact) {
    return (
      <>
        <AuthHeading title={t('auth.otp.title')}>{t('auth.otp.description')}</AuthHeading>
        <OtpVerification
          phone={contact.phone}
          onResend={() => startRecovery(contact.email, contact.phone)}
          onVerified={async () => {
            const value =
              mode === 'password'
                ? await requestPasswordReset(contact.email, contact.phone)
                : await sendIdentifierReminder(contact.email, contact.phone)
            setResult(value)
          }}
          onBack={() => setContact(null)}
          backLabel={t('auth.otp.changeContact')}
          submitLabel={t(`auth.recovery.${mode}.verify`)}
        />
      </>
    )
  }

  return (
    <>
      <AuthHeading title={t(`auth.recovery.${mode}.title`)}>
        {t(`auth.recovery.${mode}.description`)}
      </AuthHeading>
      <form noValidate onSubmit={onSubmit} className="flex flex-col gap-5">
        {formState.errors.root?.message && (
          <AuthAlert status="danger">{formState.errors.root.message}</AuthAlert>
        )}
        <FormTextField
          control={control}
          name="email"
          type="email"
          label={t('auth.fields.email')}
          autoComplete="email"
          isRequired
        />
        <FormPhoneField
          control={control}
          countryName="phoneCountry"
          numberName="phoneNumber"
          label={t('auth.fields.phone')}
        />
        <Button type="submit" variant="primary" fullWidth isPending={formState.isSubmitting}>
          {t('auth.recovery.submit')}
        </Button>
      </form>
      <div className="mt-6 flex justify-center">
        <Link
          to="/login"
          className="flex items-center gap-2 text-sm text-muted hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden />
          {t('auth.recovery.backToLogin')}
        </Link>
      </div>
    </>
  )
}
