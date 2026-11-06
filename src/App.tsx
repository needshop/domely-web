import { I18nProvider } from 'react-aria-components'
import { useTranslation } from 'react-i18next'
import { RouterProvider } from 'react-router'
import { router } from '@/app/router'

export default function App() {
  const { i18n } = useTranslation()

  return (
    // Aligne la locale React Aria / HeroUI (dates, nombres, sens de lecture) sur la langue i18next
    <I18nProvider locale={i18n.resolvedLanguage === 'en' ? 'en-US' : 'fr-FR'}>
      <RouterProvider router={router} />
    </I18nProvider>
  )
}
