import { Spinner } from '@heroui/react'
import { useTranslation } from 'react-i18next'

/** Premier affichage, le temps de charger le code de la page demandée. */
export function PageLoader() {
  const { t } = useTranslation()
  return (
    <div role="status" className="flex min-h-dvh items-center justify-center">
      <Spinner aria-hidden />
      <span className="sr-only">{t('app.loading')}</span>
    </div>
  )
}
