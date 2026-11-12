import { Button, Radio, RadioGroup } from '@heroui/react'
import { Briefcase, Home, KeyRound } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/cn'
import { type AccountProfile, accountProfiles } from '../../types'

const icons = { ownerManager: Home, ownerPrincipal: KeyRound, professional: Briefcase } as const

/** Étape 1 : choix du profil. */
export function ProfileStep({
  defaultValue,
  onNext,
}: {
  defaultValue: AccountProfile | null
  onNext: (profile: AccountProfile) => void
}) {
  const { t } = useTranslation()
  const [profile, setProfile] = useState<AccountProfile | null>(defaultValue)
  const [showError, setShowError] = useState(false)

  return (
    <form
      noValidate
      className="flex flex-col gap-5"
      onSubmit={(e) => {
        e.preventDefault()
        if (profile) onNext(profile)
        else setShowError(true)
      }}
    >
      <RadioGroup
        aria-label={t('auth.signup.profile.label')}
        value={profile}
        onChange={(v) => {
          setProfile(v as AccountProfile)
          setShowError(false)
        }}
        isInvalid={showError}
        className="flex flex-col gap-3"
      >
        {accountProfiles.map((id) => {
          const Icon = icons[id]
          return (
            <Radio
              key={id}
              value={id}
              className={({ isSelected }) =>
                cn(
                  'flex cursor-pointer flex-row items-center gap-3 rounded-xl border p-4 transition-colors',
                  isSelected
                    ? 'border-accent bg-accent/5'
                    : 'border-border hover:bg-surface-secondary',
                  'data-focus-visible:outline-2 data-focus-visible:outline-offset-2 data-focus-visible:outline-focus',
                )
              }
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-surface-secondary">
                <Icon className="size-5" aria-hidden />
              </span>
              <Radio.Content className="flex min-w-0 flex-1 flex-col items-center gap-0.5 text-center">
                <span className="block font-display text-sm">{t(`auth.profiles.${id}.title`)}</span>
                <span className="block text-xs text-muted">
                  {t(`auth.profiles.${id}.description`)}
                </span>
              </Radio.Content>
              <Radio.Control className="shrink-0">
                <Radio.Indicator />
              </Radio.Control>
            </Radio>
          )
        })}
      </RadioGroup>
      {showError && (
        <p role="alert" className="text-sm text-danger">
          {t('auth.signup.profile.required')}
        </p>
      )}
      <Button type="submit" variant="primary" fullWidth>
        {t('auth.signup.next')}
      </Button>
    </form>
  )
}
