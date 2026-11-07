import {
  Calendar,
  DateField,
  DatePicker,
  Description,
  FieldError,
  Input,
  Label,
  ListBox,
  NumberField,
  Select,
  TextArea,
  TextField,
} from '@heroui/react'
import { parseDate } from '@internationalized/date'
import { type Control, Controller, type FieldPath, type FieldValues } from 'react-hook-form'
import { cn } from '@/lib/cn'

/**
 * Champs HeroUI reliés à react-hook-form (Controller).
 * La validation vient du schéma zod : les champs restent en validationBehavior « aria »
 * (pas de bulles natives du navigateur), l'erreur s'affiche dans FieldError.
 */

interface BaseProps<T extends FieldValues> {
  control: Control<T>
  name: FieldPath<T>
  label: string
  description?: string
  isRequired?: boolean
  isDisabled?: boolean
  className?: string
}

export function FormTextField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  isRequired,
  isDisabled,
  className,
  placeholder,
}: BaseProps<T> & { placeholder?: string }) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <TextField
          name={field.name}
          value={field.value ?? ''}
          onChange={field.onChange}
          onBlur={field.onBlur}
          isInvalid={fieldState.invalid}
          isRequired={isRequired}
          isDisabled={isDisabled}
          validationBehavior="aria"
          className={cn('w-full', className)}
        >
          <Label>{label}</Label>
          <Input ref={field.ref} placeholder={placeholder} />
          {description && <Description>{description}</Description>}
          <FieldError>{fieldState.error?.message}</FieldError>
        </TextField>
      )}
    />
  )
}

export function FormTextArea<T extends FieldValues>({
  control,
  name,
  label,
  description,
  isRequired,
  className,
  placeholder,
  rows = 4,
}: BaseProps<T> & { placeholder?: string; rows?: number }) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <TextField
          name={field.name}
          value={field.value ?? ''}
          onChange={field.onChange}
          onBlur={field.onBlur}
          isInvalid={fieldState.invalid}
          isRequired={isRequired}
          validationBehavior="aria"
          className={cn('w-full', className)}
        >
          <Label>{label}</Label>
          <TextArea ref={field.ref} placeholder={placeholder} rows={rows} />
          {description && <Description>{description}</Description>}
          <FieldError>{fieldState.error?.message}</FieldError>
        </TextField>
      )}
    />
  )
}

export function FormNumberField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  isRequired,
  isDisabled,
  className,
  formatOptions,
  minValue,
  step,
}: BaseProps<T> & {
  formatOptions?: Intl.NumberFormatOptions
  minValue?: number
  step?: number
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <NumberField
          name={field.name}
          // NumberField représente « vide » par NaN ; le formulaire, par null
          value={field.value ?? Number.NaN}
          onChange={(v) => field.onChange(Number.isNaN(v) ? null : v)}
          onBlur={field.onBlur}
          isInvalid={fieldState.invalid}
          isRequired={isRequired}
          isDisabled={isDisabled}
          formatOptions={formatOptions}
          minValue={minValue}
          step={step}
          validationBehavior="aria"
          className={cn('w-full', className)}
        >
          <Label>{label}</Label>
          <NumberField.Group>
            <NumberField.Input ref={field.ref} />
          </NumberField.Group>
          {description && <Description>{description}</Description>}
          <FieldError>{fieldState.error?.message}</FieldError>
        </NumberField>
      )}
    />
  )
}

export interface SelectOption {
  id: string
  label: string
}

export function FormSelect<T extends FieldValues>({
  control,
  name,
  label,
  description,
  isRequired,
  isDisabled,
  className,
  options,
}: BaseProps<T> & { options: SelectOption[] }) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Select
          name={field.name}
          value={field.value ?? null}
          onChange={(key) => field.onChange(key === null ? null : String(key))}
          onBlur={field.onBlur}
          isInvalid={fieldState.invalid}
          isRequired={isRequired}
          isDisabled={isDisabled}
          validationBehavior="aria"
          className={cn('w-full', className)}
        >
          <Label>{label}</Label>
          <Select.Trigger ref={field.ref}>
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>
          {description && <Description>{description}</Description>}
          <FieldError>{fieldState.error?.message}</FieldError>
          <Select.Popover>
            <ListBox>
              {options.map((o) => (
                <ListBox.Item key={o.id} id={o.id} textValue={o.label}>
                  {o.label}
                  <ListBox.ItemIndicator />
                </ListBox.Item>
              ))}
            </ListBox>
          </Select.Popover>
        </Select>
      )}
    />
  )
}

/** Date au format ISO « AAAA-MM-JJ » (chaîne vide = pas de date). */
export function FormDateField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  isRequired,
  className,
}: BaseProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <DatePicker
          name={field.name}
          value={field.value ? parseDate(field.value) : null}
          onChange={(date) => field.onChange(date ? date.toString() : '')}
          onBlur={field.onBlur}
          isInvalid={fieldState.invalid}
          isRequired={isRequired}
          validationBehavior="aria"
          className={cn('w-full', className)}
        >
          <Label>{label}</Label>
          <DateField.Group fullWidth>
            <DateField.Input>
              {(segment) => <DateField.Segment segment={segment} />}
            </DateField.Input>
            <DateField.Suffix>
              <DatePicker.Trigger>
                <DatePicker.TriggerIndicator />
              </DatePicker.Trigger>
            </DateField.Suffix>
          </DateField.Group>
          {description && <Description>{description}</Description>}
          <FieldError>{fieldState.error?.message}</FieldError>
          <DatePicker.Popover>
            <Calendar aria-label={label}>
              <Calendar.Header>
                <Calendar.YearPickerTrigger>
                  <Calendar.YearPickerTriggerHeading />
                  <Calendar.YearPickerTriggerIndicator />
                </Calendar.YearPickerTrigger>
                <Calendar.NavButton slot="previous" />
                <Calendar.NavButton slot="next" />
              </Calendar.Header>
              <Calendar.Grid>
                <Calendar.GridHeader>
                  {(day) => <Calendar.HeaderCell>{day}</Calendar.HeaderCell>}
                </Calendar.GridHeader>
                <Calendar.GridBody>{(date) => <Calendar.Cell date={date} />}</Calendar.GridBody>
              </Calendar.Grid>
              <Calendar.YearPickerGrid>
                <Calendar.YearPickerGridBody>
                  {({ year }) => <Calendar.YearPickerCell year={year} />}
                </Calendar.YearPickerGridBody>
              </Calendar.YearPickerGrid>
            </Calendar>
          </DatePicker.Popover>
        </DatePicker>
      )}
    />
  )
}
