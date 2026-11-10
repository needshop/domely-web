import { Button, Modal, toast } from '@heroui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { FormDateField, FormSelect } from '@/components/form/fields'
import { todayIso } from '@/lib/dates'
import { terminateLease } from '../api'
import { type Lease, terminationReasons } from '../types'

interface TerminateLeaseModalProps {
  lease: Lease
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

/** Résiliation d'un contrat : date d'effet et motif. */
export function TerminateLeaseModal({ lease, isOpen, onOpenChange }: TerminateLeaseModalProps) {
  const { t } = useTranslation()

  const schema = useMemo(
    () =>
      z
        .object({
          date: z.string().min(1, { error: t('form.errors.required') }),
          reason: z.enum(terminationReasons, { error: t('form.errors.required') }).nullable(),
        })
        .superRefine((v, ctx) => {
          if (!v.reason) {
            ctx.addIssue({ code: 'custom', path: ['reason'], message: t('form.errors.required') })
          }
          if (v.date && v.date < lease.startDate) {
            ctx.addIssue({
              code: 'custom',
              path: ['date'],
              message: t('contracts.terminate.errors.beforeStart'),
            })
          }
        }),
    [t, lease.startDate],
  )
  type Values = z.input<typeof schema>

  const { control, handleSubmit, reset, formState } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      // Par défaut : aujourd'hui, ou le début du bail s'il n'a pas commencé
      date: lease.startDate > todayIso() ? lease.startDate : todayIso(),
      reason: null,
    },
  })

  const submit = handleSubmit(async ({ date, reason }) => {
    if (!reason) return
    await terminateLease(lease, date, reason)
    toast.success(t('contracts.terminate.toast'), {
      description: t('contracts.terminate.toastDescription', { reference: lease.reference }),
    })
    onOpenChange(false)
    reset()
  })

  return (
    <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
      <Modal.Container>
        <Modal.Dialog className="sm:max-w-md">
          <form noValidate onSubmit={(e) => void submit(e)}>
            <Modal.Header>
              <Modal.Heading>
                {t('contracts.terminate.title', { reference: lease.reference })}
              </Modal.Heading>
            </Modal.Header>
            <Modal.Body className="flex flex-col gap-4">
              <p className="text-sm text-muted">{t('contracts.terminate.description')}</p>
              <FormDateField
                control={control}
                name="date"
                label={t('contracts.terminate.date')}
                description={t('contracts.terminate.dateHint')}
                isRequired
              />
              <FormSelect
                control={control}
                name="reason"
                label={t('contracts.terminate.reason')}
                options={terminationReasons.map((r) => ({
                  id: r,
                  label: t(`contracts.terminationReason.${r}`),
                }))}
                isRequired
              />
            </Modal.Body>
            <Modal.Footer>
              <Button variant="tertiary" onPress={() => onOpenChange(false)}>
                {t('form.actions.cancel')}
              </Button>
              <Button type="submit" variant="danger" isPending={formState.isSubmitting}>
                {t('contracts.terminate.confirm')}
              </Button>
            </Modal.Footer>
          </form>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  )
}
