import { Button, Card, Modal } from '@heroui/react'
import { AlertCircle } from 'lucide-react'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { useBlocker } from 'react-router'

/** Section de formulaire : carte avec titre et aide. */
export function FormSection({
  title,
  hint,
  children,
}: {
  title: string
  hint?: string
  children: ReactNode
}) {
  return (
    <Card className="gap-5 p-5 sm:p-6">
      <Card.Header>
        <Card.Title className="font-display text-base">{title}</Card.Title>
        {hint && <Card.Description>{hint}</Card.Description>}
      </Card.Header>
      <Card.Content>{children}</Card.Content>
    </Card>
  )
}

/** Bandeau affiché après une soumission invalide. */
export function FormErrorSummary({ show }: { show: boolean }) {
  const { t } = useTranslation()
  if (!show) return null
  return (
    <div
      role="alert"
      className="flex items-center gap-2 rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger-soft-foreground"
    >
      <AlertCircle className="size-4 shrink-0" aria-hidden />
      {t('form.errors.summary')}
    </div>
  )
}

/** Barre d'actions flottante, toujours visible en bas de l'écran. */
export function FormActionBar({
  submitLabel,
  isSubmitting,
  onCancel,
}: {
  submitLabel: string
  isSubmitting: boolean
  onCancel: () => void
}) {
  const { t } = useTranslation()
  return (
    <div className="sticky bottom-4 z-10 flex justify-end gap-3 rounded-2xl border border-border bg-surface/90 px-4 py-3 shadow-overlay backdrop-blur">
      <Button variant="tertiary" onPress={onCancel}>
        {t('form.actions.cancel')}
      </Button>
      <Button type="submit" variant="primary" isPending={isSubmitting}>
        {isSubmitting ? t('form.actions.saving') : submitLabel}
      </Button>
    </div>
  )
}

/** Garde-fou : confirmation avant de quitter une page avec des modifications non enregistrées. */
export function LeaveGuard({ when }: { when: boolean }) {
  const { t } = useTranslation()
  const blocker = useBlocker(when)

  return (
    <Modal.Backdrop
      isOpen={blocker.state === 'blocked'}
      onOpenChange={(open) => {
        if (!open && blocker.state === 'blocked') blocker.reset()
      }}
    >
      <Modal.Container>
        <Modal.Dialog className="sm:max-w-sm">
          <Modal.Header>
            <Modal.Heading>{t('form.leave.title')}</Modal.Heading>
          </Modal.Header>
          <Modal.Body>
            <p className="text-sm text-muted">{t('form.leave.description')}</p>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="tertiary" onPress={() => blocker.reset?.()}>
              {t('form.leave.stay')}
            </Button>
            <Button variant="danger" onPress={() => blocker.proceed?.()}>
              {t('form.leave.leave')}
            </Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  )
}
