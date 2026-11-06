import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'
import enCommon from './locales/en/common.json'
import frCommon from './locales/fr/common.json'

export const supportedLanguages = ['fr', 'en'] as const
export type Language = (typeof supportedLanguages)[number]

export const defaultLanguage: Language = 'fr'
export const defaultNS = 'common'

// Le français est la langue de référence : TypeScript signale toute clé manquante en anglais
type Messages = typeof frCommon
const en: Messages = enCommon

export const resources = {
  fr: { common: frCommon },
  en: { common: en },
} as const

/** Clé localStorage où le choix de langue est mémorisé. */
export const LANGUAGE_STORAGE_KEY = 'domely-lang'

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    defaultNS,
    ns: [defaultNS],
    supportedLngs: supportedLanguages,
    nonExplicitSupportedLngs: true, // "en-US" → "en", "fr-CA" → "fr"
    load: 'languageOnly',
    fallbackLng: defaultLanguage,
    detection: {
      // 1. choix explicite de l'utilisateur, 2. langue du navigateur
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: LANGUAGE_STORAGE_KEY,
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false, // React échappe déjà
    },
    returnNull: false,
  })

// Garde <html lang> synchronisé (accessibilité, lecteurs d'écran, césure)
const syncHtmlLang = (lng: string) => {
  document.documentElement.lang = lng
}
syncHtmlLang(i18n.resolvedLanguage ?? defaultLanguage)
i18n.on('languageChanged', () => syncHtmlLang(i18n.resolvedLanguage ?? defaultLanguage))

export default i18n
