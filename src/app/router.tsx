import { createBrowserRouter } from 'react-router'
import { AppLayout } from '@/components/layout/AppLayout'
import { navigation } from '@/components/layout/navigation'
import { DashboardPage } from '@/pages/DashboardPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { PlaceholderPage } from '@/pages/PlaceholderPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      // Modules à implémenter progressivement
      ...navigation
        .filter((item) => item.to !== '/')
        .map((item) => ({
          path: item.to.slice(1),
          element: <PlaceholderPage navKey={item.key} />,
        })),
    ],
  },
  { path: '*', element: <NotFoundPage /> },
])
