import { BarChart3, Building2, Wallet } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import logoWhite from '@/assets/brand/logo-white.svg'

/**
 * Panneau de présentation (desktop) : logo en haut, slogan centré verticalement, points forts
 * de la plateforme en bas.
 */
export function AuthShowcase() {
  const { t } = useTranslation()

  const features = [
    { icon: Building2, label: t('auth.showcase.features.portfolio') },
    { icon: Wallet, label: t('auth.showcase.features.rents') },
    { icon: BarChart3, label: t('auth.showcase.features.reports') },
  ]

  return (
    <section
      aria-labelledby="auth-showcase-title"
      className="relative isolate flex flex-1 flex-col overflow-clip bg-night-900 px-12 py-12 text-white xl:px-16"
    >
      {/* Halos et trame de fond */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 -right-32 size-[34rem] rounded-full bg-brand-red-500/20 blur-3xl" />
        <div className="absolute -bottom-48 -left-40 size-[30rem] rounded-full bg-brand-yellow-500/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(rgb(255_255_255/0.07)_1px,transparent_1px)] [background-size:22px_22px]" />
      </div>

      {/* Marge négative : compense le blanc intérieur du SVG pour aligner le logo sur les textes */}
      <img
        src={logoWhite}
        alt="Domely"
        className="-ml-[11px] h-16 w-auto self-start xl:-ml-3.5 xl:h-20"
      />

      <div className="flex max-w-2xl flex-1 flex-col justify-center py-10">
        <p className="mb-4 font-display text-sm tracking-widest text-brand-yellow-500 uppercase">
          {t('auth.showcase.eyebrow')}
        </p>
        <h2 id="auth-showcase-title" className="text-4xl leading-tight text-white xl:text-5xl">
          {t('app.tagline')}
        </h2>
        <p className="mt-4 text-lg text-night-200">{t('auth.showcase.subtitle')}</p>
      </div>

      <ul className="grid grid-cols-3 gap-6 border-t border-white/10 pt-8">
        {features.map(({ icon: Icon, label }) => (
          <li key={label} className="flex items-center gap-3 text-sm text-night-100">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/10">
              <Icon className="size-4.5 text-white" aria-hidden />
            </span>
            {label}
          </li>
        ))}
      </ul>
    </section>
  )
}
