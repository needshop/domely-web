/**
 * Rôles des comptes. Un compte peut en cumuler plusieurs (ex. propriétaire gestionnaire :
 * `landlord` + `property_manager`) :
 * - `super_admin` : administrateur de la plateforme (attribué à la main, pas d'inscription) ;
 * - `admin` : administrateur d'une agence (gère le workspace et ses gestionnaires) ;
 * - `property_manager` : gestionnaire d'une agence ou gestionnaire particulier ;
 * - `landlord` : propriétaire bailleur ;
 * - `tenant`, `user` : prévus, pas encore utilisés dans l'interface.
 */
export const roles = [
  'super_admin',
  'admin',
  'property_manager',
  'landlord',
  'tenant',
  'user',
] as const
export type Role = (typeof roles)[number]

/** Profils proposés à la création de compte (ils déterminent les rôles, voir `rolesForProfile`). */
export const accountProfiles = ['ownerManager', 'ownerPrincipal', 'professional'] as const
export type AccountProfile = (typeof accountProfiles)[number]

/** Statut d'un professionnel : agence immobilière ou mandataire indépendant. */
export const professionalKinds = ['agency', 'agent'] as const
export type ProfessionalKind = (typeof professionalKinds)[number]

/** Pièces justificatives demandées aux professionnels. */
export const documentTypes = [
  'businessRegistration',
  'professionalCard',
  'managerId',
  'identity',
  'registrationCertificate',
  'mandate',
] as const
export type DocumentType = (typeof documentTypes)[number]

export interface UploadedDocument {
  type: DocumentType
  name: string
  size: number
  mimeType: string
}

/** Vérification de l'agence ou du statut professionnel (les propriétaires sont vérifiés d'office). */
export type VerificationStatus = 'verified' | 'pending'

/** Un compte désactivé (par l'admin de son agence) ne peut plus se connecter. */
export type AccountStatus = 'active' | 'disabled'

export interface Account {
  id: string
  /** Identifiant de connexion : 7 caractères, lettres majuscules et chiffres */
  identifier: string
  /** Profil choisi à l'inscription (un gestionnaire invité a le profil « professional ») */
  profile: AccountProfile
  professionalKind?: ProfessionalKind
  roles: Role[]
  /** Workspace d'agence dont le compte est membre (admin ou gestionnaire invité) */
  workspaceId?: string
  status: AccountStatus
  firstName: string
  lastName: string
  email: string
  /** Numéro au format international, sans espaces (+221771234567) */
  phone: string
  /** Simulation : en clair en attendant l'API (qui stockera un hash) */
  password: string
  agencyName?: string
  /** SIRET / SIREN ou identifiant légal local (NINEA, RCCM, IFU…) */
  registrationNumber?: string
  documents: UploadedDocument[]
  verification: VerificationStatus
  createdAt: string
}

/** Utilisateur connecté (sans données sensibles), recalculé à partir de son compte. */
export interface Session {
  accountId: string
  identifier: string
  firstName: string
  lastName: string
  roles: Role[]
  verification: VerificationStatus
  workspaceId?: string
  /** Agence (workspace) ou nom commercial du mandataire, affiché dans l'en-tête */
  organization?: { name: string; kind: ProfessionalKind }
  startedAt: string
}

export type NewAccount = Omit<
  Account,
  'id' | 'identifier' | 'verification' | 'createdAt' | 'roles' | 'status' | 'workspaceId'
>

/** Espace de travail d'une agence : son admin y invite ses gestionnaires. */
export interface Workspace {
  id: string
  name: string
  /** SIRET / SIREN ou identifiant légal local */
  registrationNumber?: string
  /** Compte de l'admin qui a créé l'agence */
  ownerAccountId: string
  createdAt: string
}

export type InvitationStatus = 'pending' | 'accepted' | 'revoked'

/** Invitation d'un gestionnaire dans un workspace (lien envoyé par e-mail). */
export interface Invitation {
  id: string
  token: string
  workspaceId: string
  firstName: string
  lastName: string
  email: string
  /** Numéro international, sans espaces */
  phone: string
  invitedBy: string
  createdAt: string
  expiresAt: string
  status: InvitationStatus
}

/** Lien de réinitialisation du mot de passe (usage unique, durée limitée). */
export interface ResetToken {
  token: string
  accountId: string
  expiresAt: string
}
