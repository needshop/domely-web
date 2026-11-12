import { ACCOUNTS_STORAGE_KEY, SESSION_STORAGE_KEY } from './constants'
import { demoAccounts } from './mockData'
import type { Account, ResetToken, Session } from './types'

/**
 * Comptes et session, enregistrés dans le navigateur (localStorage) en attendant l'API :
 * un compte créé reste utilisable après un rechargement. Le compte de démonstration est
 * toujours présent.
 */
interface PersistedAccounts {
  accounts: Account[]
  resetTokens: ResetToken[]
}

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function write(key: string, value: unknown) {
  try {
    if (value === null) localStorage.removeItem(key)
    else localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* stockage indisponible : on garde l'état en mémoire */
  }
}

const saved = read<Partial<PersistedAccounts>>(ACCOUNTS_STORAGE_KEY, {})
const savedAccounts = saved.accounts ?? []
// Les comptes de démonstration viennent du code, sauf s'ils ont été modifiés (mot de passe
// réinitialisé) : la version enregistrée l'emporte alors
let accounts: Account[] = [
  ...demoAccounts.filter((demo) => !savedAccounts.some((a) => a.id === demo.id)),
  ...savedAccounts,
]
let resetTokens: ResetToken[] = saved.resetTokens ?? []

/** Une session ne vaut que si son compte existe toujours. */
const storedSession = read<Session | null>(SESSION_STORAGE_KEY, null)
let session: Session | null =
  storedSession && accounts.some((a) => a.id === storedSession.accountId) ? storedSession : null

const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())

function persistAccounts() {
  write(ACCOUNTS_STORAGE_KEY, {
    accounts: accounts.filter((a) => !demoAccounts.includes(a)),
    resetTokens,
  } satisfies PersistedAccounts)
}

export const authStore = {
  subscribe(listener: () => void) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
  getSession: () => session,

  setSession(next: Session | null) {
    session = next
    write(SESSION_STORAGE_KEY, next)
    emit()
  },

  accounts: () => accounts,
  findAccount: (predicate: (a: Account) => boolean) => accounts.find(predicate),

  addAccount(account: Account) {
    accounts = [...accounts, account]
    persistAccounts()
  },

  updateAccount(id: string, patch: Partial<Account>) {
    accounts = accounts.map((a) => (a.id === id ? { ...a, ...patch } : a))
    persistAccounts()
  },

  addResetToken(token: ResetToken) {
    // Un seul lien valide par compte : le dernier demandé
    resetTokens = [...resetTokens.filter((t) => t.accountId !== token.accountId), token]
    persistAccounts()
  },
  findResetToken: (token: string) => resetTokens.find((t) => t.token === token),
  removeResetToken(token: string) {
    resetTokens = resetTokens.filter((t) => t.token !== token)
    persistAccounts()
  },
}
