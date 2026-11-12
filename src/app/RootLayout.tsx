import { RouterProvider as AriaRouterProvider } from 'react-aria-components'
import { Outlet, ScrollRestoration, useHref, useNavigate } from 'react-router'

/** Racine de toutes les routes : liens React Aria / HeroUI via React Router, défilement. */
export function RootLayout() {
  const navigate = useNavigate()
  return (
    // Les liens React Aria / HeroUI naviguent via React Router (pas de rechargement)
    <AriaRouterProvider navigate={(to) => void navigate(to)} useHref={useHref}>
      <Outlet />
      {/* Retour en haut de page à chaque navigation, position restaurée au retour arrière */}
      <ScrollRestoration />
    </AriaRouterProvider>
  )
}
