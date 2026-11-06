import { Tooltip } from '@heroui/react'
import { Link } from 'react-aria-components'
import { useTranslation } from 'react-i18next'
import { useMatch, useResolvedPath } from 'react-router'
import { cn } from '@/lib/cn'
import type { NavItem } from './navigation'

interface SidebarLinkProps {
  item: NavItem
  collapsed: boolean
}

/**
 * Lien de navigation de la sidebar.
 * Lien React Aria (navigation client via le RouterProvider d'AppLayout) afin que le
 * Tooltip HeroUI s'y accroche nativement ; le tooltip n'est actif qu'en mode réduit.
 */
export function SidebarLink({ item, collapsed }: SidebarLinkProps) {
  const { t } = useTranslation()
  const { key, to, icon: Icon } = item
  const label = t(`nav.${key}`)
  const resolved = useResolvedPath(to)
  const isActive = useMatch({ path: resolved.pathname, end: to === '/' }) !== null

  return (
    <Tooltip delay={0} closeDelay={0} isDisabled={!collapsed}>
      <Link
        href={to}
        aria-label={collapsed ? label : undefined}
        aria-current={isActive ? 'page' : undefined}
        className={cn(
          'flex items-center gap-3 rounded-lg py-2.5 font-display text-sm transition-colors outline-none',
          'data-focus-visible:ring-2 data-focus-visible:ring-brand-yellow-500',
          collapsed ? 'justify-center px-0' : 'px-3',
          isActive
            ? 'bg-accent text-accent-foreground'
            : 'text-night-200 hover:bg-night-800 hover:text-white',
        )}
      >
        <Icon className="size-4.5 shrink-0" strokeWidth={2} aria-hidden />
        {!collapsed && <span className="truncate">{label}</span>}
      </Link>
      <Tooltip.Content placement="right" offset={12}>
        {label}
      </Tooltip.Content>
    </Tooltip>
  )
}
