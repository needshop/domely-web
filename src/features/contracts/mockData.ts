import { propertiesMock } from '@/features/properties/mockData'
import type { Lease } from './types'
import { leaseTypeForUnit } from './utils'

/**
 * Données fictives des contrats, en attendant l'API (../api).
 * Les baux en cours reprennent ceux des lots loués des biens fictifs ; s'y ajoutent
 * quelques contrats passés (résiliés) et un contrat à venir.
 */

const reference = (startDate: string, seq: number) =>
  `BAIL-${startDate.slice(0, 4)}-${String(seq).padStart(4, '0')}`

const current: Lease[] = propertiesMock.flatMap((property) =>
  property.units.flatMap((unit) => {
    if (!unit.lease) return []
    const seq = Number(unit.lease.id.slice(1))
    const type = leaseTypeForUnit(unit.kind)
    return [
      {
        id: unit.lease.id,
        reference: reference(unit.lease.startDate, seq),
        propertyId: property.id,
        unitId: unit.id,
        tenantId: unit.lease.tenantId,
        type,
        startDate: unit.lease.startDate,
        endDate: unit.lease.endDate,
        rent: unit.rent,
        charges: unit.charges,
        // Usage : 2 mois de loyer en habitation, 3 en commercial / professionnel
        deposit: unit.rent * (type === 'residential' ? 2 : 3),
        paymentDay: seq % 4 === 0 ? 10 : seq % 3 === 0 ? 1 : 5,
        tacitRenewal: seq % 6 !== 0,
        createdAt: unit.lease.startDate,
      },
    ]
  }),
)

const history: Lease[] = [
  {
    id: 'l901',
    reference: 'BAIL-2022-0901',
    propertyId: 'p3',
    unitId: 'apt-18',
    tenantId: 'f1',
    type: 'residential',
    startDate: '2022-04-01',
    endDate: '2027-03-31',
    rent: 295_000,
    charges: 22_000,
    deposit: 590_000,
    paymentDay: 5,
    tacitRenewal: true,
    terminatedAt: '2026-08-31',
    terminationReason: 'tenantLeave',
    notes: 'Départ anticipé pour mutation professionnelle, préavis de 3 mois respecté.',
    createdAt: '2022-03-20',
  },
  {
    id: 'l902',
    reference: 'BAIL-2024-0902',
    propertyId: 'p4',
    unitId: 'studio-7',
    tenantId: 'f2',
    type: 'residential',
    startDate: '2024-07-01',
    endDate: '2026-06-30',
    rent: 190_000,
    charges: 14_000,
    deposit: 380_000,
    paymentDay: 5,
    tacitRenewal: false,
    terminatedAt: '2026-06-30',
    terminationReason: 'notRenewed',
    createdAt: '2024-06-18',
  },
  {
    id: 'l903',
    reference: 'BAIL-2026-0903',
    propertyId: 'p7',
    unitId: 'villa-1',
    tenantId: 'f3',
    type: 'residential',
    startDate: '2026-12-01',
    endDate: '2027-11-30',
    rent: 700_000,
    charges: 56_000,
    deposit: 1_400_000,
    paymentDay: 1,
    tacitRenewal: true,
    notes: 'Remise des clés prévue le 1er décembre après l’état des lieux d’entrée.',
    createdAt: '2026-10-28',
  },
]

export const leasesMock: Lease[] = [...current, ...history]
