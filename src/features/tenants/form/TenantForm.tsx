import { Label, ToggleButton, ToggleButtonGroup } from '@heroui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Building, User } from 'lucide-react'
import { useEffect, useMemo } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { FormSelect, FormTextArea, FormTextField } from '@/components/form/fields'
import {
  FormActionBar,
  FormErrorSummary,
  FormSection,
  LeaveGuard,
} from '@/components/form/FormLayout'
import { emergencyRelations, type Tenant, type TenantKind } from '../types'
import { idDocumentsByKind, makeTenantSchema, type TenantFormValues } from './schema'

interface TenantFormProps {
  defaultValues: TenantFormValues
  /** Autres locataires (contrôle des doublons de téléphone) */
  others: Tenant[]
  submitLabel: string
  onSubmit: (values: TenantFormValues) => Promise<void>
  onCancel: () => void
}

export function TenantForm({
  defaultValues,
  others,
  submitLabel,
  onSubmit,
  onCancel,
}: TenantFormProps) {
  const { t } = useTranslation()
  // Le schéma (et ses messages) suit la langue active
  const schema = useMemo(() => makeTenantSchema(t, others), [t, others])

  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    formState: { isDirty, isSubmitting, isSubmitSuccessful, submitCount, errors },
  } = useForm<TenantFormValues>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: 'onTouched',
  })

  const kind = useWatch({ control, name: 'kind' })
  const isCompany = kind === 'company'
  const idTypes = idDocumentsByKind[kind]

  // Changement de type : la pièce d'identité choisie peut ne plus convenir (CNI ↔ RCCM)
  useEffect(() => {
    const idType = getValues('idType')
    if (idType && !idTypes.includes(idType)) {
      setValue('idType', idTypes.length === 1 ? idTypes[0] : null, { shouldDirty: true })
    }
  }, [idTypes, getValues, setValue])

  const hasErrors = submitCount > 0 && Object.keys(errors).length > 0

  return (
    <form
      noValidate
      onSubmit={(e) => void handleSubmit(onSubmit)(e)}
      className="flex flex-col gap-6"
    >
      <FormErrorSummary show={hasErrors} />

      <FormSection
        title={t('tenants.form.sections.identity')}
        hint={t('tenants.form.sections.identityHint')}
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <Controller
            control={control}
            name="kind"
            render={({ field }) => (
              <div className="flex flex-col gap-1 sm:col-span-2">
                <Label id="tenant-kind-label">{t('tenants.form.fields.kind')}</Label>
                <ToggleButtonGroup
                  aria-labelledby="tenant-kind-label"
                  selectionMode="single"
                  disallowEmptySelection
                  selectedKeys={new Set([field.value])}
                  onSelectionChange={(keys) => {
                    const [next] = keys
                    if (next) field.onChange(next as TenantKind)
                  }}
                  className="self-start"
                >
                  <ToggleButton id="individual">
                    <User className="size-4" aria-hidden />
                    {t('tenants.kind.individual')}
                  </ToggleButton>
                  <ToggleButton id="company">
                    <ToggleButtonGroup.Separator />
                    <Building className="size-4" aria-hidden />
                    {t('tenants.kind.company')}
                  </ToggleButton>
                </ToggleButtonGroup>
              </div>
            )}
          />
          <FormTextField
            control={control}
            name="name"
            label={
              isCompany ? t('tenants.form.fields.companyName') : t('tenants.form.fields.fullName')
            }
            placeholder={
              isCompany
                ? t('tenants.form.fields.companyNamePlaceholder')
                : t('tenants.form.fields.fullNamePlaceholder')
            }
            autoComplete={isCompany ? 'organization' : 'name'}
            isRequired
          />
          <FormTextField
            control={control}
            name="occupation"
            label={
              isCompany
                ? t('tenants.detail.contact.activity')
                : t('tenants.detail.contact.occupation')
            }
            placeholder={
              isCompany
                ? t('tenants.form.fields.activityPlaceholder')
                : t('tenants.form.fields.occupationPlaceholder')
            }
          />
          {isCompany && (
            <FormTextField
              control={control}
              name="contactPerson"
              label={t('tenants.detail.contact.contactPerson')}
              description={t('tenants.form.fields.contactPersonHint')}
            />
          )}
        </div>
      </FormSection>

      <FormSection
        title={t('tenants.form.sections.contact')}
        hint={t('tenants.form.sections.contactHint')}
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <FormTextField
            control={control}
            name="phone"
            type="tel"
            autoComplete="tel"
            label={t('tenants.detail.contact.phone')}
            placeholder="+221 77 123 45 67"
            description={t('tenants.form.fields.phoneHint')}
            isRequired
          />
          <FormTextField
            control={control}
            name="email"
            type="email"
            autoComplete="email"
            label={t('tenants.detail.contact.email')}
            placeholder={t('tenants.form.fields.emailPlaceholder')}
          />
        </div>
      </FormSection>

      <FormSection
        title={t('tenants.form.sections.idDocument')}
        hint={t('tenants.form.sections.idDocumentHint')}
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <FormSelect
            control={control}
            name="idType"
            label={t('tenants.form.fields.idType')}
            options={idTypes.map((type) => ({
              id: type,
              label: t(`tenants.idDocument.${type}`),
            }))}
          />
          <FormTextField
            control={control}
            name="idNumber"
            label={t('tenants.form.fields.idNumber')}
          />
        </div>
      </FormSection>

      {!isCompany && (
        <FormSection
          title={t('tenants.detail.contact.emergency')}
          hint={t('tenants.form.sections.emergencyHint')}
        >
          <div className="grid gap-5 sm:grid-cols-3">
            <FormTextField
              control={control}
              name="emergencyName"
              label={t('tenants.form.fields.emergencyName')}
            />
            <FormSelect
              control={control}
              name="emergencyRelation"
              label={t('tenants.form.fields.emergencyRelation')}
              options={emergencyRelations.map((r) => ({
                id: r,
                label: t(`tenants.relation.${r}`),
              }))}
            />
            <FormTextField
              control={control}
              name="emergencyPhone"
              type="tel"
              label={t('tenants.form.fields.emergencyPhone')}
            />
          </div>
        </FormSection>
      )}

      <FormSection
        title={t('tenants.detail.contact.notes')}
        hint={t('tenants.form.sections.notesHint')}
      >
        <FormTextArea
          control={control}
          name="notes"
          label={t('tenants.detail.contact.notes')}
          placeholder={t('tenants.form.fields.notesPlaceholder')}
        />
      </FormSection>

      <FormActionBar submitLabel={submitLabel} isSubmitting={isSubmitting} onCancel={onCancel} />

      {/* Prévenir avant de quitter avec des modifications non enregistrées */}
      <LeaveGuard when={isDirty && !isSubmitting && !isSubmitSuccessful} />
    </form>
  )
}
