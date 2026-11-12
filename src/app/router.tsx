import { createBrowserRouter, Outlet } from 'react-router'
import { RootLayout } from '@/app/RootLayout'
import { AppLayout } from '@/components/layout/AppLayout'
import { GuestOnly, RequireAuth, RequireProfessional } from '@/features/auth/components/AuthGuards'
import { AuthLayout } from '@/features/auth/components/AuthLayout'
import { ContractDetailPage } from '@/pages/ContractDetailPage'
import { ContractFormPage } from '@/pages/ContractFormPage'
import { ContractsPage } from '@/pages/ContractsPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { InterventionDetailPage } from '@/pages/InterventionDetailPage'
import { InterventionFormPage } from '@/pages/InterventionFormPage'
import { LandlordDetailPage } from '@/pages/LandlordDetailPage'
import { LandlordFormPage } from '@/pages/LandlordFormPage'
import { LandlordsPage } from '@/pages/LandlordsPage'
import { LoginPage } from '@/pages/LoginPage'
import { MaintenancePage } from '@/pages/MaintenancePage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { PropertiesPage } from '@/pages/PropertiesPage'
import { PropertyDetailPage } from '@/pages/PropertyDetailPage'
import { PropertyFormPage } from '@/pages/PropertyFormPage'
import { RecoveryPage } from '@/pages/RecoveryPage'
import { RentsPage } from '@/pages/RentsPage'
import { ReportsPage } from '@/pages/ReportsPage'
import { ResetPasswordPage } from '@/pages/ResetPasswordPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { SignupPage } from '@/pages/SignupPage'
import { TenantDetailPage } from '@/pages/TenantDetailPage'
import { TenantFormPage } from '@/pages/TenantFormPage'
import { TenantsPage } from '@/pages/TenantsPage'

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
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
              { path: 'login', element: <LoginPage /> },
              { path: 'signup', element: <SignupPage /> },
              { path: 'forgot-password', element: <RecoveryPage key="password" mode="password" /> },
              {
                path: 'forgot-identifier',
                element: <RecoveryPage key="identifier" mode="identifier" />,
              },
            ],
          },
          // Accessible connecté ou non : le lien vient d'un e-mail
          { path: 'reset-password', element: <ResetPasswordPage /> },
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
          { index: true, element: <DashboardPage /> },
          { path: 'properties', element: <PropertiesPage /> },
          { path: 'properties/new', element: <PropertyFormPage mode="create" /> },
          { path: 'properties/:id', element: <PropertyDetailPage /> },
          { path: 'properties/:id/edit', element: <PropertyFormPage mode="edit" /> },
          // Bailleurs : comptes professionnels uniquement
          {
            path: 'landlords',
            element: (
              <RequireProfessional>
                <Outlet />
              </RequireProfessional>
            ),
            children: [
              { index: true, element: <LandlordsPage /> },
              { path: 'new', element: <LandlordFormPage mode="create" /> },
              { path: ':id', element: <LandlordDetailPage /> },
              { path: ':id/edit', element: <LandlordFormPage mode="edit" /> },
            ],
          },
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
          { path: 'contracts/new', element: <ContractFormPage mode="create" /> },
          { path: 'contracts/:id', element: <ContractDetailPage /> },
          { path: 'contracts/:id/edit', element: <ContractFormPage mode="edit" /> },
          { path: 'reports', element: <ReportsPage /> },
          { path: 'settings', element: <SettingsPage /> },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
