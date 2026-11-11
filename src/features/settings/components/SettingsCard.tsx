import { Button, Card } from '@heroui/react'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

/**
 * Carte d'un groupe de paramètres. Avec `onSubmit`, c'est un formulaire avec un bouton
 * « Enregistrer ». Le bouton reste toujours actif : un champ numérique ne valide sa saisie
 * qu'en perdant le focus, et un bouton désactivé ne prend pas le focus au clic — la saisie
 * ne serait alors jamais enregistrable.
 */
export function SettingsCard({
  title,
  description,
  isSubmitting,
  onSubmit,
  footer,
  children,
}: {
  title: string
  description?: string
  isSubmitting?: boolean
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void
  /** Actions supplémentaires à gauche du bouton Enregistrer */
  footer?: ReactNode
  children: ReactNode
}) {
  const { t } = useTranslation()
  const body = (
    <Card className="gap-5 p-5 sm:p-6">
      <Card.Header>
        <Card.Title className="font-display text-base">{title}</Card.Title>
        {description && <Card.Description>{description}</Card.Description>}
      </Card.Header>
      <Card.Content>{children}</Card.Content>
      {(onSubmit || footer) && (
        <Card.Footer className="flex flex-wrap items-center justify-end gap-3 border-t border-separator pt-4">
          {footer}
          {onSubmit && (
            <Button type="submit" variant="primary" isPending={isSubmitting}>
              {t('settings.save')}
            </Button>
          )}
        </Card.Footer>
      )}
    </Card>
  )
  return onSubmit ? (
    <form noValidate onSubmit={onSubmit}>
      {body}
    </form>
  ) : (
    body
  )
}
