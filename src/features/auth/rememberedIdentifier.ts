import { REMEMBERED_IDENTIFIER_KEY } from './constants'

/** Identifiant mémorisé pour les prochaines connexions (préférence propre à l'appareil). */
export const rememberedIdentifier = {
  get(): string | null {
    try {
      return localStorage.getItem(REMEMBERED_IDENTIFIER_KEY)
    } catch {
      return null
    }
  },
  set(identifier: string | null) {
    try {
      if (identifier) localStorage.setItem(REMEMBERED_IDENTIFIER_KEY, identifier)
      else localStorage.removeItem(REMEMBERED_IDENTIFIER_KEY)
    } catch {
      /* stockage indisponible */
    }
  },
}
