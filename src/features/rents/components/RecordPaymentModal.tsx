import { Button, Modal, toast } from '@heroui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { FormDateField, FormNumberField, FormSelect, FormTextField } from '@/components/form/fields'
import { BASE_CURRENCY } from '@/lib/currency'
import { todayIso } from '@/lib/dates'
import { useFormatters } from '@/lib/format'
import { recordPayment } from '../api'
import { paymentMethods, type RentDueRow } from '../types'

const amountFormat: Intl.NumberFormatOptions = {
  style: 'currency',
  currency: BASE_CURRENCY,
  maximumFractionDigits: 0,
}

interface RecordPaymentModalProps {
  /** Échéance à encaisser ; null = fenêtre fermée */
  row: RentDueRow | null
  onClose: () => void
}

/** Enregistrement d'un encaissement, total (par défaut) ou partiel. */
export function RecordPaymentModal({ row, onClose }: RecordPaymentModalProps) {
  const { t } = useTranslation()
  const f = useFormatters()
  const remaining = row?.due.remaining ?? 0

  const schema = useMemo(
    () =>
      z.object({
        amount: z
          .number({ error: t('form.errors.required') })
          .nullable()
          .refine((v) => v !== null && v > 0, { error: t('properties.form.errors.positive') })
          .refine((v) => v === null || v <= remaining, {
            error: t('rents.payment.errors.tooMuch', { amount: f.moneyExact(remaining) }),
          }),
        date: z
          .string()
          .min(1, { error: t('form.errors.required') })
          .refine((v) => v <= todayIso(), { error: t('rents.payment.errors.future') }),
        method: z.enum(paymentMethods),
        reference: z.string().trim().max(60),
        note: z.string().trim().max(200),
      }),
    [t, f, remaining],
  )
  type Values = z.input<typeof schema>

  const { control, handleSubmit, reset, formState } = useForm<Values>({
    resolver: zodResolver(schema),
    // Revalidation à la soumission seulement : effacer l'erreur au blur raccourcirait la fenêtre
    // sous le curseur, et le clic sur « Enregistrer » tomberait à côté du bouton
    reValidateMode: 'onSubmit',
  })

  // Nouvelle échéance : montant restant dû et date du jour proposés
  useEffect(() => {
    if (row) {
      reset({
        amount: row.due.remaining,
        date: todayIso(),
        method: 'mobileMoney',
        reference: '',
        note: '',
      })
    }
  }, [row, reset])

  const submit = handleSubmit(async (v) => {
    if (!row || v.amount === null) return
    await recordPayment({
      leaseId: row.due.leaseId,
      period: row.due.period,
      date: v.date,
      amount: v.amount,
      method: v.method,
      reference: v.reference || undefined,
      note: v.note || undefined,
    })
    const full = v.amount >= row.due.remaining
    toast.success(full ? t('rents.payment.toastFull') : t('rents.payment.toastPartial'), {
      description: t('rents.payment.toastDescription', {
        amount: f.moneyExact(v.amount),
        tenant: row.tenant?.name ?? '—',
        month: f.monthLong(new Date(`${row.due.period}-15T12:00:00`)),
      }),
    })
    onClose()
  })

  return (
    <Modal.Backdrop isOpen={row !== null} onOpenChange={(open) => !open && onClose()}>
      <Modal.Container>
        <Modal.Dialog className="sm:max-w-md">
          {row && (
            <form noValidate onSubmit={(e) => void submit(e)}>
              <Modal.Header>
                <Modal.Heading>{t('rents.payment.title')}</Modal.Heading>
              </Modal.Header>
              <Modal.Body className="flex flex-col gap-4">
                <div className="rounded-xl bg-default px-4 py-3 text-sm">
                  <p className="font-medium">{row.tenant?.name ?? '—'}</p>
                  <p className="text-xs text-muted">
                    {row.property?.name} · {row.unit?.label} ·{' '}
                    {f.monthLong(new Date(`${row.due.period}-15T12:00:00`))}
                  </p>
                  <p className="mt-2 flex justify-between gap-3 text-xs">
                    <span className="text-muted">{t('rents.payment.remaining')}</span>
                    <span className="font-semibold tabular-nums">
                      {f.moneyExact(row.due.remaining)}
                    </span>
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormNumberField
                    control={control}
                    name="amount"
                    label={t('rents.payment.amount')}
                    formatOptions={amountFormat}
                    minValue={0}
                    isRequired
                  />
                  <FormDateField
                    control={control}
                    name="date"
                    label={t('rents.payment.date')}
                    isRequired
                  />
                  <FormSelect
                    control={control}
                    name="method"
                    label={t('rents.payment.method')}
                    options={paymentMethods.map((m) => ({ id: m, label: t(`rents.method.${m}`) }))}
                    isRequired
                  />
                  <FormTextField
                    control={control}
                    name="reference"
                    label={t('rents.payment.reference')}
                    placeholder={t('rents.payment.referencePlaceholder')}
                  />
                  <FormTextField
                    control={control}
                    name="note"
                    label={t('rents.payment.note')}
                    className="sm:col-span-2"
                  />
                </div>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="tertiary" onPress={onClose}>
                  {t('form.actions.cancel')}
                </Button>
                <Button type="submit" variant="primary" isPending={formState.isSubmitting}>
                  {t('rents.payment.submit')}
                </Button>
              </Modal.Footer>
            </form>
          )}
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  )
}
