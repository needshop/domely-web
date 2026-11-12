import { ACCOUNTS_STORAGE_KEY, SESSION_STORAGE_KEY } from './constants'
import { demoAccounts, demoInvitations, demoWorkspaces } from './mockData'
import { rolesForProfile } from './permissions'
import type { Account, Invitation, ResetToken, Session, Workspace } from './types'

/**
 * Comptes, workspaces, invitations et session, enregistrés dans le navigateur (localStorage)
 * en attendant l'API : un compte créé reste utilisable après un rechargement. Les données de
 * démonstration sont toujours présentes.
 */
interface PersistedAccounts {
  accounts: Account[]
  resetTokens: ResetToken[]
  workspaces: Workspace[]
  invitations: Invitation[]
}

/** Seule la référence au compte est enregistrée : la session est recalculée au chargement. */
interface PersistedSession {
  accountId: string
  startedAt: string
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

/** Données d'une version précédente : rôles et statut complétés (comptes créés avant les rôles). */
function normalize(saved: Account): Account {
  const demo = demoAccounts.find((d) => d.id === saved.id)
  const merged = { ...demo, ...saved } as Account
  return {
    ...merged,
    roles: merged.roles ?? rolesForProfile(merged.profile, merged.professionalKind),
    status: merged.status ?? 'active',
  }
}

/** Les données de démonstration viennent du code, sauf si elles ont été modifiées. */
function mergeDemo<T extends { id: string }>(demo: T[], saved: T[] | undefined): T[] {
  const list = saved ?? []
  return [...demo.filter((d) => !list.some((s) => s.id === d.id)), ...list]
}

const saved = read<Partial<PersistedAccounts>>(ACCOUNTS_STORAGE_KEY, {})
let accounts: Account[] = mergeDemo(demoAccounts, saved.accounts?.map(normalize))
let resetTokens: ResetToken[] = saved.resetTokens ?? []
let workspaces: Workspace[] = mergeDemo(demoWorkspaces, saved.workspaces)
let invitations: Invitation[] = mergeDemo(demoInvitations, saved.invitations)

/** Session d'un compte actif : identité, rôles, workspace et organisation affichée. */
function toSession(account: Account, startedAt: string): Session {
  const workspace = workspaces.find((w) => w.id === account.workspaceId)
  const organization = workspace
    ? { name: workspace.name, kind: 'agency' as const }
    : account.profile === 'professional' && account.agencyName
      ? { name: account.agencyName, kind: account.professionalKind ?? 'agent' }
      : undefined
  return {
    accountId: account.id,
    identifier: account.identifier,
    firstName: account.firstName,
    lastName: account.lastName,
    roles: account.roles,
    verification: account.verification,
    workspaceId: workspace?.id,
    organization,
    startedAt,
  }
}

const sessionFor = (ref: PersistedSession | null) => {
  const account = ref && accounts.find((a) => a.id === ref.accountId)
  return account && account.status === 'active' ? toSession(account, ref.startedAt) : null
}

let sessionRef: PersistedSession | null = read<PersistedSession | null>(SESSION_STORAGE_KEY, null)
let session: Session | null = sessionFor(sessionRef)

const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())

/** Enregistre et notifie ; la session suit les changements de son compte (rôles, statut…). */
function commit() {
  write(ACCOUNTS_STORAGE_KEY, {
    accounts: accounts.filter((a) => !demoAccounts.includes(a)),
    resetTokens,
    workspaces: workspaces.filter((w) => !demoWorkspaces.includes(w)),
    invitations: invitations.filter((i) => !demoInvitations.includes(i)),
  } satisfies PersistedAccounts)
  session = sessionFor(sessionRef)
  if (!session && sessionRef) {
    sessionRef = null
    write(SESSION_STORAGE_KEY, null)
  }
  emit()
}

export const authStore = {
  subscribe(listener: () => void) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
  getSession: () => session,
  getAccounts: () => accounts,
  getWorkspaces: () => workspaces,
  getInvitations: () => invitations,

  /** Ouvre (ou ferme, avec `null`) la session d'un compte. */
  setSession(accountId: string | null) {
    sessionRef = accountId ? { accountId, startedAt: new Date().toISOString() } : null
    write(SESSION_STORAGE_KEY, sessionRef)
    session = sessionFor(sessionRef)
    emit()
  },

  findAccount: (predicate: (a: Account) => boolean) => accounts.find(predicate),

  addAccount(account: Account) {
    accounts = [...accounts, account]
    commit()
  },

  updateAccount(id: string, patch: Partial<Account>) {
    accounts = accounts.map((a) => (a.id === id ? { ...a, ...patch } : a))
    commit()
  },

  addWorkspace(workspace: Workspace) {
    workspaces = [...workspaces, workspace]
    commit()
  },

  addInvitation(invitation: Invitation) {
    invitations = [...invitations, invitation]
    commit()
  },

  updateInvitation(id: string, patch: Partial<Invitation>) {
    invitations = invitations.map((i) => (i.id === id ? { ...i, ...patch } : i))
    commit()
  },

  addResetToken(token: ResetToken) {
    // Un seul lien valide par compte : le dernier demandé
    resetTokens = [...resetTokens.filter((t) => t.accountId !== token.accountId), token]
    commit()
  },
  findResetToken: (token: string) => resetTokens.find((t) => t.token === token),
  removeResetToken(token: string) {
    resetTokens = resetTokens.filter((t) => t.token !== token)
    commit()
  },
}
