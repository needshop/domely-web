import type { DashboardData } from './types'

/**
 * Données fictives du tableau de bord (montants en XOF), en attendant l'API (../api).
 * Même forme que la future réponse : remplacer par un appel dans services/.
 */
export const dashboardMock: DashboardData = {
  kpis: {
    properties: { addedThisMonth: 2 },
    tenants: { newThisMonth: 3 },
  },
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
}
