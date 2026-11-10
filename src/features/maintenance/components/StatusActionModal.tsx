import { Button, Modal, toast } from '@heroui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import {
  FormDateField,
  FormNumberField,
  FormTextArea,
  FormTextField,
} from '@/components/form/fields'
import { BASE_CURRENCY } from '@/lib/currency'
import { todayIso } from '@/lib/dates'
import { updateIntervention } from '../api'
import type { Intervention } from '../types'
import { withStatus } from '../utils'

const amountFormat: Intl.NumberFormatOptions = {
  style: 'currency',
  currency: BASE_CURRENCY,
  maximumFractionDigits: 0,
}

/** Actions qui demandent une saisie (les autres s'appliquent directement). */
export type ModalAction = 'schedule' | 'complete' | 'cancel'

interface StatusActionModalProps {
  intervention: Intervention
  action: ModalAction | null
  onClose: () => void
}

/** Planifier (date + prestataire), terminer (date + coût réel) ou annuler (motif). */
export function StatusActionModal({ intervention, action, onClose }: StatusActionModalProps) {
  return (
    <Modal.Backdrop isOpen={action !== null} onOpenChange={(open) => !open && onClose()}>
      <Modal.Container>
        <Modal.Dialog className="sm:max-w-md">
          {action && (
            <ActionForm
              key={action}
              intervention={intervention}
              action={action}
              onClose={onClose}
            />
          )}
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  )
}

function ActionForm({
  intervention: i,
  action,
  onClose,
}: {
  intervention: Intervention
  action: ModalAction
  onClose: () => void
}) {
  const { t } = useTranslation()
  const required = t('form.errors.required')

  const schema = useMemo(
    () =>
      z
        .object({
          date: z.string(),
          providerName: z.string().trim().max(120),
          providerPhone: z.string().trim().max(30),
          cost: z
            .number()
            .min(0, { error: t('properties.form.errors.min0') })
            .nullable(),
          note: z.string().trim().max(500),
        })
        .superRefine((v, ctx) => {
          const issue = (path: string, message = required) =>
            ctx.addIssue({ code: 'custom', path: [path], message })
          if (action === 'cancel') return
          if (!v.date) return issue('date')
          if (v.date < i.reportedAt) issue('date', t('maintenance.actions.errors.beforeReport'))
          if (action === 'complete' && v.date > todayIso()) {
            issue('date', t('rents.payment.errors.future'))
          }
        }),
    [t, required, action, i.reportedAt],
  )
  type Values = z.input<typeof schema>

  const { control, handleSubmit, formState } = useForm<Values>({
    resolver: zodResolver(schema),
    // Revalidation à la soumission : évite que la fenêtre se redimensionne sous le curseur
    reValidateMode: 'onSubmit',
    defaultValues: {
      date: action === 'schedule' ? (i.scheduledAt ?? '') : todayIso(),
      providerName: i.provider?.name ?? '',
      providerPhone: i.provider?.phone ?? '',
      cost: i.actualCost ?? i.estimatedCost ?? null,
      note: '',
    },
  })

  const submit = handleSubmit(async (v) => {
    const provider = v.providerName
      ? { name: v.providerName, phone: v.providerPhone || undefined }
      : i.provider
    const updated =
      action === 'schedule'
        ? withStatus(i, 'scheduled', { scheduledAt: v.date, provider }, v.note)
        : action === 'complete'
          ? withStatus(i, 'done', { completedAt: v.date, actualCost: v.cost ?? undefined }, v.note)
          : withStatus(i, 'cancelled', {}, v.note)
    await updateIntervention(updated)
    toast.success(t(`maintenance.actions.toast.${action}`), { description: i.title })
    onClose()
  })

  return (
    <form noValidate onSubmit={(e) => void submit(e)}>
      <Modal.Header>
        <Modal.Heading>{t(`maintenance.actions.${action}Title`)}</Modal.Heading>
      </Modal.Header>
      <Modal.Body className="flex flex-col gap-4">
        <p className="text-sm text-muted">{i.title}</p>
        {action === 'schedule' && (
          <>
            <FormDateField
              control={control}
              name="date"
              label={t('maintenance.fields.scheduledAt')}
              isRequired
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <FormTextField
                control={control}
                name="providerName"
                label={t('maintenance.fields.providerName')}
              />
              <FormTextField
                control={control}
                name="providerPhone"
                type="tel"
                label={t('maintenance.fields.providerPhone')}
              />
            </div>
          </>
        )}
        {action === 'complete' && (
          <div className="grid gap-4 sm:grid-cols-2">
            <FormDateField
              control={control}
              name="date"
              label={t('maintenance.fields.completedAt')}
              isRequired
            />
            <FormNumberField
              control={control}
              name="cost"
              label={t('maintenance.fields.actualCost')}
              formatOptions={amountFormat}
              minValue={0}
            />
          </div>
        )}
        <FormTextArea
          control={control}
          name="note"
          label={
            action === 'cancel'
              ? t('maintenance.actions.cancelReason')
              : t('maintenance.actions.note')
          }
          rows={3}
        />
      </Modal.Body>
      <Modal.Footer>
        <Button variant="tertiary" onPress={onClose}>
          {t('form.actions.cancel')}
        </Button>
        <Button
          type="submit"
          variant={action === 'cancel' ? 'danger' : 'primary'}
          isPending={formState.isSubmitting}
        >
          {t(`maintenance.actions.${action}Confirm`)}
        </Button>
      </Modal.Footer>
    </form>
  )
}
