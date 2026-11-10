import { Button, Card } from '@heroui/react'
import { Download } from 'lucide-react'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/cn'

/** Carte de rapport : titre, sous-titre, export CSV facultatif. */
export function ReportCard({
  title,
  subtitle,
  onExport,
  className,
  children,
}: {
  title: string
  subtitle?: string
  onExport?: () => void
  className?: string
  children: ReactNode
}) {
  const { t } = useTranslation()
  return (
    <Card className={cn('gap-4 p-5', className)}>
      <Card.Header className="flex-row flex-wrap items-start justify-between gap-3">
        <div>
          <Card.Title className="font-display text-base">{title}</Card.Title>
          {subtitle && <Card.Description>{subtitle}</Card.Description>}
        </div>
        {onExport && (
          <Button size="sm" variant="tertiary" onPress={onExport}>
            <Download className="size-3.5" aria-hidden />
            {t('reports.exportCsv')}
          </Button>
        )}
      </Card.Header>
      <Card.Content>{children}</Card.Content>
    </Card>
  )
}
