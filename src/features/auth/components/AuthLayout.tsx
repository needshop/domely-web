import { Outlet } from 'react-router'
import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'
import logo from '@/assets/brand/logo.svg'
import logoWhite from '@/assets/brand/logo-white.svg'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { ThemeSwitcher } from '@/components/ThemeSwitcher'
import { AuthShowcase } from './AuthShowcase'

const CURRENT_YEAR = new Date().getFullYear()

/**
 * Mise en page des pages d'authentification.
 * Desktop : présentation de la plateforme sur 2/3 de l'écran, formulaire sur 1/3 (logo en
 * haut, formulaire au centre, copyright en bas). Mobile : le formulaire seul.
 */
export function AuthLayout() {
  const { t } = useTranslation()

  return (
    <div className="min-h-dvh bg-surface lg:grid lg:grid-cols-[minmax(0,1fr)_28rem] xl:grid-cols-3">
      <div className="hidden lg:sticky lg:top-0 lg:flex lg:h-dvh lg:flex-col xl:col-span-2">
        <AuthShowcase />
      </div>

      <div className="flex min-h-dvh flex-col px-5 py-6 sm:px-10 lg:px-8 xl:px-10">
        {/* Desktop : le logo est déjà affiché dans le panneau de présentation */}
        <header className="flex items-center justify-between gap-3 lg:justify-end">
          <Link to="/login" aria-label={t('auth.layout.home')} className="shrink-0 lg:hidden">
            <img src={logo} alt="Domely" className="h-11 w-auto dark:hidden" />
            <img src={logoWhite} alt="Domely" className="hidden h-11 w-auto dark:block" />
          </Link>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeSwitcher />
          </div>
        </header>

        <main className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-sm">
            <Outlet />
          </div>
        </main>

        <footer className="text-center text-xs text-muted">
          {t('auth.layout.copyright', { year: CURRENT_YEAR })}
        </footer>
      </div>
    </div>
  )
}
