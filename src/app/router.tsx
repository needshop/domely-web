import { createBrowserRouter } from 'react-router'
import { AppLayout } from '@/components/layout/AppLayout'
import { navigation } from '@/components/layout/navigation'
import { ContractDetailPage } from '@/pages/ContractDetailPage'
import { ContractFormPage } from '@/pages/ContractFormPage'
import { ContractsPage } from '@/pages/ContractsPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { InterventionDetailPage } from '@/pages/InterventionDetailPage'
import { InterventionFormPage } from '@/pages/InterventionFormPage'
import { MaintenancePage } from '@/pages/MaintenancePage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { PlaceholderPage } from '@/pages/PlaceholderPage'
import { PropertiesPage } from '@/pages/PropertiesPage'
import { PropertyDetailPage } from '@/pages/PropertyDetailPage'
import { PropertyFormPage } from '@/pages/PropertyFormPage'
import { RentsPage } from '@/pages/RentsPage'
import { ReportsPage } from '@/pages/ReportsPage'
import { TenantDetailPage } from '@/pages/TenantDetailPage'
import { TenantFormPage } from '@/pages/TenantFormPage'
import { TenantsPage } from '@/pages/TenantsPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'properties', element: <PropertiesPage /> },
      { path: 'properties/new', element: <PropertyFormPage mode="create" /> },
      { path: 'properties/:id', element: <PropertyDetailPage /> },
      { path: 'properties/:id/edit', element: <PropertyFormPage mode="edit" /> },
      { path: 'tenants', element: <TenantsPage /> },
      { path: 'tenants/new', element: <TenantFormPage mode="create" /> },
      { path: 'tenants/:id', element: <TenantDetailPage /> },
      { path: 'tenants/:id/edit', element: <TenantFormPage mode="edit" /> },
      { path: 'rents', element: <RentsPage /> },
      { path: 'maintenance', element: <MaintenancePage /> },
      { path: 'maintenance/new', element: <InterventionFormPage mode="create" /> },
      { path: 'maintenance/:id', element: <InterventionDetailPage /> },
      { path: 'maintenance/:id/edit', element: <InterventionFormPage mode="edit" /> },
      { path: 'contracts', element: <ContractsPage /> },
      { path: 'reports', element: <ReportsPage /> },
      { path: 'contracts/new', element: <ContractFormPage mode="create" /> },
      { path: 'contracts/:id', element: <ContractDetailPage /> },
      { path: 'contracts/:id/edit', element: <ContractFormPage mode="edit" /> },
      // Modules à implémenter progressivement
      ...navigation
        .filter(
          (item) =>
            ![
              '/',
              '/properties',
              '/tenants',
              '/rents',
              '/maintenance',
              '/contracts',
              '/reports',
            ].includes(item.to),
        )
        .map((item) => ({
          path: item.to.slice(1),
          element: <PlaceholderPage navKey={item.key} />,
        })),
    ],
  },
  { path: '*', element: <NotFoundPage /> },
])
