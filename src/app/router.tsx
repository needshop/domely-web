import type { ReactElement } from 'react'
import { createBrowserRouter, Outlet } from 'react-router'
import { PageLoader } from '@/app/PageLoader'
import { RootLayout } from '@/app/RootLayout'
import { AppLayout } from '@/components/layout/AppLayout'
import { GuestOnly, RequireAuth, RequireProfessional } from '@/features/auth/components/AuthGuards'
import { AuthLayout } from '@/features/auth/components/AuthLayout'

/**
 * Page chargée à la demande : chaque page est un fichier JavaScript séparé, téléchargé à la
 * première visite (premier affichage plus rapide, surtout en connexion mobile). Les layouts et
 * les gardes, utilisés partout, restent dans le fichier principal.
 */
const page =
  <M,>(load: () => Promise<M>, render: (module: M) => ReactElement) =>
  async () => ({ element: render(await load()) })

const pages = {
  login: () => import('@/pages/LoginPage'),
  signup: () => import('@/pages/SignupPage'),
  recovery: () => import('@/pages/RecoveryPage'),
  resetPassword: () => import('@/pages/ResetPasswordPage'),
  dashboard: () => import('@/pages/DashboardPage'),
  properties: () => import('@/pages/PropertiesPage'),
  propertyDetail: () => import('@/pages/PropertyDetailPage'),
  propertyForm: () => import('@/pages/PropertyFormPage'),
  landlords: () => import('@/pages/LandlordsPage'),
  landlordDetail: () => import('@/pages/LandlordDetailPage'),
  landlordForm: () => import('@/pages/LandlordFormPage'),
  tenants: () => import('@/pages/TenantsPage'),
  tenantDetail: () => import('@/pages/TenantDetailPage'),
  tenantForm: () => import('@/pages/TenantFormPage'),
  rents: () => import('@/pages/RentsPage'),
  maintenance: () => import('@/pages/MaintenancePage'),
  interventionDetail: () => import('@/pages/InterventionDetailPage'),
  interventionForm: () => import('@/pages/InterventionFormPage'),
  contracts: () => import('@/pages/ContractsPage'),
  contractDetail: () => import('@/pages/ContractDetailPage'),
  contractForm: () => import('@/pages/ContractFormPage'),
  reports: () => import('@/pages/ReportsPage'),
  settings: () => import('@/pages/SettingsPage'),
  notFound: () => import('@/pages/NotFoundPage'),
}

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    // Affiché au tout premier chargement, le temps de télécharger la page demandée
    HydrateFallback: PageLoader,
    children: [
      // Authentification
      {
        element: <AuthLayout />,
        children: [
          {
            element: (
              <GuestOnly>
                <Outlet />
              </GuestOnly>
            ),
            children: [
              { path: 'login', lazy: page(pages.login, (m) => <m.LoginPage />) },
              { path: 'signup', lazy: page(pages.signup, (m) => <m.SignupPage />) },
              {
                path: 'forgot-password',
                lazy: page(pages.recovery, (m) => (
                  <m.RecoveryPage key="password" mode="password" />
                )),
              },
              {
                path: 'forgot-identifier',
                lazy: page(pages.recovery, (m) => (
                  <m.RecoveryPage key="identifier" mode="identifier" />
                )),
              },
            ],
          },
          // Accessible connecté ou non : le lien vient d'un e-mail
          {
            path: 'reset-password',
            lazy: page(pages.resetPassword, (m) => <m.ResetPasswordPage />),
          },
        ],
      },
      // Application (connexion requise)
      {
        path: '/',
        element: (
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        ),
        children: [
          { index: true, lazy: page(pages.dashboard, (m) => <m.DashboardPage />) },
          { path: 'properties', lazy: page(pages.properties, (m) => <m.PropertiesPage />) },
          {
            path: 'properties/new',
            lazy: page(pages.propertyForm, (m) => <m.PropertyFormPage mode="create" />),
          },
          {
            path: 'properties/:id',
            lazy: page(pages.propertyDetail, (m) => <m.PropertyDetailPage />),
          },
          {
            path: 'properties/:id/edit',
            lazy: page(pages.propertyForm, (m) => <m.PropertyFormPage mode="edit" />),
          },
          // Bailleurs : comptes professionnels uniquement
          {
            path: 'landlords',
            element: (
              <RequireProfessional>
                <Outlet />
              </RequireProfessional>
            ),
            children: [
              { index: true, lazy: page(pages.landlords, (m) => <m.LandlordsPage />) },
              {
                path: 'new',
                lazy: page(pages.landlordForm, (m) => <m.LandlordFormPage mode="create" />),
              },
              { path: ':id', lazy: page(pages.landlordDetail, (m) => <m.LandlordDetailPage />) },
              {
                path: ':id/edit',
                lazy: page(pages.landlordForm, (m) => <m.LandlordFormPage mode="edit" />),
              },
            ],
          },
          { path: 'tenants', lazy: page(pages.tenants, (m) => <m.TenantsPage />) },
          {
            path: 'tenants/new',
            lazy: page(pages.tenantForm, (m) => <m.TenantFormPage mode="create" />),
          },
          { path: 'tenants/:id', lazy: page(pages.tenantDetail, (m) => <m.TenantDetailPage />) },
          {
            path: 'tenants/:id/edit',
            lazy: page(pages.tenantForm, (m) => <m.TenantFormPage mode="edit" />),
          },
          { path: 'rents', lazy: page(pages.rents, (m) => <m.RentsPage />) },
          { path: 'maintenance', lazy: page(pages.maintenance, (m) => <m.MaintenancePage />) },
          {
            path: 'maintenance/new',
            lazy: page(pages.interventionForm, (m) => <m.InterventionFormPage mode="create" />),
          },
          {
            path: 'maintenance/:id',
            lazy: page(pages.interventionDetail, (m) => <m.InterventionDetailPage />),
          },
          {
            path: 'maintenance/:id/edit',
            lazy: page(pages.interventionForm, (m) => <m.InterventionFormPage mode="edit" />),
          },
          { path: 'contracts', lazy: page(pages.contracts, (m) => <m.ContractsPage />) },
          {
            path: 'contracts/new',
            lazy: page(pages.contractForm, (m) => <m.ContractFormPage mode="create" />),
          },
          {
            path: 'contracts/:id',
            lazy: page(pages.contractDetail, (m) => <m.ContractDetailPage />),
          },
          {
            path: 'contracts/:id/edit',
            lazy: page(pages.contractForm, (m) => <m.ContractFormPage mode="edit" />),
          },
          { path: 'reports', lazy: page(pages.reports, (m) => <m.ReportsPage />) },
          { path: 'settings', lazy: page(pages.settings, (m) => <m.SettingsPage />) },
        ],
      },
      { path: '*', lazy: page(pages.notFound, (m) => <m.NotFoundPage />) },
    ],
  },
])
