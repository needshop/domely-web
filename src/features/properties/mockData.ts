import type { Property, Unit, UnitKind, UnitStatus } from './types'

/**
 * Données fictives des biens (montants en XOF), en attendant l'API (../api).
 * Même forme que la future réponse : remplacer par un appel dans services/.
 */

/** Identifiants des locataires particuliers, attribués dans l'ordre des lots loués. */
let nextTenant = 0
const autoTenantId = () => `t${++nextTenant}`
/** Identifiants des contrats de bail en cours (repris par le module Contrats). */
let nextLease = 0

interface UnitsSpec {
  prefix: string
  count: number
  kind: UnitKind
  baseRent: number
  baseArea: number
  rooms?: number
  perFloor?: number
  vacant?: number[]
  underWorks?: number[]
  late?: number[]
  /** Locataire imposé pour certains lots (n° de lot → id), ex. une société */
  tenantIds?: Record<number, string>
  seed: number
}

/** Génère des lots déterministes (loyer et surface varient légèrement selon l'étage). */
function makeUnits(spec: UnitsSpec): Unit[] {
  const perFloor = spec.perFloor ?? 4
  return Array.from({ length: spec.count }, (_, i) => {
    const n = i + 1
    const floor = spec.perFloor === 0 ? undefined : Math.floor(i / perFloor)
    const status: UnitStatus = spec.underWorks?.includes(n)
      ? 'underWorks'
      : spec.vacant?.includes(n)
        ? 'vacant'
        : 'rented'
    const leaseMonth = String(((spec.seed + i * 5) % 12) + 1).padStart(2, '0')
    const leaseDay = String(((i * 3) % 27) + 1).padStart(2, '0')
    return {
      id: `${spec.prefix.toLowerCase().replace(/\W+/g, '')}-${n}`,
      label: `${spec.prefix} ${n}`,
      kind: spec.kind,
      floor,
      area: spec.baseArea + ((i * 7) % 15),
      rooms: spec.rooms,
      rent: spec.baseRent + (floor ?? 0) * 10_000 + ((i * 3) % 4) * 5_000,
      charges: Math.round((spec.baseRent * 0.08) / 1_000) * 1_000,
      status,
      lease:
        status === 'rented'
          ? {
              id: `l${++nextLease}`,
              tenantId: spec.tenantIds?.[n] ?? autoTenantId(),
              startDate: `${2025 - ((spec.seed + i) % 3)}-${leaseMonth}-${leaseDay}`,
              endDate: `2027-${leaseMonth}-${leaseDay}`,
            }
          : undefined,
      isLate: status === 'rented' && spec.late?.includes(n),
    }
  })
}

export const propertiesMock: Property[] = [
  {
    id: 'p1',
    name: 'Résidence Les Oliviers',
    type: 'residence',
    address: {
      street: 'Route des Almadies',
      district: 'Almadies',
      city: 'Dakar',
      country: 'SN',
    },
    acquiredAt: '2019-03-12',
    createdAt: '2026-10-28',
    description:
      'Résidence sécurisée de 12 appartements avec parking, gardiennage 24h/24 et groupe électrogène.',
    units: makeUnits({
      prefix: 'Apt',
      count: 12,
      kind: 'apartment',
      baseRent: 350_000,
      baseArea: 78,
      rooms: 3,
      late: [4],
      seed: 0,
    }),
  },
  {
    id: 'p2',
    name: 'Villa Harmonie',
    type: 'house',
    address: {
      street: 'Rue des Jardins',
      district: 'Cocody Riviera',
      city: 'Abidjan',
      country: 'CI',
    },
    acquiredAt: '2021-06-01',
    createdAt: '2026-10-15',
    description: 'Villa de 5 pièces avec jardin et piscine.',
    units: makeUnits({
      prefix: 'Villa',
      count: 1,
      kind: 'house',
      baseRent: 950_000,
      baseArea: 240,
      rooms: 5,
      perFloor: 0,
      seed: 3,
    }),
  },
  {
    id: 'p3',
    name: 'Immeuble Bellevue',
    type: 'building',
    address: {
      street: 'Boulevard de la République',
      district: 'Plateau',
      city: 'Abidjan',
      country: 'CI',
    },
    acquiredAt: '2017-11-20',
    createdAt: '2026-09-30',
    description:
      'Immeuble R+5 de 24 appartements, ascenseur et local commercial au rez-de-chaussée.',
    units: makeUnits({
      prefix: 'Apt',
      count: 24,
      kind: 'apartment',
      baseRent: 280_000,
      baseArea: 64,
      rooms: 3,
      vacant: [18],
      underWorks: [6],
      late: [3, 12],
      seed: 5,
    }),
  },
  {
    id: 'p4',
    name: 'Résidence Baobab',
    type: 'residence',
    address: {
      street: 'Avenue Cheikh Anta Diop',
      district: 'Mermoz',
      city: 'Dakar',
      country: 'SN',
    },
    acquiredAt: '2022-02-14',
    createdAt: '2026-08-21',
    units: makeUnits({
      prefix: 'Studio',
      count: 8,
      kind: 'studio',
      baseRent: 180_000,
      baseArea: 32,
      rooms: 1,
      vacant: [7],
      seed: 2,
    }),
  },
  {
    id: 'p5',
    name: 'Galerie Étoile',
    type: 'commercial',
    address: { street: 'Boulevard du 13 Janvier', district: 'Bè', city: 'Lomé', country: 'TG' },
    acquiredAt: '2020-09-05',
    createdAt: '2026-07-10',
    description: 'Galerie marchande de 6 boutiques en bord de boulevard.',
    units: makeUnits({
      prefix: 'Boutique',
      count: 6,
      kind: 'shop',
      baseRent: 250_000,
      baseArea: 40,
      perFloor: 0,
      vacant: [5],
      tenantIds: { 1: 'c4', 4: 'c5' },
      seed: 7,
    }),
  },
  {
    id: 'p6',
    name: 'Horizon Business Center',
    type: 'office',
    address: {
      street: 'Avenue Chardy',
      district: 'Plateau',
      city: 'Abidjan',
      country: 'CI',
    },
    acquiredAt: '2018-04-18',
    createdAt: '2026-06-02',
    units: makeUnits({
      prefix: 'Bureau',
      count: 4,
      kind: 'office',
      baseRent: 650_000,
      baseArea: 120,
      perFloor: 1,
      tenantIds: { 1: 'c1', 2: 'c2', 3: 'c3', 4: 'c3' },
      seed: 9,
    }),
  },
  {
    id: 'p7',
    name: 'Villa Teranga',
    type: 'house',
    address: {
      street: 'Route de Ngaparou',
      district: 'Saly Portudal',
      city: 'Mbour',
      country: 'SN',
    },
    acquiredAt: '2023-01-10',
    createdAt: '2026-05-19',
    units: makeUnits({
      prefix: 'Villa',
      count: 1,
      kind: 'house',
      baseRent: 700_000,
      baseArea: 180,
      rooms: 4,
      perFloor: 0,
      vacant: [1],
      seed: 4,
    }),
  },
  {
    id: 'p8',
    name: 'Maison Akwaba',
    type: 'house',
    address: { street: 'Rue 12.045', district: 'Fidjrossè', city: 'Cotonou', country: 'BJ' },
    acquiredAt: '2020-12-01',
    createdAt: '2026-04-07',
    units: makeUnits({
      prefix: 'Maison',
      count: 1,
      kind: 'house',
      baseRent: 420_000,
      baseArea: 150,
      rooms: 4,
      perFloor: 0,
      late: [1],
      seed: 6,
    }),
  },
  {
    id: 'p9',
    name: 'Résidence Le Flamboyant',
    type: 'residence',
    address: { street: 'Rue des Cocotiers', district: 'Tokoin', city: 'Lomé', country: 'TG' },
    acquiredAt: '2021-10-22',
    createdAt: '2026-03-15',
    units: makeUnits({
      prefix: 'Apt',
      count: 6,
      kind: 'apartment',
      baseRent: 220_000,
      baseArea: 70,
      rooms: 3,
      seed: 8,
    }),
  },
  {
    id: 'p10',
    name: 'Boutiques Dantokpa',
    type: 'commercial',
    address: {
      street: 'Avenue Jean-Paul II',
      district: 'Dantokpa',
      city: 'Cotonou',
      country: 'BJ',
    },
    acquiredAt: '2019-07-30',
    createdAt: '2026-02-11',
    units: makeUnits({
      prefix: 'Boutique',
      count: 2,
      kind: 'shop',
      baseRent: 200_000,
      baseArea: 28,
      perFloor: 0,
      tenantIds: { 2: 'c5' },
      seed: 10,
    }),
  },
  {
    id: 'p11',
    name: 'Appartement Corniche',
    type: 'apartment',
    address: {
      street: 'Corniche Ouest',
      district: 'Fann',
      city: 'Dakar',
      country: 'SN',
    },
    acquiredAt: '2024-05-06',
    createdAt: '2026-01-20',
    description: 'Appartement F4 au 3ᵉ étage avec vue mer, dans une copropriété avec piscine.',
    units: makeUnits({
      prefix: 'Apt',
      count: 1,
      kind: 'apartment',
      baseRent: 600_000,
      baseArea: 110,
      rooms: 4,
      perFloor: 0,
      seed: 11,
    }),
  },
]
