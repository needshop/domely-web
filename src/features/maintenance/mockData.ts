import { leasesMock } from '@/features/contracts/mockData'
import { addDays, todayIso } from '@/lib/dates'
import type { Intervention, MaintenanceEvent } from './types'

/**
 * Données fictives des interventions, en attendant l'API (../api).
 * Dates relatives au jour courant, pour que les situations (en cours, planifiées…) restent
 * cohérentes dans le temps.
 */

const today = todayIso()
const day = (offset: number) => addDays(today, offset)

/** Locataire en place sur un lot (contrat fictif en cours). */
const tenantOf = (propertyId: string, unitId: string) =>
  leasesMock.find((l) => l.propertyId === propertyId && l.unitId === unitId && !l.terminatedAt)
    ?.tenantId

type Seed = Omit<Intervention, 'id' | 'reference' | 'history' | 'tenantId'> & {
  history?: MaintenanceEvent[]
}

function build(seeds: Seed[]): Intervention[] {
  return seeds.map((s, i) => {
    const seq = i + 1
    const history: MaintenanceEvent[] = s.history ?? [
      { date: s.reportedAt, status: 'new' },
      ...(s.scheduledAt && s.status !== 'new'
        ? [{ date: s.reportedAt, status: 'scheduled' as const }]
        : []),
      ...(['inProgress', 'done'].includes(s.status) && s.scheduledAt
        ? [{ date: s.scheduledAt, status: 'inProgress' as const }]
        : []),
      ...(s.status === 'done' && s.completedAt
        ? [{ date: s.completedAt, status: 'done' as const }]
        : []),
    ]
    return {
      ...s,
      id: `m${seq}`,
      reference: `INT-${s.reportedAt.slice(0, 4)}-${String(seq).padStart(4, '0')}`,
      tenantId:
        s.reportedBy === 'tenant' && s.unitId ? tenantOf(s.propertyId, s.unitId) : undefined,
      history,
    }
  })
}

export const interventionsMock: Intervention[] = build([
  {
    propertyId: 'p3',
    unitId: 'apt-6',
    title: 'Fuite du chauffe-eau',
    description:
      'Fuite importante sous le chauffe-eau, dégâts des eaux dans la salle de bain. Lot vidé pour travaux.',
    category: 'plumbing',
    priority: 'urgent',
    status: 'inProgress',
    reportedBy: 'manager',
    reportedAt: day(-6),
    scheduledAt: day(-4),
    provider: { name: 'Plomberie Kouadio', phone: '+225 07 58 21 44 10' },
    estimatedCost: 320_000,
    chargedTo: 'owner',
  },
  {
    propertyId: 'p6',
    unitId: 'bureau-2',
    title: 'Climatisation en panne',
    description: 'Le split de la salle de réunion ne refroidit plus et fait disjoncter.',
    category: 'airConditioning',
    priority: 'urgent',
    status: 'new',
    reportedBy: 'tenant',
    reportedAt: day(-1),
    chargedTo: 'owner',
  },
  {
    propertyId: 'p5',
    unitId: 'boutique-3',
    title: 'Court-circuit du tableau électrique',
    description: 'Le disjoncteur général saute dès la mise en route de la vitrine réfrigérée.',
    category: 'electricity',
    priority: 'urgent',
    status: 'scheduled',
    reportedBy: 'tenant',
    reportedAt: day(-2),
    scheduledAt: day(1),
    provider: { name: 'Togo Élec Services', phone: '+228 90 11 72 36' },
    estimatedCost: 85_000,
    chargedTo: 'owner',
  },
  {
    propertyId: 'p1',
    unitId: 'apt-2',
    title: 'Remplacement de la serrure',
    description: 'Serrure de la porte d’entrée grippée, clé difficile à tourner.',
    category: 'locksmith',
    priority: 'normal',
    status: 'scheduled',
    reportedBy: 'tenant',
    reportedAt: day(-8),
    scheduledAt: day(2),
    provider: { name: 'Serrurerie du Plateau', phone: '+221 77 640 18 92' },
    estimatedCost: 45_000,
    chargedTo: 'owner',
  },
  {
    propertyId: 'p3',
    title: 'Peinture de la cage d’escalier',
    description: 'Murs abîmés et traces d’humidité entre le 2ᵉ et le 4ᵉ étage.',
    category: 'painting',
    priority: 'low',
    status: 'new',
    reportedBy: 'manager',
    reportedAt: day(-5),
    estimatedCost: 650_000,
    chargedTo: 'owner',
  },
  {
    propertyId: 'p2',
    unitId: 'villa-1',
    title: 'Infiltration par la toiture',
    description: 'Traces d’eau au plafond de la chambre principale après les dernières pluies.',
    category: 'masonry',
    priority: 'normal',
    status: 'inProgress',
    reportedBy: 'tenant',
    reportedAt: day(-15),
    scheduledAt: day(-3),
    provider: { name: 'BTP Riviera', phone: '+225 07 07 35 81 26' },
    estimatedCost: 480_000,
    chargedTo: 'owner',
  },
  {
    propertyId: 'p2',
    unitId: 'villa-1',
    title: 'Réfrigérateur fourni en panne',
    category: 'appliances',
    priority: 'normal',
    status: 'scheduled',
    reportedBy: 'tenant',
    reportedAt: day(-4),
    scheduledAt: day(5),
    provider: { name: 'Froid Express', phone: '+225 05 44 90 12 77' },
    estimatedCost: 60_000,
    chargedTo: 'owner',
  },
  {
    propertyId: 'p10',
    unitId: 'boutique-1',
    title: 'Débouchage de canalisation',
    category: 'plumbing',
    priority: 'urgent',
    status: 'done',
    reportedBy: 'tenant',
    reportedAt: day(-4),
    scheduledAt: day(-3),
    completedAt: day(-3),
    provider: { name: 'Assainissement Dantokpa', phone: '+229 01 97 45 22 18' },
    estimatedCost: 30_000,
    actualCost: 35_000,
    chargedTo: 'owner',
  },
  {
    propertyId: 'p11',
    unitId: 'apt-1',
    title: 'Fuite du robinet de cuisine',
    category: 'plumbing',
    priority: 'normal',
    status: 'done',
    reportedBy: 'tenant',
    reportedAt: day(-14),
    scheduledAt: day(-12),
    completedAt: day(-12),
    provider: { name: 'Plomberie Fann', phone: '+221 77 502 66 31' },
    actualCost: 15_000,
    chargedTo: 'tenant',
  },
  {
    propertyId: 'p4',
    unitId: 'studio-2',
    title: 'Réparation de la chasse d’eau',
    category: 'plumbing',
    priority: 'normal',
    status: 'done',
    reportedBy: 'tenant',
    reportedAt: day(-24),
    scheduledAt: day(-21),
    completedAt: day(-21),
    provider: { name: 'Plomberie Mermoz', phone: '+221 77 318 40 55' },
    actualCost: 25_000,
    chargedTo: 'owner',
  },
  {
    propertyId: 'p4',
    unitId: 'studio-7',
    title: 'Remise en peinture avant relocation',
    description: 'Peinture complète du studio après le départ du locataire.',
    category: 'painting',
    priority: 'normal',
    status: 'done',
    reportedBy: 'manager',
    reportedAt: day(-45),
    scheduledAt: day(-40),
    completedAt: day(-36),
    provider: { name: 'Déco Teranga', phone: '+221 77 455 09 81' },
    estimatedCost: 200_000,
    actualCost: 180_000,
    chargedTo: 'owner',
  },
  {
    propertyId: 'p1',
    title: 'Entretien annuel du groupe électrogène',
    category: 'electricity',
    priority: 'low',
    status: 'done',
    reportedBy: 'manager',
    reportedAt: day(-70),
    scheduledAt: day(-62),
    completedAt: day(-62),
    provider: { name: 'Sénégal Énergie Maintenance', phone: '+221 33 820 14 60' },
    estimatedCost: 150_000,
    actualCost: 150_000,
    chargedTo: 'owner',
  },
  {
    propertyId: 'p8',
    unitId: 'maison-1',
    title: 'Vidange de la fosse septique',
    category: 'cleaning',
    priority: 'normal',
    status: 'done',
    reportedBy: 'tenant',
    reportedAt: day(-95),
    scheduledAt: day(-90),
    completedAt: day(-90),
    provider: { name: 'Vidange Fidjrossè', phone: '+229 01 96 30 41 07' },
    actualCost: 60_000,
    chargedTo: 'owner',
  },
  {
    propertyId: 'p9',
    unitId: 'apt-3',
    title: 'Volet roulant bloqué',
    category: 'other',
    priority: 'low',
    status: 'cancelled',
    reportedBy: 'tenant',
    reportedAt: day(-30),
    chargedTo: 'owner',
    history: [
      { date: day(-30), status: 'new' },
      { date: day(-28), status: 'cancelled', note: 'Problème résolu par le locataire.' },
    ],
  },
])
