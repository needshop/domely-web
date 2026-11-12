import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router'
import { useSession } from '../api'

/** Réservé aux utilisateurs connectés : sinon, page de connexion (retour prévu après coup). */
export function RequireAuth({ children }: { children: ReactNode }) {
  const session = useSession()
  const location = useLocation()
  if (!session) {
    const from = `${location.pathname}${location.search}${location.hash}`
    return <Navigate to="/login" replace state={from === '/' ? undefined : { from }} />
  }
  return children
}

/**
 * Pages réservées aux visiteurs (connexion, inscription…). Un utilisateur connecté repart vers
 * la page demandée avant la connexion, ou vers l'accueil : c'est ce qui redirige après le login.
 */
export function GuestOnly({ children }: { children: ReactNode }) {
  const session = useSession()
  const location = useLocation()
  if (!session) return children
  const from = (location.state as { from?: string } | null)?.from
  return <Navigate to={from?.startsWith('/') ? from : '/'} replace />
}
