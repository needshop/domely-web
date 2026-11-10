import { Button, buttonVariants, Label, Modal, TextArea, TextField, toast } from '@heroui/react'
import { Mail, MessageCircle, MessageSquareText } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/cn'
import { todayIso } from '@/lib/dates'
import { useFormatters } from '@/lib/format'
import { recordReminder } from '../api'
import type { ReminderChannel, RentDueRow } from '../types'

interface SendReminderModalProps {
  /** Échéance impayée à relancer ; null = fenêtre fermée */
  row: RentDueRow | null
  onClose: () => void
}

const channelIcon = { whatsapp: MessageCircle, sms: MessageSquareText, email: Mail } as const

/**
 * Relance d'un impayé : message pré-rédigé (modifiable), envoyé depuis l'appareil de
 * l'utilisateur via WhatsApp, SMS ou e-mail. La relance est enregistrée sur l'échéance.
 */
export function SendReminderModal({ row, onClose }: SendReminderModalProps) {
  return (
    <Modal.Backdrop isOpen={row !== null} onOpenChange={(open) => !open && onClose()}>
      <Modal.Container>
        <Modal.Dialog className="sm:max-w-lg">
          {row && <ReminderContent key={row.due.id} row={row} onClose={onClose} />}
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  )
}

function ReminderContent({ row, onClose }: { row: RentDueRow; onClose: () => void }) {
  const { t } = useTranslation()
  const f = useFormatters()
  // Message proposé à partir du locataire, du lot et du montant dû (modifiable).
  // Le contenu est remonté à chaque échéance (key), d'où l'initialisation directe.
  const [message, setMessage] = useState(() =>
    t('rents.reminder.template', {
      name: row.tenant?.name ?? '',
      month: f.monthLong(new Date(`${row.due.period}-15T12:00:00`)),
      unit: row.unit?.label ?? '',
      property: row.property?.name ?? '',
      amount: f.moneyExact(row.due.remaining),
      date: f.dayMonthYear(new Date(`${row.due.dueDate}T12:00:00`)),
    }),
  )

  const tenant = row.tenant
  const phone = tenant?.phone.replace(/[^\d+]/g, '') ?? ''
  const text = encodeURIComponent(message)
  const subject = encodeURIComponent(
    t('rents.reminder.subject', {
      month: f.monthLong(new Date(`${row.due.period}-15T12:00:00`)),
    }),
  )

  const channels: { id: ReminderChannel; href?: string }[] = [
    {
      id: 'whatsapp',
      href: phone ? `https://wa.me/${phone.replace('+', '')}?text=${text}` : undefined,
    },
    { id: 'sms', href: phone ? `sms:${phone}?&body=${text}` : undefined },
    {
      id: 'email',
      href: tenant?.email ? `mailto:${tenant.email}?subject=${subject}&body=${text}` : undefined,
    },
  ]

  const send = (channel: ReminderChannel) => {
    void recordReminder({
      leaseId: row.due.leaseId,
      period: row.due.period,
      date: todayIso(),
      channel,
    })
    toast.success(t('rents.reminder.toast'), {
      description: t('rents.reminder.toastDescription', {
        tenant: tenant?.name ?? '—',
        channel: t(`rents.reminder.channel.${channel}`),
      }),
    })
    onClose()
  }

  return (
    <>
      <Modal.Header>
        <Modal.Heading>{t('rents.reminder.title', { tenant: tenant?.name ?? '—' })}</Modal.Heading>
      </Modal.Header>
      <Modal.Body className="flex flex-col gap-4">
        <div className="rounded-xl bg-default px-4 py-3 text-sm">
          <p className="flex justify-between gap-3">
            <span className="text-muted">
              {row.property?.name} · {row.unit?.label}
            </span>
            <span className="font-semibold tabular-nums">{f.moneyExact(row.due.remaining)}</span>
          </p>
          <p className="mt-0.5 text-xs text-danger">
            {t('rents.daysLate', { count: row.due.daysLate })}
          </p>
          {row.lastReminder && (
            <p className="mt-0.5 text-xs text-muted">
              {t('rents.reminder.last', {
                date: f.dayMonthYear(new Date(`${row.lastReminder.date}T12:00:00`)),
                channel: t(`rents.reminder.channel.${row.lastReminder.channel}`),
              })}
            </p>
          )}
        </div>

        <TextField value={message} onChange={setMessage} className="w-full">
          <Label>{t('rents.reminder.message')}</Label>
          <TextArea rows={7} />
        </TextField>

        <div>
          <p className="mb-2 text-sm font-medium">{t('rents.reminder.sendWith')}</p>
          <div className="grid gap-2 sm:grid-cols-3">
            {channels.map(({ id, href }) => {
              const Icon = channelIcon[id]
              const label = t(`rents.reminder.channel.${id}`)
              return href ? (
                <a
                  key={id}
                  href={href}
                  target={id === 'whatsapp' ? '_blank' : undefined}
                  rel="noreferrer"
                  onClick={() => send(id)}
                  className={cn(buttonVariants({ variant: 'secondary' }), 'w-full')}
                >
                  <Icon className="size-4" aria-hidden />
                  {label}
                </a>
              ) : (
                <span
                  key={id}
                  aria-disabled
                  title={t('rents.reminder.unavailable')}
                  className={cn(
                    buttonVariants({ variant: 'secondary' }),
                    'w-full cursor-not-allowed opacity-50',
                  )}
                >
                  <Icon className="size-4" aria-hidden />
                  {label}
                </span>
              )
            })}
          </div>
          <p className="mt-2 text-xs text-muted">{t('rents.reminder.hint')}</p>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="tertiary" onPress={onClose}>
          {t('rents.reminder.close')}
        </Button>
      </Modal.Footer>
    </>
  )
}
