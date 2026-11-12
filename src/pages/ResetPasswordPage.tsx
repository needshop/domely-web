import { zodResolver } from '@hookform/resolvers/zod'
import { Button, buttonVariants } from '@heroui/react'
import { LinkIcon } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { isResetTokenValid, resetPassword } from '@/features/auth/api'
import { AuthAlert } from '@/features/auth/components/AuthAlert'
import { AuthHeading } from '@/features/auth/components/AuthHeading'
import { FormPasswordField } from '@/features/auth/form/PasswordField'
import { makeResetSchema, type ResetValues } from '@/features/auth/form/schemas'
import type { LoginLocationState } from './LoginPage'
import { useAuthErrorMessage } from '@/features/auth/hooks/useAuthErrorMessage'

/** Nouveau mot de passe, depuis le lien reçu par e-mail (`?token=`). */
export function ResetPasswordPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const errorMessage = useAuthErrorMessage()
  const token = useSearchParams()[0].get('token')
  // Contrôlé au montage : un lien utilisé ou expiré ne redevient pas valide
  const [valid] = useState(() => isResetTokenValid(token))
  const schema = useMemo(() => makeResetSchema(t), [t])
  const { control, handleSubmit, formState, setError } = useForm<ResetValues>({
    resolver: zodResolver(schema),
    defaultValues: { password: '', confirmation: '' },
  })

  const onSubmit = handleSubmit(async (values) => {
    try {
      const identifier = await resetPassword(token ?? '', values.password)
      const state: LoginLocationState = { identifier, notice: 'passwordReset' }
      void navigate('/login', { replace: true, state })
    } catch (e) {
      setError('root', { message: errorMessage(e) })
    }
  })

  if (!valid) {
    return (
      <div className="flex flex-col gap-5">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-danger-soft text-danger-soft-foreground">
            <LinkIcon className="size-7" aria-hidden />
          </span>
          <h1 className="text-2xl">{t('auth.reset.invalidTitle')}</h1>
          <p className="text-sm text-muted">{t('auth.reset.invalidDescription')}</p>
        </div>
        <Link
          to="/forgot-password"
          className={buttonVariants({ variant: 'primary', fullWidth: true })}
        >
          {t('auth.reset.requestNew')}
        </Link>
        <Link to="/login" className="text-center text-sm text-muted hover:text-foreground">
          {t('auth.recovery.backToLogin')}
        </Link>
      </div>
    )
  }

  return (
    <>
      <AuthHeading title={t('auth.reset.title')}>{t('auth.reset.description')}</AuthHeading>
      <form noValidate onSubmit={onSubmit} className="flex flex-col gap-5">
        {formState.errors.root?.message && (
          <AuthAlert status="danger">{formState.errors.root.message}</AuthAlert>
        )}
        <FormPasswordField
          control={control}
          name="password"
          label={t('auth.fields.newPassword')}
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
          {t('auth.reset.submit')}
        </Button>
      </form>
    </>
  )
}
