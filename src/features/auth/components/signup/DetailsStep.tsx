import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Label, Radio, RadioGroup } from '@heroui/react'
import { ArrowLeft } from 'lucide-react'
import { useMemo } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { FormTextField } from '@/components/form/fields'
import { FormErrorSummary } from '@/components/form/FormLayout'
import { checkContactAvailability, sendOtp } from '../../api'
import { authErrorCode } from '../../errors'
import { FormPasswordField } from '../../form/PasswordField'
import { toInternationalPhone } from '../../form/phone'
import { FormPhoneField } from '../../form/PhoneField'
import { type DetailsValues, makeDetailsSchema } from '../../form/schemas'
import { type AccountProfile, professionalKinds } from '../../types'
import { AuthAlert } from '../AuthAlert'
import { useAuthErrorMessage } from '../../hooks/useAuthErrorMessage'

/** Étape 2 : informations du compte. À la validation, le code est envoyé au téléphone. */
export function DetailsStep({
  profile,
  defaultValues,
  onBack,
  onNext,
}: {
  profile: AccountProfile
  defaultValues: DetailsValues
  onBack: (values: DetailsValues) => void
  onNext: (values: DetailsValues, phone: string) => void
}) {
  const { t } = useTranslation()
  const errorMessage = useAuthErrorMessage()
  const isProfessional = profile === 'professional'
  const schema = useMemo(() => makeDetailsSchema(t, isProfessional), [t, isProfessional])
  const { control, handleSubmit, formState, setError, getValues } = useForm<DetailsValues>({
    resolver: zodResolver(schema),
    defaultValues,
  })

  const onSubmit = handleSubmit(async (values) => {
    const phone = toInternationalPhone(values.phoneCountry, values.phoneNumber)
    try {
      await checkContactAvailability(values.email, phone)
      await sendOtp(phone)
      onNext(values, phone)
    } catch (e) {
      const code = authErrorCode(e)
      if (code === 'emailTaken')
        setError('email', { message: errorMessage(e) }, { shouldFocus: true })
      else if (code === 'phoneTaken')
        setError('phoneNumber', { message: errorMessage(e) }, { shouldFocus: true })
      else setError('root', { message: errorMessage(e) })
    }
  })

  const hasFieldErrors = Object.keys(formState.errors).some((k) => k !== 'root')

  return (
    <form noValidate onSubmit={onSubmit} className="flex flex-col gap-5">
      <FormErrorSummary show={formState.isSubmitted && hasFieldErrors} />
      {formState.errors.root?.message && (
        <AuthAlert status="danger">{formState.errors.root.message}</AuthAlert>
      )}

      {isProfessional && (
        <Controller
          control={control}
          name="professionalKind"
          render={({ field }) => (
            <RadioGroup
              value={field.value}
              onChange={field.onChange}
              orientation="horizontal"
              className="flex flex-col gap-2"
            >
              <Label>{t('auth.signup.details.professionalKind')}</Label>
              <div className="flex flex-wrap gap-x-6 gap-y-2">
                {professionalKinds.map((kind) => (
                  <Radio key={kind} value={kind} className="flex flex-row items-center gap-2">
                    <Radio.Control>
                      <Radio.Indicator />
                    </Radio.Control>
                    <Radio.Content>
                      <Label>{t(`auth.professionalKinds.${kind}`)}</Label>
                    </Radio.Content>
                  </Radio>
                ))}
              </div>
            </RadioGroup>
          )}
        />
      )}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        <FormTextField
          control={control}
          name="lastName"
          label={t('auth.fields.lastName')}
          autoComplete="family-name"
          isRequired
        />
        <FormTextField
          control={control}
          name="firstName"
          label={t('auth.fields.firstName')}
          autoComplete="given-name"
          isRequired
        />
      </div>
      <FormTextField
        control={control}
        name="email"
        type="email"
        label={t('auth.fields.email')}
        description={t('auth.fields.emailHint')}
        autoComplete="email"
        isRequired
      />
      <FormPhoneField
        control={control}
        countryName="phoneCountry"
        numberName="phoneNumber"
        label={t('auth.fields.phone')}
      />

      {isProfessional && (
        <>
          <FormTextField
            control={control}
            name="agencyName"
            label={t('auth.fields.agencyName')}
            autoComplete="organization"
            isRequired
          />
          <FormTextField
            control={control}
            name="registrationNumber"
            label={t('auth.fields.registrationNumber')}
            description={t('auth.fields.registrationNumberHint')}
            isRequired
          />
        </>
      )}

      <FormPasswordField
        control={control}
        name="password"
        label={t('auth.fields.password')}
        autoComplete="new-password"
        showRules
      />

      <div className="flex gap-3">
        <Button variant="tertiary" onPress={() => onBack(getValues())}>
          <ArrowLeft className="size-4" aria-hidden />
          {t('auth.signup.back')}
        </Button>
        <Button
          type="submit"
          variant="primary"
          className="flex-1"
          isPending={formState.isSubmitting}
        >
          {t('auth.signup.details.submit')}
        </Button>
      </div>
    </form>
  )
}
