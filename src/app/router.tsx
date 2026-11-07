import { createBrowserRouter } from 'react-router'
import { AppLayout } from '@/components/layout/AppLayout'
import { navigation } from '@/components/layout/navigation'
import { DashboardPage } from '@/pages/DashboardPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { PlaceholderPage } from '@/pages/PlaceholderPage'
import { PropertiesPage } from '@/pages/PropertiesPage'
import { PropertyDetailPage } from '@/pages/PropertyDetailPage'
import { PropertyFormPage } from '@/pages/PropertyFormPage'

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
      // Modules à implémenter progressivement
      ...navigation
        .filter((item) => !['/', '/properties'].includes(item.to))
        .map((item) => ({
          path: item.to.slice(1),
          element: <PlaceholderPage navKey={item.key} />,
        })),
    ],
  },
  { path: '*', element: <NotFoundPage /> },
])
