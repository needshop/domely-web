import { Button } from '@heroui/react'
import { Bell } from 'lucide-react'
import { RouterProvider as AriaRouterProvider } from 'react-aria-components'
import { useTranslation } from 'react-i18next'
import { Outlet, ScrollRestoration, useHref, useNavigate } from 'react-router'
import { CurrencySwitcher } from '@/components/CurrencySwitcher'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { ThemeSwitcher } from '@/components/ThemeSwitcher'
import symbol from '@/assets/brand/symbol.svg'
import symbolWhite from '@/assets/brand/symbol-white.svg'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { MobileNav } from './MobileNav'
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
          <header className="sticky top-0 z-20 flex h-16 items-center gap-1.5 border-b border-border bg-surface px-3 sm:gap-3 sm:px-4 lg:px-6">
            <MobileNav />
            <img
              src={symbol}
              alt="Domely"
              className="hidden size-8 sm:block lg:hidden dark:hidden"
            />
            <img
              src={symbolWhite}
              alt="Domely"
              className="hidden size-8 sm:dark:block lg:dark:hidden"
            />
            <div className="flex-1" />
            <CurrencySwitcher />
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

          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            <Outlet />
            {/* Retour en haut de page à chaque navigation, position restaurée au retour arrière */}
            <ScrollRestoration />
          </main>
        </div>
      </div>
    </AriaRouterProvider>
  )
}
