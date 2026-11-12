import { zodResolver } from '@hookform/resolvers/zod'
import { Button, buttonVariants } from '@heroui/react'
import { MailX } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Link, useSearchParams } from 'react-router'
import { acceptInvitation, getInvitation, logout, sendOtp, useSession } from '@/features/auth/api'
import { AuthAlert } from '@/features/auth/components/AuthAlert'
import { AuthHeading } from '@/features/auth/components/AuthHeading'
import { OtpVerification } from '@/features/auth/components/OtpVerification'
import { SignupSuccess } from '@/features/auth/components/signup/SignupSuccess'
import { FormPasswordField } from '@/features/auth/form/PasswordField'
import { makeResetSchema, type ResetValues } from '@/features/auth/form/schemas'
import type { Account } from '@/features/auth/types'
import { maskPhone } from '@/features/auth/utils'

/**
 * Invitation d'un gestionnaire (lien reçu par e-mail, `?token=`) : mot de passe, validation du
 * téléphone par OTP, puis création du compte dans le workspace de l'agence.
 */
export function InvitationPage() {
  const { t } = useTranslation()
  const session = useSession()
  const token = useSearchParams()[0].get('token')
  // Contrôlée au montage : une invitation acceptée ou annulée ne redevient pas valable
  const [found] = useState(() => getInvitation(token))
  const [password, setPassword] = useState<string | null>(null)
  const [account, setAccount] = useState<Account | null>(null)
  const schema = useMemo(() => makeResetSchema(t), [t])
  const { control, handleSubmit, formState } = useForm<ResetValues>({
    resolver: zodResolver(schema),
    defaultValues: { password: '', confirmation: '' },
  })

  if (account) return <SignupSuccess account={account} />

  if (!found) {
    return (
      <div className="flex flex-col gap-5">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-danger-soft text-danger-soft-foreground">
            <MailX className="size-7" aria-hidden />
          </span>
          <h1 className="text-2xl">{t('workspace.accept.invalidTitle')}</h1>
          <p className="text-sm text-muted">{t('workspace.accept.invalidDescription')}</p>
        </div>
        <Link to="/login" className={buttonVariants({ variant: 'secondary', fullWidth: true })}>
          {t('auth.recovery.backToLogin')}
        </Link>
      </div>
    )
  }

  const { invitation, workspace, inviterName } = found

  // Un autre compte est connecté sur ce navigateur : il faut d'abord le déconnecter
  if (session) {
    return (
      <div className="flex flex-col gap-5">
        <AuthHeading title={t('workspace.accept.title', { agency: workspace.name })} />
        <AuthAlert status="warning" title={t('workspace.accept.signedInTitle')}>
          {t('workspace.accept.signedInDescription', {
            name: `${session.firstName} ${session.lastName}`,
          })}
        </AuthAlert>
        <Button variant="primary" fullWidth onPress={() => void logout()}>
          {t('auth.menu.logout')}
        </Button>
      </div>
    )
  }

  if (password) {
    return (
      <>
        <AuthHeading title={t('auth.otp.title')}>{t('auth.otp.description')}</AuthHeading>
        <OtpVerification
          phone={invitation.phone}
          onResend={() => sendOtp(invitation.phone)}
          onVerified={async () => setAccount(await acceptInvitation(invitation.token, password))}
          onBack={() => setPassword(null)}
          backLabel={t('auth.signup.back')}
          submitLabel={t('workspace.accept.create')}
        />
      </>
    )
  }

  const onSubmit = handleSubmit(async (values) => {
    await sendOtp(invitation.phone)
    setPassword(values.password)
  })

  return (
    <>
      <AuthHeading title={t('workspace.accept.title', { agency: workspace.name })}>
        {inviterName
          ? t('workspace.accept.description', { inviter: inviterName, agency: workspace.name })
          : t('workspace.accept.descriptionNoInviter', { agency: workspace.name })}
      </AuthHeading>

      <dl className="mb-6 divide-y divide-separator rounded-xl border border-border px-4">
        <div className="flex justify-between gap-3 py-2.5 text-sm">
          <dt className="text-muted">{t('workspace.accept.name')}</dt>
          <dd className="text-right font-medium">
            {invitation.firstName} {invitation.lastName}
          </dd>
        </div>
        <div className="flex justify-between gap-3 py-2.5 text-sm">
          <dt className="text-muted">{t('auth.fields.email')}</dt>
          <dd className="min-w-0 truncate text-right">{invitation.email}</dd>
        </div>
        <div className="flex justify-between gap-3 py-2.5 text-sm">
          <dt className="text-muted">{t('auth.fields.phone')}</dt>
          <dd className="text-right whitespace-nowrap">{maskPhone(invitation.phone)}</dd>
        </div>
        <div className="flex justify-between gap-3 py-2.5 text-sm">
          <dt className="text-muted">{t('workspace.accept.role')}</dt>
          <dd className="text-right">{t('auth.roles.property_manager')}</dd>
        </div>
      </dl>

      <form noValidate onSubmit={onSubmit} className="flex flex-col gap-5">
        <FormPasswordField
          control={control}
          name="password"
          label={t('auth.fields.password')}
          autoComplete="new-password"
          showRules
        />
        <FormPasswordField
          control={control}
          name="confirmation"
          label={t('auth.fields.confirmPassword')}
          autoComplete="new-password"
        />
        <Button type="submit" variant="primary" fullWidth isPending={formState.isSubmitting}>
          {t('auth.signup.next')}
        </Button>
      </form>
    </>
  )
}
