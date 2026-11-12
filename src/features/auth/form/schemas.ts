import type { TFunction } from 'i18next'
import { z } from 'zod'
import { type DialCountry, dialCodes } from '../constants'
import { accountProfiles, professionalKinds } from '../types'
import { IDENTIFIER_PATTERN, isStrongPassword } from '../utils'
import { isValidNationalNumber } from './phone'

const dialCountries = dialCodes.map((d) => d.country) as [DialCountry, ...DialCountry[]]

const phoneFields = (t: TFunction) => ({
  phoneCountry: z.enum(dialCountries),
  phoneNumber: z
    .string()
    .trim()
    .min(1, t('form.errors.required'))
    .refine(isValidNationalNumber, t('auth.errors.invalidPhone')),
})

const emailField = (t: TFunction) =>
  z.email({
    error: (issue) => (issue.input ? t('form.errors.invalidEmail') : t('form.errors.required')),
  })

const newPasswordField = (t: TFunction) =>
  z
    .string()
    .min(1, t('form.errors.required'))
    .refine(isStrongPassword, t('auth.errors.weakPassword'))

export const makeLoginSchema = (t: TFunction) =>
  z.object({
    identifier: z
      .string()
      .min(1, t('form.errors.required'))
      .regex(IDENTIFIER_PATTERN, t('auth.errors.invalidIdentifier')),
    password: z.string().min(1, t('form.errors.required')),
    remember: z.boolean(),
  })
export type LoginValues = z.infer<ReturnType<typeof makeLoginSchema>>

export const profileSchema = z.object({
  profile: z.enum(accountProfiles),
})

/** Informations du compte ; l'agence et l'immatriculation ne concernent que les professionnels. */
export const makeDetailsSchema = (t: TFunction, isProfessional: boolean) =>
  z
    .object({
      firstName: z.string().trim().min(1, t('form.errors.required')).max(60),
      lastName: z.string().trim().min(1, t('form.errors.required')).max(60),
      email: emailField(t),
      ...phoneFields(t),
      password: newPasswordField(t),
      professionalKind: z.enum(professionalKinds),
      agencyName: z.string().trim().max(120),
      registrationNumber: z.string().trim().max(30),
    })
    .superRefine((v, ctx) => {
      if (!isProfessional) return
      if (!v.agencyName)
        ctx.addIssue({ code: 'custom', path: ['agencyName'], message: t('form.errors.required') })
      if (!v.registrationNumber)
        ctx.addIssue({
          code: 'custom',
          path: ['registrationNumber'],
          message: t('form.errors.required'),
        })
      else if (!/^[A-Za-z0-9 ./-]{5,30}$/.test(v.registrationNumber))
        ctx.addIssue({
          code: 'custom',
          path: ['registrationNumber'],
          message: t('auth.errors.invalidRegistration'),
        })
    })
export type DetailsValues = z.infer<ReturnType<typeof makeDetailsSchema>>

export const emptyDetails: DetailsValues = {
  firstName: '',
  lastName: '',
  email: '',
  phoneCountry: 'SN',
  phoneNumber: '',
  password: '',
  professionalKind: 'agency',
  agencyName: '',
  registrationNumber: '',
}

/** Mot de passe ou identifiant oublié : e-mail et téléphone du compte. */
export const makeRecoverySchema = (t: TFunction) =>
  z.object({
    email: emailField(t),
    ...phoneFields(t),
  })
export type RecoveryValues = z.infer<ReturnType<typeof makeRecoverySchema>>

export const makeResetSchema = (t: TFunction) =>
  z
    .object({
      password: newPasswordField(t),
      confirmation: z.string().min(1, t('form.errors.required')),
    })
    .refine((v) => v.password === v.confirmation, {
      path: ['confirmation'],
      message: t('auth.errors.passwordMismatch'),
    })
export type ResetValues = z.infer<ReturnType<typeof makeResetSchema>>
