import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { LeaveGuard } from '@/components/form/FormLayout'
import { registerAccount, sendOtp } from '@/features/auth/api'
import { AuthHeading } from '@/features/auth/components/AuthHeading'
import { OtpVerification } from '@/features/auth/components/OtpVerification'
import { DetailsStep } from '@/features/auth/components/signup/DetailsStep'
import { type DocumentFiles, DocumentsStep } from '@/features/auth/components/signup/DocumentsStep'
import { ProfileStep } from '@/features/auth/components/signup/ProfileStep'
import { SignupSuccess } from '@/features/auth/components/signup/SignupSuccess'
import { StepIndicator } from '@/features/auth/components/StepIndicator'
import { type DetailsValues, emptyDetails } from '@/features/auth/form/schemas'
import type { Account, AccountProfile, UploadedDocument } from '@/features/auth/types'
import { useAuthErrorMessage } from '@/features/auth/hooks/useAuthErrorMessage'

type Step = 'profile' | 'details' | 'verification' | 'documents'

/**
 * Création de compte en plusieurs étapes : profil, informations, vérification du téléphone
 * (OTP), puis justificatifs pour les professionnels. Les étapes restent en mémoire : un
 * rechargement repart du début (pas de données personnelles dans l'URL).
 */
export function SignupPage() {
  const { t } = useTranslation()
  const errorMessage = useAuthErrorMessage()
  const [step, setStep] = useState<Step>('profile')
  const [profile, setProfile] = useState<AccountProfile | null>(null)
  const [details, setDetails] = useState<DetailsValues>(emptyDetails)
  const [phone, setPhone] = useState('')
  const [account, setAccount] = useState<Account | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  const isProfessional = profile === 'professional'
  const steps: Step[] = isProfessional
    ? ['profile', 'details', 'verification', 'documents']
    : ['profile', 'details', 'verification']

  const create = async (documents: UploadedDocument[]) => {
    if (!profile) return
    setIsCreating(true)
    setCreateError(null)
    try {
      const created = await registerAccount({
        profile,
        professionalKind: isProfessional ? details.professionalKind : undefined,
        firstName: details.firstName.trim(),
        lastName: details.lastName.trim(),
        email: details.email,
        phone,
        password: details.password,
        agencyName: isProfessional ? details.agencyName.trim() : undefined,
        registrationNumber: isProfessional ? details.registrationNumber.trim() : undefined,
        documents,
      })
      setAccount(created)
    } catch (e) {
      setCreateError(errorMessage(e))
      throw e
    } finally {
      setIsCreating(false)
    }
  }

  if (account) return <SignupSuccess account={account} />

  return (
    <>
      <AuthHeading title={t(`auth.signup.steps.${step}.title`)}>
        {step === 'profile'
          ? t('auth.signup.subtitle')
          : t(`auth.signup.steps.${step}.description`)}
      </AuthHeading>
      <StepIndicator
        steps={steps.map((s) => t(`auth.signup.steps.${s}.label`))}
        current={steps.indexOf(step)}
      />

      {step === 'profile' && (
        <ProfileStep
          defaultValue={profile}
          onNext={(p) => {
            setProfile(p)
            setStep('details')
          }}
        />
      )}

      {step === 'details' && profile && (
        <DetailsStep
          profile={profile}
          defaultValues={details}
          onBack={(values) => {
            setDetails(values)
            setStep('profile')
          }}
          onNext={(values, international) => {
            setDetails(values)
            setPhone(international)
            setStep('verification')
          }}
        />
      )}

      {step === 'verification' && (
        <OtpVerification
          phone={phone}
          onResend={() => sendOtp(phone)}
          onVerified={async () => {
            if (isProfessional) setStep('documents')
            else await create([])
          }}
          onBack={() => setStep('details')}
          backLabel={t('auth.otp.changeNumber')}
          submitLabel={isProfessional ? undefined : t('auth.signup.create')}
        />
      )}

      {step === 'documents' && (
        <DocumentsStep
          kind={details.professionalKind}
          isSubmitting={isCreating}
          error={createError}
          onSubmit={(files: DocumentFiles) =>
            // Simulation : seules les métadonnées sont conservées (envoi des fichiers à l'API)
            void create(
              Object.entries(files).map(([type, file]) => ({
                type: type as UploadedDocument['type'],
                name: file.name,
                size: file.size,
                mimeType: file.type,
              })),
            ).catch(() => undefined)
          }
        />
      )}

      {step === 'profile' && (
        <p className="mt-6 text-center text-sm text-muted">
          {t('auth.signup.haveAccount')}{' '}
          <Link
            to="/login"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            {t('auth.signup.login')}
          </Link>
        </p>
      )}

      <LeaveGuard when={step !== 'profile'} />
    </>
  )
}
