import { Button, Modal } from '@heroui/react'

/** Confirmation d'une action sensible (désactiver un compte, annuler une invitation). */
export function ConfirmModal({
  isOpen,
  title,
  description,
  confirmLabel,
  cancelLabel,
  isPending,
  onConfirm,
  onCancel,
}: {
  isOpen: boolean
  title: string
  description: string
  confirmLabel: string
  cancelLabel: string
  isPending: boolean
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <Modal.Backdrop
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open) onCancel()
      }}
    >
      <Modal.Container>
        <Modal.Dialog className="sm:max-w-sm">
          <Modal.Header>
            <Modal.Heading>{title}</Modal.Heading>
          </Modal.Header>
          <Modal.Body>
            <p className="text-sm text-muted">{description}</p>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="tertiary" onPress={onCancel}>
              {cancelLabel}
            </Button>
            <Button variant="danger" isPending={isPending} onPress={onConfirm}>
              {confirmLabel}
            </Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  )
}
