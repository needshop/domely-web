import type { DashboardData } from './types'

/**
 * Données fictives du tableau de bord (montants en XOF), en attendant l'API (../api).
 * Même forme que la future réponse : remplacer par un appel dans services/.
 */
export const dashboardMock: DashboardData = {
  kpis: {
    properties: { total: 52, addedThisMonth: 2 },
    tenants: { active: 48, newThisMonth: 3 },
    occupancy: { rate: 0.96, previousRate: 0.94 },
    collected: { amount: 15_368_000, previousAmount: 13_720_000 },
  },
  collections: [
    { month: '2025-12-01', collected: 12_480_000, expected: 13_200_000 },
    { month: '2026-01-01', collected: 12_820_000, expected: 13_200_000 },
    { month: '2026-02-01', collected: 13_160_000, expected: 13_360_000 },
    { month: '2026-03-01', collected: 13_240_000, expected: 13_600_000 },
    { month: '2026-04-01', collected: 13_520_000, expected: 13_600_000 },
    { month: '2026-05-01', collected: 13_840_000, expected: 14_080_000 },
    { month: '2026-06-01', collected: 14_040_000, expected: 14_080_000 },
    { month: '2026-07-01', collected: 13_680_000, expected: 14_400_000 },
    { month: '2026-08-01', collected: 14_360_000, expected: 14_400_000 },
    { month: '2026-09-01', collected: 14_680_000, expected: 15_000_000 },
    { month: '2026-10-01', collected: 13_720_000, expected: 15_560_000 },
    { month: '2026-11-01', collected: 15_368_000, expected: 16_040_000 },
  ],
  occupancy: { rented: 50, vacant: 1, underWorks: 1 },
  lateRents: [
    {
      id: 'lr1',
      tenant: 'Awa Diallo',
      property: 'Résidence Les Oliviers · Apt 4',
      amount: 340_000,
      dueDate: '2026-10-05',
    },
    {
      id: 'lr2',
      tenant: 'Marc Lefèvre',
      property: 'Immeuble Bellevue · Apt 12',
      amount: 288_000,
      dueDate: '2026-10-28',
    },
    {
      id: 'lr3',
      tenant: 'Sarah Mbarga',
      property: 'Immeuble Bellevue · Apt 3',
      amount: 276_000,
      dueDate: '2026-11-01',
    },
    {
      id: 'lr4',
      tenant: 'Julien Moreau',
      property: 'Résidence Les Oliviers · Apt 9',
      amount: 364_000,
      dueDate: '2026-11-03',
    },
  ],
  deadlines: [
    { id: 'd1', kind: 'leaseEnd', property: 'Villa Harmonie', date: '2026-11-15' },
    { id: 'd2', kind: 'insurance', property: 'Immeuble Bellevue', date: '2026-11-22' },
    {
      id: 'd3',
      kind: 'rentReview',
      property: 'Résidence Les Oliviers · Apt 7',
      date: '2026-12-01',
    },
    { id: 'd4', kind: 'inspection', property: 'Immeuble Bellevue · Apt 18', date: '2026-12-10' },
  ],
  maintenance: [
    {
      id: 'm1',
      title: 'Fuite chauffe-eau',
      property: 'Immeuble Bellevue · Apt 6',
      status: 'inProgress',
      priority: 'urgent',
      openedAt: '2026-11-04',
    },
    {
      id: 'm2',
      title: 'Remplacement serrure',
      property: 'Résidence Les Oliviers · Apt 2',
      status: 'scheduled',
      priority: 'normal',
      openedAt: '2026-11-02',
    },
    {
      id: 'm3',
      title: 'Peinture cage d’escalier',
      property: 'Immeuble Bellevue',
      status: 'new',
      priority: 'low',
      openedAt: '2026-11-05',
    },
  ],
  recentProperties: [
    {
      id: 'p1',
      name: 'Résidence Les Oliviers',
      city: 'Lyon',
      type: 'residence',
      units: 12,
      occupiedUnits: 12,
    },
    { id: 'p2', name: 'Villa Harmonie', city: 'Annecy', type: 'house', units: 1, occupiedUnits: 1 },
    {
      id: 'p3',
      name: 'Immeuble Bellevue',
      city: 'Grenoble',
      type: 'building',
      units: 24,
      occupiedUnits: 22,
    },
  ],
}

/** Date de référence des données fictives (« aujourd'hui »). */
export const MOCK_TODAY = new Date('2026-11-06T12:00:00')
