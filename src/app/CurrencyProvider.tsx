import { type ReactNode, useMemo } from 'react'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { useSettings } from '@/features/settings/api'
import {
  CURRENCY_STORAGE_KEY,
  CurrencyContext,
  DEFAULT_CURRENCY,
  isCurrency,
  ratesWith,
} from '@/lib/currency'

/**
 * Devise d'affichage des montants, mémorisée dans le navigateur. Les montants (stockés en XOF)
 * sont convertis avec la parité fixe de l'EUR et le taux GNF des paramètres.
 */
export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [stored, setStored] = useLocalStorage<string>(CURRENCY_STORAGE_KEY, DEFAULT_CURRENCY)
  const currency = isCurrency(stored) ? stored : DEFAULT_CURRENCY

  const gnf = useSettings().exchangeRates.GNF
  const value = useMemo(
    () => ({ currency, setCurrency: setStored, rates: ratesWith(gnf) }),
    [currency, setStored, gnf],
  )
  return <CurrencyContext value={value}>{children}</CurrencyContext>
}
