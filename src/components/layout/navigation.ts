import {
  BarChart3,
  Building2,
  FileText,
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
  | 'tenants'
  | 'rents'
  | 'maintenance'
  | 'contracts'
  | 'reports'
  | 'settings'

export interface NavItem {
  /** Clé de traduction sous `nav.*` */
  key: NavKey
  to: string
  icon: LucideIcon
}

export const navigation: NavItem[] = [
  { key: 'dashboard', to: '/', icon: House },
  { key: 'properties', to: '/properties', icon: Building2 },
  { key: 'tenants', to: '/tenants', icon: Users },
  { key: 'rents', to: '/rents', icon: Wallet },
  { key: 'maintenance', to: '/maintenance', icon: Wrench },
  { key: 'contracts', to: '/contracts', icon: FileText },
  { key: 'reports', to: '/reports', icon: BarChart3 },
  { key: 'settings', to: '/settings', icon: Settings },
]
