/** Profils proposés à la création de compte. */
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

export interface Account {
  id: string
  /** Identifiant de connexion : 7 caractères, lettres majuscules et chiffres */
  identifier: string
  profile: AccountProfile
  professionalKind?: ProfessionalKind
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

/** Utilisateur connecté (sans données sensibles). */
export interface Session {
  accountId: string
  identifier: string
  firstName: string
  lastName: string
  profile: AccountProfile
  verification: VerificationStatus
  /** Professionnels : statut et nom de l'agence (affiché dans l'en-tête) */
  professionalKind?: ProfessionalKind
  agencyName?: string
  startedAt: string
}

export type NewAccount = Omit<Account, 'id' | 'identifier' | 'verification' | 'createdAt'>

/** Lien de réinitialisation du mot de passe (usage unique, durée limitée). */
export interface ResetToken {
  token: string
  accountId: string
  expiresAt: string
}
