import { Button, Chip } from '@heroui/react'
import { Lock, Plus, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { type Control, useFieldArray, useFormState, useWatch } from 'react-hook-form'
import { FormNumberField, FormSelect, FormTextField } from '@/components/form/fields'
import { BASE_CURRENCY } from '@/lib/currency'
import { emptyUnit } from './mapping'
import { isSingleUnitType, type PropertyFormValues, unitKinds } from './schema'

const amountFormat: Intl.NumberFormatOptions = {
  style: 'currency',
  currency: BASE_CURRENCY,
  maximumFractionDigits: 0,
}

export function UnitsFieldArray({ control }: { control: Control<PropertyFormValues> }) {
  const { t } = useTranslation()
  const { fields, append, remove } = useFieldArray({ control, name: 'units' })
  const type = useWatch({ control, name: 'type' })
  const units = useWatch({ control, name: 'units' })
  const { errors } = useFormState({ control, name: 'units' })
  const single = isSingleUnitType(type)
  const arrayError = errors.units?.root?.message ?? errors.units?.message

  const kindOptions = unitKinds.map((k) => ({ id: k, label: t(`properties.unitKind.${k}`) }))
  const statusOptions = (['vacant', 'underWorks'] as const).map((s) => ({
    id: s,
    label: t(`properties.unitStatus.${s}`),
  }))

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs text-muted">{t('properties.form.fields.amountsHint')}</p>

      <ol className="flex flex-col gap-4">
        {fields.map((field, index) => {
          const unit = units?.[index]
          const isRented = unit?.status === 'rented'
          const label = unit?.label || `#${index + 1}`
          return (
            <li
              key={field.id}
              className="rounded-xl border border-border bg-background-secondary/40 p-4"
              aria-label={label}
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-default font-display text-xs">
                    {index + 1}
                  </span>
                  {isRented && unit?.tenantName && (
                    <Chip size="sm" variant="soft" color="success">
                      {t('properties.form.units.rentedBy', { name: unit.tenantName })}
                    </Chip>
                  )}
                </div>
                {(!single || fields.length > 1) && (
                  <Button
                    isIconOnly
                    size="sm"
                    variant="ghost"
                    isDisabled={isRented || fields.length === 1}
                    aria-label={t('properties.form.units.remove', { label })}
                    onPress={() => remove(index)}
                    className="text-danger"
                  >
                    <Trash2 className="size-4" aria-hidden />
                  </Button>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <FormTextField
                  control={control}
                  name={`units.${index}.label`}
                  label={t('properties.form.fields.unitLabel')}
                  isRequired
                />
                <FormSelect
                  control={control}
                  name={`units.${index}.kind`}
                  label={t('properties.form.fields.unitKind')}
                  options={kindOptions}
                  isRequired
                />
                <FormNumberField
                  control={control}
                  name={`units.${index}.floor`}
                  label={t('properties.form.fields.floor')}
                  description={t('properties.form.fields.floorHint')}
                  minValue={-5}
                />
                {isRented ? (
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium">
                      {t('properties.form.fields.status')}
                    </span>
                    <p className="flex h-10 items-center gap-2 text-sm">
                      <Lock className="size-3.5 text-muted" aria-hidden />
                      {t('properties.unitStatus.rented')}
                    </p>
                    <p className="text-xs text-muted">{t('properties.form.units.rentedLocked')}</p>
                  </div>
                ) : (
                  <FormSelect
                    control={control}
                    name={`units.${index}.status`}
                    label={t('properties.form.fields.status')}
                    options={statusOptions}
                    isRequired
                  />
                )}
                <FormNumberField
                  control={control}
                  name={`units.${index}.area`}
                  label={t('properties.form.fields.area')}
                  minValue={0}
                  isRequired
                />
                <FormNumberField
                  control={control}
                  name={`units.${index}.rooms`}
                  label={t('properties.form.fields.rooms')}
                  minValue={1}
                />
                <FormNumberField
                  control={control}
                  name={`units.${index}.rent`}
                  label={t('properties.form.fields.rent')}
                  formatOptions={amountFormat}
                  minValue={0}
                  step={5_000}
                  isRequired
                />
                <FormNumberField
                  control={control}
                  name={`units.${index}.charges`}
                  label={t('properties.form.fields.charges')}
                  formatOptions={amountFormat}
                  minValue={0}
                  step={1_000}
                />
              </div>
            </li>
          )
        })}
      </ol>

      {arrayError && (
        <p role="alert" className="text-sm text-danger">
          {arrayError}
        </p>
      )}

      {!single && (
        <Button
          variant="secondary"
          className="self-start"
          onPress={() =>
            append(emptyUnit(type, fields.length, t('properties.form.units.labelPrefix')))
          }
        >
          <Plus className="size-4" aria-hidden />
          {t('properties.form.units.add')}
        </Button>
      )}
    </div>
  )
}
