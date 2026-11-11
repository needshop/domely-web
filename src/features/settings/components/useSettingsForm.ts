import { toast } from '@heroui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { type DefaultValues, type FieldValues, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import type { z } from 'zod'

/**
 * Formulaire d'un groupe de paramètres : validation zod, enregistrement, toast, puis
 * remise à zéro de l'état « modifié » sur les valeurs enregistrées.
 */
export function useSettingsForm<T extends FieldValues>(
  schema: z.ZodType<T, T>,
  values: T,
  save: (values: T) => Promise<void>,
) {
  const { t } = useTranslation()
  const form = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues: values as DefaultValues<T>,
    mode: 'onTouched',
  })
  const onSubmit = form.handleSubmit(async (v) => {
    await save(v)
    form.reset(v)
    toast.success(t('settings.saved'))
  })
  return { ...form, onSubmit: (e: React.FormEvent<HTMLFormElement>) => void onSubmit(e) }
}
