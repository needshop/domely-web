import { Description, FieldError, InputGroup, Label, TextField } from '@heroui/react'
import { Check, Circle, Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { type Control, Controller, type FieldPath, type FieldValues } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/cn'
import { type PasswordRule, passwordRules } from '../utils'

/** Mot de passe avec bouton afficher / masquer et, en option, les règles vérifiées en direct. */
export function FormPasswordField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  autoComplete,
  showRules = false,
  isRequired = true,
}: {
  control: Control<T>
  name: FieldPath<T>
  label: string
  description?: string
  autoComplete: 'current-password' | 'new-password'
  showRules?: boolean
  isRequired?: boolean
}) {
  const { t } = useTranslation()
  const [visible, setVisible] = useState(false)
  const ToggleIcon = visible ? EyeOff : Eye

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <TextField
          name={field.name}
          type={visible ? 'text' : 'password'}
          autoComplete={autoComplete}
          value={field.value ?? ''}
          onChange={field.onChange}
          onBlur={field.onBlur}
          isInvalid={fieldState.invalid}
          isRequired={isRequired}
          validationBehavior="aria"
          className="w-full"
        >
          <Label>{label}</Label>
          <InputGroup>
            <InputGroup.Input ref={field.ref} />
            <InputGroup.Suffix className="pr-1">
              <button
                type="button"
                onClick={() => setVisible((v) => !v)}
                aria-label={t(visible ? 'auth.fields.hidePassword' : 'auth.fields.showPassword')}
                aria-pressed={visible}
                className="flex size-8 cursor-pointer items-center justify-center rounded-md text-muted transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-focus"
              >
                <ToggleIcon className="size-4" aria-hidden />
              </button>
            </InputGroup.Suffix>
          </InputGroup>
          {description && <Description>{description}</Description>}
          {showRules && <PasswordRules value={String(field.value ?? '')} />}
          <FieldError>{fieldState.error?.message}</FieldError>
        </TextField>
      )}
    />
  )
}

function PasswordRules({ value }: { value: string }) {
  const { t } = useTranslation()
  return (
    <ul
      className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs"
      aria-label={t('auth.passwordRules.title')}
    >
      {(Object.keys(passwordRules) as PasswordRule[]).map((rule) => {
        const ok = passwordRules[rule](value)
        const Icon = ok ? Check : Circle
        return (
          <li
            key={rule}
            className={cn(
              'flex items-center gap-1',
              ok ? 'text-success-soft-foreground' : 'text-muted',
            )}
          >
            <Icon className={ok ? 'size-3.5' : 'size-2.5'} aria-hidden />
            {t(`auth.passwordRules.${rule}`)}
            <span className="sr-only">
              {t(ok ? 'auth.passwordRules.met' : 'auth.passwordRules.unmet')}
            </span>
          </li>
        )
      })}
    </ul>
  )
}
