import { useTranslation } from 'react-i18next'
import { type AuthErrorCode, authErrorCode } from '../errors'

/** Libellé traduit d'une erreur du module (ou message générique). */
export function useAuthErrorMessage() {
  const { t } = useTranslation()
  return (error: unknown) => {
    const code: AuthErrorCode | null = authErrorCode(error)
    return code ? t(`auth.errors.${code}`) : t('auth.errors.generic')
  }
}
