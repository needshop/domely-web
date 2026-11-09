import { Avatar } from '@heroui/react'
import { Building } from 'lucide-react'
import { initials } from '@/lib/initials'
import { cn } from '@/lib/cn'
import type { Tenant } from '../types'

/** Initiales pour un particulier, pictogramme pour une société. */
export function TenantAvatar({
  tenant,
  size = 'md',
  className,
}: {
  tenant: Tenant
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  return (
    <Avatar size={size} className={cn('shrink-0', className)}>
      <Avatar.Fallback
        className={tenant.kind === 'company' ? 'bg-night-900/8 dark:bg-white/10' : ''}
      >
        {tenant.kind === 'company' ? (
          <Building className={size === 'lg' ? 'size-6' : 'size-4'} aria-hidden />
        ) : (
          initials(tenant.name)
        )}
      </Avatar.Fallback>
    </Avatar>
  )
}
