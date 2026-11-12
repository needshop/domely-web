import { Building2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/cn'
import { useSession } from '../api'

/**
 * Compte professionnel : nom de l'agence (ou du mandataire) et son statut. Rien pour un compte
 * propriétaire.
 * - `header` : en-tête de l'application, masqué sous 640 px (en-tête trop chargé) ;
 * - `sidebar` : menu mobile (fond nuit), entre le logo et la navigation.
 */
export function OrganizationBadge({ variant = 'header' }: { variant?: 'header' | 'sidebar' }) {
  const { t } = useTranslation()
  const session = useSession()
  if (session?.profile !== 'professional' || !session.agencyName) return null
  const inSidebar = variant === 'sidebar'

  return (
    <div
      title={session.agencyName}
      className={cn(
        'min-w-0 items-center gap-2.5',
        inSidebar ? 'mb-6 flex rounded-xl bg-night-800 p-2.5' : 'hidden sm:flex',
      )}
    >
      <span
        className={cn(
          'flex size-9 shrink-0 items-center justify-center rounded-lg',
          inSidebar ? 'bg-night-700' : 'bg-surface-secondary',
        )}
      >
        <Building2
          className={cn('size-4.5', inSidebar ? 'text-night-100' : 'text-muted')}
          aria-hidden
        />
      </span>
      <span className="flex min-w-0 flex-col">
        <span
          className={cn('truncate font-display text-sm leading-tight', inSidebar && 'text-white')}
        >
          {session.agencyName}
        </span>
        {session.professionalKind && (
          <span className={cn('truncate text-xs', inSidebar ? 'text-night-300' : 'text-muted')}>
            {t(`auth.professionalKinds.${session.professionalKind}`)}
          </span>
        )}
      </span>
    </div>
  )
}
