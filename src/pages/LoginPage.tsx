import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@heroui/react'
import { ChevronRight, KeyRound, UserRoundSearch } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router'
import { FormSwitch } from '@/components/form/fields'
import { login } from '@/features/auth/api'
import { AuthAlert } from '@/features/auth/components/AuthAlert'
import { AuthHeading } from '@/features/auth/components/AuthHeading'
import { FormIdentifierField } from '@/features/auth/form/IdentifierField'
import { FormPasswordField } from '@/features/auth/form/PasswordField'
import { type LoginValues, makeLoginSchema } from '@/features/auth/form/schemas'
import {
  DEMO_AGENCY_IDENTIFIER,
  DEMO_IDENTIFIER,
  DEMO_MANAGER_IDENTIFIER,
  DEMO_PASSWORD,
} from '@/features/auth/mockData'
import { rememberedIdentifier } from '@/features/auth/rememberedIdentifier'
import { useAuthErrorMessage } from '@/features/auth/hooks/useAuthErrorMessage'

/** État de navigation reçu d'autres pages (inscription, réinitialisation…). */
export interface LoginLocationState {
  identifier?: string
  notice?: 'passwordReset'
  from?: string
}

export function LoginPage() {
  const { t } = useTranslation()
  const errorMessage = useAuthErrorMessage()
  const state = useLocation().state as LoginLocationState | null
  const [error, setError] = useState<string | null>(null)

  const schema = useMemo(() => makeLoginSchema(t), [t])
  // Valeurs figées au montage : identifiant transmis par une autre page, sinon mémorisé
  const [defaults] = useState<LoginValues>(() => {
    const saved = rememberedIdentifier.get()
    return { identifier: state?.identifier ?? saved ?? '', password: '', remember: Boolean(saved) }
  })
  const { control, handleSubmit, formState, setFocus } = useForm<LoginValues>({
    resolver: zodResolver(schema),
    defaultValues: defaults,
  })

  // Identifiant déjà connu : on place directement le curseur sur le mot de passe
  useEffect(() => {
    setFocus(defaults.identifier ? 'password' : 'identifier')
  }, [defaults.identifier, setFocus])

  const onSubmit = handleSubmit(async (values) => {
    setError(null)
    try {
      await login(values.identifier, values.password)
      // La redirection est faite par la garde des pages visiteurs (GuestOnly)
      rememberedIdentifier.set(values.remember ? values.identifier : null)
    } catch (e) {
      setError(errorMessage(e))
    }
  })

  return (
    <>
      <AuthHeading title={t('auth.login.title')}>{t('auth.login.subtitle')}</AuthHeading>

      <form noValidate onSubmit={onSubmit} className="flex flex-col gap-5">
        {state?.notice === 'passwordReset' && !error && (
          <AuthAlert status="success" title={t('auth.reset.done')}>
            {t('auth.reset.doneHint')}
          </AuthAlert>
        )}
        {error && <AuthAlert status="danger">{error}</AuthAlert>}

        <FormIdentifierField control={control} name="identifier" />
        <FormPasswordField
          control={control}
          name="password"
          label={t('auth.fields.password')}
          autoComplete="current-password"
        />
        <FormSwitch control={control} name="remember" label={t('auth.login.remember')} />

        <Button type="submit" variant="primary" fullWidth isPending={formState.isSubmitting}>
          {t('auth.login.submit')}
        </Button>
      </form>

      <nav
        aria-label={t('auth.login.helpLabel')}
        className="mt-6 overflow-hidden rounded-xl border border-border bg-surface shadow-md shadow-night-900/5 dark:shadow-black/30"
      >
        <HelpLink to="/forgot-password" icon={<KeyRound className="size-4" aria-hidden />}>
          {t('auth.login.forgotPassword')}
        </HelpLink>
        <HelpLink
          to="/forgot-identifier"
          icon={<UserRoundSearch className="size-4" aria-hidden />}
          className="border-t border-separator"
        >
          {t('auth.login.forgotIdentifier')}
        </HelpLink>
      </nav>

      <p className="mt-6 text-center text-sm text-muted">
        {t('auth.login.noAccount')}{' '}
        <Link
          to="/signup"
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          {t('auth.login.signup')}
        </Link>
      </p>

      <div className="mt-6">
        <AuthAlert title={t('auth.login.demoTitle')}>
          {t('auth.login.demoDescription', {
            owner: DEMO_IDENTIFIER,
            agency: DEMO_AGENCY_IDENTIFIER,
            manager: DEMO_MANAGER_IDENTIFIER,
            password: DEMO_PASSWORD,
          })}
        </AuthAlert>
      </div>
    </>
  )
}

function HelpLink({
  to,
  icon,
  className,
  children,
}: {
  to: string
  icon: React.ReactNode
  className?: string
  children: React.ReactNode
}) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-surface-secondary focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus ${className ?? ''}`}
    >
      <span className="flex size-8 items-center justify-center rounded-lg bg-surface-secondary text-muted">
        {icon}
      </span>
      <span className="flex-1">{children}</span>
      <ChevronRight className="size-4 text-muted" aria-hidden />
    </Link>
  )
}
