import {
  BarChart3,
  Building2,
  FileText,
  Handshake,
  Network,
  House,
  type LucideIcon,
  Settings,
  Users,
  Wallet,
  Wrench,
} from 'lucide-react'

export type NavKey =
  | 'dashboard'
  | 'properties'
  | 'landlords'
  | 'tenants'
  | 'rents'
  | 'maintenance'
  | 'contracts'
  | 'reports'
  | 'workspace'
  | 'settings'

export interface NavItem {
  /** Clé de traduction sous `nav.*` */
  key: NavKey
  to: string
  icon: LucideIcon
  /** Module réservé selon les rôles (voir `RequireAccess`) */
  access?: 'landlords' | 'workspace'
}

export const navigation: NavItem[] = [
  { key: 'dashboard', to: '/', icon: House },
  { key: 'properties', to: '/properties', icon: Building2 },
  { key: 'landlords', to: '/landlords', icon: Handshake, access: 'landlords' },
  { key: 'tenants', to: '/tenants', icon: Users },
  { key: 'rents', to: '/rents', icon: Wallet },
  { key: 'maintenance', to: '/maintenance', icon: Wrench },
  { key: 'contracts', to: '/contracts', icon: FileText },
  { key: 'reports', to: '/reports', icon: BarChart3 },
  { key: 'workspace', to: '/workspace', icon: Network, access: 'workspace' },
  { key: 'settings', to: '/settings', icon: Settings },
]
