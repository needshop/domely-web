import 'i18next'
import type { defaultNS, resources } from './index'

// Typage strict des clés de traduction : t('nav.dashboard') est vérifié à la compilation
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: typeof defaultNS
    resources: (typeof resources)['fr']
    returnNull: false
  }
}
