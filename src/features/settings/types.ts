export const organizationKinds = ['individual', 'agency', 'company'] as const
export type OrganizationKind = (typeof organizationKinds)[number]

export const leaseDurations = [12, 24, 36] as const

export interface Profile {
  name: string
  email: string
  phone: string
}

export interface Organization {
  kind: OrganizationKind
  /** Nom affiché (signature des messages…) */
  name: string
  /** Pays principal (code ISO) */
  country: string
  city: string
  address: string
  /** NINEA, RCCM, IFU… */
  registration: string
  phone: string
  email: string
}

/** Valeurs proposées à la création d'un contrat. */
export interface RentalDefaults {
  /** Jour d'échéance du loyer (1–28) */
  paymentDay: number
  /** Durée du bail en mois */
  leaseMonths: number
  tacitRenewal: boolean
  /** Dépôt de garantie, en mois de loyer */
  depositMonthsResidential: number
  depositMonthsCommercial: number
}

export interface Settings {
  profile: Profile
  organization: Organization
  rentals: RentalDefaults
  /** Taux de change depuis 1 XOF (l'EUR est à parité fixe, non modifiable) */
  exchangeRates: { GNF: number }
  reminder: {
    /** Modèle personnalisé ; vide = modèle par défaut de la langue active */
    template: string
  }
}
