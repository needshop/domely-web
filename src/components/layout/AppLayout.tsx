import { Button } from '@heroui/react'
import { Bell } from 'lucide-react'
import { RouterProvider as AriaRouterProvider } from 'react-aria-components'
import { useTranslation } from 'react-i18next'
import { Outlet, useHref, useNavigate } from 'react-router'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { ThemeSwitcher } from '@/components/ThemeSwitcher'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { Sidebar } from './Sidebar'

export function AppLayout() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useLocalStorage('domely-sidebar-collapsed', false)

  return (
    // Les liens React Aria / HeroUI naviguent via React Router (pas de rechargement)
    <AriaRouterProvider navigate={(to) => void navigate(to)} useHref={useHref}>
      <div className="flex min-h-dvh">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-16 items-center justify-end gap-3 border-b border-border bg-surface px-6">
            <LanguageSwitcher />
            <ThemeSwitcher />
            <Button
              isIconOnly
              variant="ghost"
              aria-label={t('header.notifications')}
              className="relative"
            >
              <Bell className="size-5" aria-hidden />
              <span className="absolute top-2 right-2 size-2 rounded-full bg-accent" />
            </Button>
          </header>

          <main className="flex-1 p-6 lg:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </AriaRouterProvider>
  )
}
