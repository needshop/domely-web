import { useTranslation } from 'react-i18next'

export function DashboardPage() {
  const { t } = useTranslation()

  return (
    <section>
      <h1 className="text-2xl">{t('dashboard.greeting')}</h1>
      <p className="mt-1 text-sm text-muted">{t('dashboard.subtitle')}</p>
    </section>
  )
}
