import { FieldError, Input, ListBox, Select, TextField } from '@heroui/react'
import { useId } from 'react'
import { type Control, Controller, type FieldPath, type FieldValues } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useCountryName } from '@/lib/countries'
import { dialCodes } from '../constants'

/** Téléphone : indicatif du pays et numéro, sous un même libellé. */
export function FormPhoneField<T extends FieldValues>({
  control,
  countryName,
  numberName,
  label,
}: {
  control: Control<T>
  countryName: FieldPath<T>
  numberName: FieldPath<T>
  label: string
}) {
  const { t } = useTranslation()
  const country = useCountryName()
  const labelId = useId()

  return (
    <div className="flex w-full flex-col gap-1">
      <span id={labelId} className="label label--required">
        {label}
      </span>
      <div className="flex items-start gap-2">
        <Controller
          control={control}
          name={countryName}
          render={({ field }) => (
            <Select
              aria-label={t('auth.fields.dialCode')}
              value={field.value}
              onChange={(key) => key && field.onChange(String(key))}
              className="w-[6.5rem] shrink-0"
            >
              <Select.Trigger ref={field.ref}>
                <Select.Value>{({ selectedText }) => selectedText}</Select.Value>
                <Select.Indicator />
              </Select.Trigger>
              <Select.Popover className="min-w-60">
                <ListBox>
                  {dialCodes.map((d) => (
                    <ListBox.Item
                      key={d.country}
                      id={d.country}
                      textValue={`${d.country} ${d.code}`}
                    >
                      <span className="flex-1">{country(d.country)}</span>
                      <span className="text-muted tabular-nums">{d.code}</span>
                      <ListBox.ItemIndicator />
                    </ListBox.Item>
                  ))}
                </ListBox>
              </Select.Popover>
            </Select>
          )}
        />
        <Controller
          control={control}
          name={numberName}
          render={({ field, fieldState }) => (
            <TextField
              name={field.name}
              type="tel"
              autoComplete="tel-national"
              aria-labelledby={labelId}
              value={field.value ?? ''}
              onChange={field.onChange}
              onBlur={field.onBlur}
              isInvalid={fieldState.invalid}
              isRequired
              validationBehavior="aria"
              className="min-w-0 flex-1"
            >
              <Input
                ref={field.ref}
                inputMode="tel"
                placeholder={t('auth.fields.phonePlaceholder')}
              />
              <FieldError>{fieldState.error?.message}</FieldError>
            </TextField>
          )}
        />
      </div>
    </div>
  )
}
