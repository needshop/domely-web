import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Modal } from '@heroui/react'
import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { FormTextField } from '@/components/form/fields'
import { inviteMember } from '../../api'
import { authErrorCode } from '../../errors'
import { toInternationalPhone } from '../../form/phone'
import { FormPhoneField } from '../../form/PhoneField'
import { emptyInvitation, type InvitationValues, makeInvitationSchema } from '../../form/schemas'
import { useAuthErrorMessage } from '../../hooks/useAuthErrorMessage'
import { AuthAlert } from '../AuthAlert'

/** Invitation d'un gestionnaire : nom, e-mail et téléphone ; le lien part par e-mail. */
export function InviteMemberModal({
  isOpen,
  onOpenChange,
  onInvited,
}: {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onInvited: (link: string, values: InvitationValues) => void
}) {
  const { t } = useTranslation()
  const errorMessage = useAuthErrorMessage()
  const schema = useMemo(() => makeInvitationSchema(t), [t])
  const { control, handleSubmit, formState, setError, reset } = useForm<InvitationValues>({
    resolver: zodResolver(schema),
    defaultValues: emptyInvitation,
    // Fenêtre avec validation : pas de revalidation au blur (voir AGENTS.md, pièges connus)
    reValidateMode: 'onSubmit',
  })

  const onSubmit = handleSubmit(async (values) => {
    try {
      const link = await inviteMember({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phone: toInternationalPhone(values.phoneCountry, values.phoneNumber),
      })
      reset(emptyInvitation)
      onInvited(link, values)
    } catch (e) {
      const code = authErrorCode(e)
      if (code === 'emailTaken') setError('email', { message: errorMessage(e) })
      else if (code === 'phoneTaken') setError('phoneNumber', { message: errorMessage(e) })
      else setError('root', { message: errorMessage(e) })
    }
  })

  return (
    <Modal.Backdrop
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open) reset(emptyInvitation)
        onOpenChange(open)
      }}
    >
      <Modal.Container>
        <Modal.Dialog className="sm:max-w-lg">
          <form noValidate onSubmit={onSubmit}>
            <Modal.Header>
              <Modal.Heading>{t('workspace.invite.title')}</Modal.Heading>
              <p className="text-sm text-muted">{t('workspace.invite.description')}</p>
            </Modal.Header>
            <Modal.Body className="flex flex-col gap-5">
              {formState.errors.root?.message && (
                <AuthAlert status="danger">{formState.errors.root.message}</AuthAlert>
              )}
              <div className="grid gap-5 sm:grid-cols-2">
                <FormTextField
                  control={control}
                  name="lastName"
                  label={t('auth.fields.lastName')}
                  isRequired
                />
                <FormTextField
                  control={control}
                  name="firstName"
                  label={t('auth.fields.firstName')}
                  isRequired
                />
              </div>
              <FormTextField
                control={control}
                name="email"
                type="email"
                label={t('auth.fields.email')}
                description={t('workspace.invite.emailHint')}
                isRequired
              />
              <FormPhoneField
                control={control}
                countryName="phoneCountry"
                numberName="phoneNumber"
                label={t('auth.fields.phone')}
              />
            </Modal.Body>
            <Modal.Footer>
              <Button variant="tertiary" slot="close">
                {t('form.actions.cancel')}
              </Button>
              <Button type="submit" variant="primary" isPending={formState.isSubmitting}>
                {t('workspace.invite.submit')}
              </Button>
            </Modal.Footer>
          </form>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  )
}
