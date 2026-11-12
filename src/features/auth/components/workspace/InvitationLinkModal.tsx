import { Button, buttonVariants, Modal } from '@heroui/react'
import { Check, Copy, MailCheck } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

/**
 * Confirmation d'envoi. Aucun e-mail n'est envoyé pour l'instant : le lien d'invitation est
 * affiché pour la démonstration (à copier ou ouvrir après déconnexion).
 */
export function InvitationLinkModal({
  invitation,
  onClose,
}: {
  invitation: { link: string; name: string; email: string } | null
  onClose: () => void
}) {
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)
  const url = invitation ? `${window.location.origin}${invitation.link}` : ''

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* presse-papiers indisponible : le lien reste sélectionnable */
    }
  }

  return (
    <Modal.Backdrop
      isOpen={invitation !== null}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <Modal.Container>
        <Modal.Dialog className="sm:max-w-lg">
          <Modal.Header>
            <span className="mb-2 flex size-12 items-center justify-center rounded-full bg-success-soft text-success-soft-foreground">
              <MailCheck className="size-6" aria-hidden />
            </span>
            <Modal.Heading>{t('workspace.invite.sentTitle')}</Modal.Heading>
          </Modal.Header>
          <Modal.Body className="flex flex-col gap-4">
            <p className="text-sm">
              {t('workspace.invite.sentDescription', {
                name: invitation?.name,
                email: invitation?.email,
              })}
            </p>
            <div className="rounded-xl border border-border bg-surface-secondary p-3">
              <p className="text-xs text-muted">{t('workspace.invite.demoLink')}</p>
              <p className="mt-1 text-sm break-all" data-testid="invitation-link">
                {url}
              </p>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="tertiary" onPress={() => void copy()}>
              {copied ? (
                <Check className="size-4" aria-hidden />
              ) : (
                <Copy className="size-4" aria-hidden />
              )}
              <span aria-live="polite">
                {t(copied ? 'auth.success.copied' : 'workspace.invite.copyLink')}
              </span>
            </Button>
            <Link
              to={invitation?.link ?? '/'}
              className={buttonVariants({ variant: 'secondary' })}
              onClick={onClose}
            >
              {t('workspace.invite.openLink')}
            </Link>
            <Button variant="primary" onPress={onClose}>
              {t('workspace.invite.done')}
            </Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  )
}
