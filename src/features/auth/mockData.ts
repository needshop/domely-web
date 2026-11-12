import { INVITATION_TTL_MS } from './constants'
import type { Account, Invitation, Workspace } from './types'

/**
 * Comptes de démonstration, toujours disponibles (identifiants et mot de passe affichés sur la
 * page de connexion tant que l'API n'existe pas) : un propriétaire gestionnaire, l'admin d'une
 * agence et deux gestionnaires de cette agence (dont un désactivé).
 */
export const DEMO_IDENTIFIER = 'DMY4K7P'
export const DEMO_AGENCY_IDENTIFIER = 'AGT8R2K'
export const DEMO_MANAGER_IDENTIFIER = 'GST5M3Q'
export const DEMO_PASSWORD = 'Domely2026'

export const DEMO_WORKSPACE_ID = 'ws-teranga'

export const demoAccount: Account = {
  id: 'acc-demo',
  identifier: DEMO_IDENTIFIER,
  profile: 'ownerManager',
  roles: ['landlord', 'property_manager'],
  status: 'active',
  firstName: 'Moussa',
  lastName: 'Diop',
  email: 'moussa.diop@example.com',
  phone: '+221771234567',
  password: DEMO_PASSWORD,
  documents: [],
  verification: 'verified',
  createdAt: '2026-01-15',
}

export const demoAgencyAccount: Account = {
  id: 'acc-demo-agency',
  identifier: DEMO_AGENCY_IDENTIFIER,
  profile: 'professional',
  professionalKind: 'agency',
  roles: ['admin', 'property_manager'],
  workspaceId: DEMO_WORKSPACE_ID,
  status: 'active',
  firstName: 'Aminata',
  lastName: 'Sow',
  email: 'aminata.sow@example.com',
  phone: '+221776543210',
  password: DEMO_PASSWORD,
  agencyName: 'Teranga Immobilier',
  registrationNumber: 'SN-DKR-2021-B-04512',
  documents: [],
  verification: 'verified',
  createdAt: '2026-02-03',
}

/** Gestionnaires invités par l'agence de démonstration. */
const demoManagers: Account[] = [
  {
    id: 'acc-demo-manager',
    identifier: DEMO_MANAGER_IDENTIFIER,
    profile: 'professional',
    professionalKind: 'agency',
    roles: ['property_manager'],
    workspaceId: DEMO_WORKSPACE_ID,
    status: 'active',
    firstName: 'Ibrahima',
    lastName: 'Fall',
    email: 'ibrahima.fall@example.com',
    phone: '+221775550101',
    password: DEMO_PASSWORD,
    agencyName: 'Teranga Immobilier',
    documents: [],
    verification: 'verified',
    createdAt: '2026-03-10',
  },
  {
    id: 'acc-demo-manager-2',
    identifier: 'GST9K2D',
    profile: 'professional',
    professionalKind: 'agency',
    roles: ['property_manager'],
    workspaceId: DEMO_WORKSPACE_ID,
    status: 'disabled',
    firstName: 'Mariam',
    lastName: 'Koné',
    email: 'mariam.kone@example.com',
    phone: '+221775550202',
    password: DEMO_PASSWORD,
    agencyName: 'Teranga Immobilier',
    documents: [],
    verification: 'verified',
    createdAt: '2026-04-22',
  },
]

export const demoAccounts: Account[] = [demoAccount, demoAgencyAccount, ...demoManagers]

export const demoWorkspaces: Workspace[] = [
  {
    id: DEMO_WORKSPACE_ID,
    name: 'Teranga Immobilier',
    registrationNumber: 'SN-DKR-2021-B-04512',
    ownerAccountId: demoAgencyAccount.id,
    createdAt: '2026-02-03',
  },
]

/** Invitation en attente (relative à la date du jour, pour ne jamais être expirée). */
export const demoInvitations: Invitation[] = [
  {
    id: 'inv-demo',
    token: 'demo-invitation-yao',
    workspaceId: DEMO_WORKSPACE_ID,
    firstName: 'Yao',
    lastName: 'Mensah',
    email: 'yao.mensah@example.com',
    phone: '+221775550303',
    invitedBy: demoAgencyAccount.id,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60_000).toISOString(),
    expiresAt: new Date(Date.now() + INVITATION_TTL_MS).toISOString(),
    status: 'pending',
  },
]
