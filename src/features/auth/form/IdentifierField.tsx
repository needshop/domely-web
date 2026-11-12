import { Description, FieldError, Input, Label, TextField } from '@heroui/react'
import { type Control, Controller, type FieldPath, type FieldValues } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { IDENTIFIER_LENGTH } from '../constants'
import { normalizeIdentifier } from '../utils'

/** Identifiant de connexion : 7 lettres et chiffres, saisi en majuscules. */
export function FormIdentifierField<T extends FieldValues>({
  control,
  name,
  autoFocus,
}: {
  control: Control<T>
  name: FieldPath<T>
  autoFocus?: boolean
}) {
  const { t } = useTranslation()
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <TextField
          name={field.name}
          autoComplete="username"
          value={field.value ?? ''}
          onChange={(v) => field.onChange(normalizeIdentifier(v).slice(0, IDENTIFIER_LENGTH))}
          onBlur={field.onBlur}
          isInvalid={fieldState.invalid}
          isRequired
          autoFocus={autoFocus}
          validationBehavior="aria"
          className="w-full"
        >
          <Label>{t('auth.fields.identifier')}</Label>
          <Input
            ref={field.ref}
            autoCapitalize="characters"
            autoCorrect="off"
            spellCheck={false}
            placeholder={t('auth.fields.identifierPlaceholder')}
            className="font-display tracking-[0.2em] uppercase placeholder:tracking-normal placeholder:normal-case"
          />
          <Description>{t('auth.fields.identifierHint')}</Description>
          <FieldError>{fieldState.error?.message}</FieldError>
        </TextField>
      )}
    />
  )
}
