import type { Account } from './types'

/**
 * Comptes de démonstration, toujours disponibles (identifiants et mot de passe affichés sur la
 * page de connexion tant que l'API n'existe pas) : un propriétaire et une agence.
 */
export const DEMO_IDENTIFIER = 'DMY4K7P'
export const DEMO_AGENCY_IDENTIFIER = 'AGT8R2K'
export const DEMO_PASSWORD = 'Domely2026'

export const demoAccount: Account = {
  id: 'acc-demo',
  identifier: DEMO_IDENTIFIER,
  profile: 'ownerManager',
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

export const demoAccounts: Account[] = [demoAccount, demoAgencyAccount]
