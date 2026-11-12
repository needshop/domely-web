import { Avatar } from '@heroui/react'
import { Building } from 'lucide-react'
import { cn } from '@/lib/cn'
import { initials } from '@/lib/initials'
import type { Landlord } from '../types'

/** Initiales pour un particulier, pictogramme pour une société. */
export function LandlordAvatar({
  landlord,
  size = 'md',
  className,
}: {
  landlord: Landlord
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  const isCompany = landlord.kind === 'company'
  return (
    <Avatar size={size} className={cn('shrink-0', className)}>
      <Avatar.Fallback className={isCompany ? 'bg-night-900/8 dark:bg-white/10' : ''}>
        {isCompany ? (
          <Building className={size === 'lg' ? 'size-6' : 'size-4'} aria-hidden />
        ) : (
          initials(landlord.name)
        )}
      </Avatar.Fallback>
    </Avatar>
  )
}
