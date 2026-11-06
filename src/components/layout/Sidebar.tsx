import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import logoWhite from '@/assets/brand/logo-white.svg'
import symbolWhite from '@/assets/brand/symbol-white.svg'
import { cn } from '@/lib/cn'
import { env } from '@/lib/env'
import { navigation } from './navigation'
import { SidebarLink } from './SidebarLink'

interface SidebarContentProps {
  collapsed?: boolean
  /** Bouton « Réduire » (desktop uniquement) */
  onToggle?: () => void
  /** Appelé après un clic sur un lien (ferme la sidebar mobile) */
  onNavigate?: () => void
}

/** Contenu de la sidebar, partagé entre la version desktop et la version mobile. */
export function SidebarContent({ collapsed = false, onToggle, onNavigate }: SidebarContentProps) {
  const { t } = useTranslation()
  const ToggleIcon = collapsed ? PanelLeftOpen : PanelLeftClose
  const toggleLabel = collapsed ? t('sidebar.expandLabel') : t('sidebar.collapseLabel')

  return (
    <>
      <div className={cn('mb-8 flex h-14 items-center', collapsed ? 'justify-center' : 'px-1')}>
        {collapsed ? (
          <img src={symbolWhite} alt="Domely" className="size-11" />
        ) : (
          <img src={logoWhite} alt="Domely" className="h-14 w-auto" />
        )}
      </div>

      <nav
        className="-mx-1 flex min-h-0 flex-col gap-1 overflow-y-auto px-1"
        aria-label={t('nav.label')}
      >
        {navigation.map((item) => (
          <SidebarLink key={item.to} item={item} collapsed={collapsed} onNavigate={onNavigate} />
        ))}
      </nav>

      <div className="mt-auto flex flex-col gap-3 border-t border-night-800 pt-4">
        {onToggle && (
          <button
            type="button"
            onClick={onToggle}
            aria-label={toggleLabel}
            aria-expanded={!collapsed}
            title={collapsed ? toggleLabel : undefined}
            className={cn(
              'flex cursor-pointer items-center gap-3 rounded-lg py-2.5 font-display text-sm text-night-200 transition-colors hover:bg-night-800 hover:text-white focus-visible:outline-2 focus-visible:outline-brand-yellow-500',
              collapsed ? 'justify-center px-0' : 'px-3',
            )}
          >
            <ToggleIcon className="size-4.5 shrink-0" aria-hidden />
            {!collapsed && <span>{t('sidebar.collapse')}</span>}
          </button>
        )}

        <p className={cn('text-xs text-night-400', collapsed ? 'text-center' : 'px-3')}>
          {t(collapsed ? 'app.versionShort' : 'app.version', { version: env.appVersion })}
        </p>
      </div>
    </>
  )
}

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

/** Sidebar desktop (≥ lg), réductible aux icônes. */
export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  return (
    <aside
      data-collapsed={collapsed}
      className={cn(
        'sticky top-0 hidden h-dvh shrink-0 flex-col bg-night-900 py-6 transition-[width] duration-200 ease-out lg:flex dark:border-r dark:border-border',
        collapsed ? 'w-20 px-3' : 'w-64 px-4',
      )}
    >
      <SidebarContent collapsed={collapsed} onToggle={onToggle} />
    </aside>
  )
}
