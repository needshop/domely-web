import { type ReactNode, useMemo } from 'react'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { CURRENCY_STORAGE_KEY, CurrencyContext, DEFAULT_CURRENCY, isCurrency } from '@/lib/currency'

/**
 * Devise d'affichage des montants, mémorisée dans le navigateur.
 * Elle change le format, pas les valeurs : aucun taux de change n'est appliqué.
 */
export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [stored, setStored] = useLocalStorage<string>(CURRENCY_STORAGE_KEY, DEFAULT_CURRENCY)
  const currency = isCurrency(stored) ? stored : DEFAULT_CURRENCY

  const value = useMemo(() => ({ currency, setCurrency: setStored }), [currency, setStored])
  return <CurrencyContext value={value}>{children}</CurrencyContext>
}
