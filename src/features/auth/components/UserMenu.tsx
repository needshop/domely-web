import { Avatar, Dropdown, Label } from '@heroui/react'
import { LogOut, Settings } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { initials } from '@/lib/initials'
import { logout, useSession } from '../api'

/** Menu du compte (en-tête) : identité, identifiant, paramètres et déconnexion. */
export function UserMenu() {
  const { t } = useTranslation()
  const session = useSession()
  const navigate = useNavigate()
  if (!session) return null
  const fullName = `${session.firstName} ${session.lastName}`

  return (
    <Dropdown>
      <Dropdown.Trigger
        aria-label={t('auth.menu.label', { name: fullName })}
        className="rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
      >
        <Avatar size="sm">
          <Avatar.Fallback className="bg-night-900 font-display text-xs text-white dark:bg-night-200 dark:text-night-900">
            {initials(fullName)}
          </Avatar.Fallback>
        </Avatar>
      </Dropdown.Trigger>
      <Dropdown.Popover placement="bottom end" className="min-w-60">
        <div className="border-b border-separator px-3 py-2.5">
          <p className="truncate text-sm font-medium">{fullName}</p>
          <p className="text-xs text-muted">
            {t(`auth.profiles.${session.profile}.title`)} ·{' '}
            {t('auth.menu.identifier', { identifier: session.identifier })}
          </p>
          {session.verification === 'pending' && (
            <p className="mt-1 text-xs text-warning-soft-foreground">{t('auth.menu.pending')}</p>
          )}
        </div>
        <Dropdown.Menu
          aria-label={t('auth.menu.actions')}
          onAction={(key) => {
            if (key === 'settings') void navigate('/settings')
            if (key === 'logout') void logout().then(() => navigate('/login', { replace: true }))
          }}
        >
          <Dropdown.Item id="settings" textValue={t('nav.settings')}>
            <Settings className="size-4 text-muted" aria-hidden />
            <Label>{t('nav.settings')}</Label>
          </Dropdown.Item>
          <Dropdown.Item id="logout" textValue={t('auth.menu.logout')} variant="danger">
            <LogOut className="size-4" aria-hidden />
            <Label>{t('auth.menu.logout')}</Label>
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  )
}
