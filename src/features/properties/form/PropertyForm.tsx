import { Button, Card, Modal } from '@heroui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle } from 'lucide-react'
import { type ReactNode, useEffect, useMemo } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useBlocker } from 'react-router'
import { FormDateField, FormSelect, FormTextArea, FormTextField } from '@/components/form/fields'
import { supportedCountries, useCountryName } from '@/lib/countries'
import { propertyTypes } from '../types'
import { isSingleUnitType, makePropertySchema, type PropertyFormValues } from './schema'
import { UnitsFieldArray } from './UnitsFieldArray'

function Section({ title, hint, children }: { title: string; hint: string; children: ReactNode }) {
  return (
    <Card className="gap-5 p-5 sm:p-6">
      <Card.Header>
        <Card.Title className="font-display text-base">{title}</Card.Title>
        <Card.Description>{hint}</Card.Description>
      </Card.Header>
      <Card.Content>{children}</Card.Content>
    </Card>
  )
}

interface PropertyFormProps {
  defaultValues: PropertyFormValues
  submitLabel: string
  onSubmit: (values: PropertyFormValues) => Promise<void>
  onCancel: () => void
}

export function PropertyForm({
  defaultValues,
  submitLabel,
  onSubmit,
  onCancel,
}: PropertyFormProps) {
  const { t } = useTranslation()
  const countryName = useCountryName()
  // Le schéma (et ses messages) suit la langue active
  const schema = useMemo(() => makePropertySchema(t), [t])

  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    formState: { isDirty, isSubmitting, isSubmitSuccessful, submitCount, errors },
  } = useForm<PropertyFormValues>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: 'onTouched',
  })

  const type = useWatch({ control, name: 'type' })

  // Passage à un type à lot unique (appartement, maison) : si le bien n'a qu'un lot libre,
  // on aligne sa nature ; s'il en a plusieurs, le schéma signale les lots en trop.
  useEffect(() => {
    if (!isSingleUnitType(type)) return
    const units = getValues('units')
    if (units.length === 1 && units[0].status !== 'rented' && units[0].kind !== type) {
      setValue('units.0.kind', type as 'apartment' | 'house', { shouldDirty: true })
    }
  }, [type, getValues, setValue])

  // Garde-fou : prévenir avant de quitter avec des modifications non enregistrées
  const blocker = useBlocker(isDirty && !isSubmitting && !isSubmitSuccessful)

  const hasErrors = submitCount > 0 && Object.keys(errors).length > 0

  return (
    <form
      noValidate
      onSubmit={(e) => void handleSubmit(onSubmit)(e)}
      className="flex flex-col gap-6"
    >
      {hasErrors && (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger-soft-foreground"
        >
          <AlertCircle className="size-4 shrink-0" aria-hidden />
          {t('properties.form.errors.summary')}
        </div>
      )}

      <Section
        title={t('properties.form.sections.general')}
        hint={t('properties.form.sections.generalHint')}
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <FormTextField
            control={control}
            name="name"
            label={t('properties.form.fields.name')}
            placeholder={t('properties.form.fields.namePlaceholder')}
            isRequired
          />
          <FormSelect
            control={control}
            name="type"
            label={t('properties.form.fields.type')}
            options={propertyTypes.map((pt) => ({ id: pt, label: t(`properties.type.${pt}`) }))}
            isRequired
          />
          <FormDateField
            control={control}
            name="acquiredAt"
            label={t('properties.form.fields.acquiredAt')}
          />
          <FormTextArea
            control={control}
            name="description"
            label={t('properties.form.fields.description')}
            placeholder={t('properties.form.fields.descriptionPlaceholder')}
            className="sm:col-span-2"
          />
        </div>
      </Section>

      <Section
        title={t('properties.form.sections.address')}
        hint={t('properties.form.sections.addressHint')}
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <FormTextField
            control={control}
            name="address.street"
            label={t('properties.form.fields.street')}
            placeholder={t('properties.form.fields.streetPlaceholder')}
            isRequired
            className="sm:col-span-2"
          />
          <FormTextField
            control={control}
            name="address.district"
            label={t('properties.form.fields.district')}
            placeholder={t('properties.form.fields.districtPlaceholder')}
          />
          <FormTextField
            control={control}
            name="address.city"
            label={t('properties.form.fields.city')}
            placeholder={t('properties.form.fields.cityPlaceholder')}
            isRequired
          />
          <FormSelect
            control={control}
            name="address.country"
            label={t('properties.form.fields.country')}
            options={supportedCountries
              .map((c) => ({ id: c, label: countryName(c) }))
              .sort((a, b) => a.label.localeCompare(b.label))}
            isRequired
          />
        </div>
      </Section>

      <Section
        title={t('properties.form.sections.units')}
        hint={
          isSingleUnitType(type)
            ? t('properties.form.sections.unitsSingleHint')
            : t('properties.form.sections.unitsHint')
        }
      >
        <UnitsFieldArray control={control} />
      </Section>

      {/* Barre d'actions flottante, toujours visible en bas de l'écran */}
      <div className="sticky bottom-4 z-10 flex justify-end gap-3 rounded-2xl border border-border bg-surface/90 px-4 py-3 shadow-overlay backdrop-blur">
        <Button variant="tertiary" onPress={onCancel}>
          {t('properties.form.actions.cancel')}
        </Button>
        <Button type="submit" variant="primary" isPending={isSubmitting}>
          {isSubmitting ? t('properties.form.actions.saving') : submitLabel}
        </Button>
      </div>

      <Modal.Backdrop
        isOpen={blocker.state === 'blocked'}
        onOpenChange={(open) => {
          if (!open && blocker.state === 'blocked') blocker.reset()
        }}
      >
        <Modal.Container>
          <Modal.Dialog className="sm:max-w-sm">
            <Modal.Header>
              <Modal.Heading>{t('properties.form.leave.title')}</Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              <p className="text-sm text-muted">{t('properties.form.leave.description')}</p>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="tertiary" onPress={() => blocker.reset?.()}>
                {t('properties.form.leave.stay')}
              </Button>
              <Button variant="danger" onPress={() => blocker.proceed?.()}>
                {t('properties.form.leave.leave')}
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </form>
  )
}
