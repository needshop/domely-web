import { useTranslation } from 'react-i18next'
import type { NavKey } from '@/components/layout/navigation'

export function PlaceholderPage({ navKey }: { navKey: NavKey }) {
  const { t } = useTranslation()

  return (
    <section>
      <h1 className="text-2xl">{t(`nav.${navKey}`)}</h1>
      <p className="mt-1 text-sm text-muted">{t('placeholder.comingSoon')}</p>
    </section>
  )
}
