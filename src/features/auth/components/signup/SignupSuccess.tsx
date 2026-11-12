import { buttonVariants } from '@heroui/react'
import { CircleCheckBig } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import type { Account } from '../../types'
import { maskEmail } from '../../utils'
import { AuthAlert } from '../AuthAlert'
import { IdentifierCard } from '../IdentifierCard'

/** Fin de l'inscription : identifiant de connexion et, pour un professionnel, vérification en cours. */
export function SignupSuccess({ account }: { account: Account }) {
  const { t } = useTranslation()
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-success-soft text-success-soft-foreground">
          <CircleCheckBig className="size-7" aria-hidden />
        </span>
        <h1 className="text-2xl">{t('auth.success.title', { name: account.firstName })}</h1>
        <p className="text-sm text-muted">
          {t('auth.success.description', { email: maskEmail(account.email) })}
        </p>
      </div>

      <IdentifierCard identifier={account.identifier} />
      <p className="text-xs text-muted">{t('auth.success.identifierHint')}</p>

      {account.verification === 'pending' && (
        <AuthAlert status="warning" title={t('auth.success.pendingTitle')}>
          {t('auth.success.pendingDescription')}
        </AuthAlert>
      )}

      <Link
        to="/login"
        state={{ identifier: account.identifier }}
        className={buttonVariants({ variant: 'primary', fullWidth: true })}
      >
        {t('auth.success.login')}
      </Link>
    </div>
  )
}
