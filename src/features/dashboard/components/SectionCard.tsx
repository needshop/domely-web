import { Card, Link } from '@heroui/react'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/cn'

interface SectionCardProps {
  title: string
  subtitle?: string
  /** Lien « Tout voir » vers le module concerné */
  href?: string
  className?: string
  children: ReactNode
}

/** Carte de section du tableau de bord : titre, sous-titre et lien « Tout voir ». */
export function SectionCard({ title, subtitle, href, className, children }: SectionCardProps) {
  const { t } = useTranslation()

  return (
    <Card className={cn('gap-4 p-5', className)}>
      <Card.Header className="flex-row items-start justify-between gap-4">
        <div>
          <Card.Title className="font-display text-base">{title}</Card.Title>
          {subtitle && <Card.Description>{subtitle}</Card.Description>}
        </div>
        {href && (
          <Link href={href} className="shrink-0 text-sm">
            {t('dashboard.viewAll')}
          </Link>
        )}
      </Card.Header>
      <Card.Content>{children}</Card.Content>
    </Card>
  )
}
