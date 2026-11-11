import { createContext, use } from 'react'

/** Devises prises en charge. XOF = franc CFA (UEMOA), GNF = franc guinéen. */
export const supportedCurrencies = ['XOF', 'EUR', 'GNF'] as const
export type Currency = (typeof supportedCurrencies)[number]

export const DEFAULT_CURRENCY: Currency = 'XOF'

/** Devise dans laquelle les montants sont stockés (données / API). */
export const BASE_CURRENCY: Currency = 'XOF'

/**
 * Taux de conversion depuis 1 XOF.
 * - EUR : parité fixe officielle, 1 EUR = 655,957 XOF (exact).
 * - GNF : taux flottant, valeur INDICATIVE à remplacer par un taux fourni par l'API.
 */
export const XOF_PER_EUR = 655.957
export const GNF_PER_XOF = 14.18

/** Taux depuis 1 XOF. */
export type ExchangeRates = Record<Currency, number>

export const DEFAULT_RATES: ExchangeRates = {
  XOF: 1,
  EUR: 1 / XOF_PER_EUR,
  GNF: GNF_PER_XOF,
}

/** Taux appliqués : l'EUR reste à parité fixe ; le GNF peut être ajusté dans les paramètres. */
export const ratesWith = (gnfPerXof: number): ExchangeRates => ({
  ...DEFAULT_RATES,
  GNF: gnfPerXof,
})

/** Convertit un montant d'une devise vers une autre (via le XOF). */
export function convertAmount(
  amount: number,
  to: Currency,
  from: Currency = BASE_CURRENCY,
  rates: ExchangeRates = DEFAULT_RATES,
) {
  if (from === to) return amount
  return (amount / rates[from]) * rates[to]
}
export const CURRENCY_STORAGE_KEY = 'domely-currency'

export const isCurrency = (v: unknown): v is Currency =>
  typeof v === 'string' && (supportedCurrencies as readonly string[]).includes(v)

export interface CurrencyContextValue {
  currency: Currency
  setCurrency: (c: Currency) => void
  /** Taux de change appliqués à l'affichage */
  rates: ExchangeRates
}

export const CurrencyContext = createContext<CurrencyContextValue | null>(null)

/** Devise d'affichage active (fournie par <CurrencyProvider>). */
export function useCurrency() {
  const ctx = use(CurrencyContext)
  if (!ctx) throw new Error('useCurrency doit être utilisé dans <CurrencyProvider>')
  return ctx
}
