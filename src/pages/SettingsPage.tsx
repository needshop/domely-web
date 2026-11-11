import { Tabs } from '@heroui/react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router'
import { MessageSettings } from '@/features/settings/components/MessageSettings'
import { OrganizationSettings } from '@/features/settings/components/OrganizationSettings'
import { PreferencesSettings } from '@/features/settings/components/PreferencesSettings'
import { ProfileSettings } from '@/features/settings/components/ProfileSettings'
import { RentalSettings } from '@/features/settings/components/RentalSettings'

const tabs = ['profile', 'organization', 'preferences', 'rentals', 'messages'] as const
type SettingsTab = (typeof tabs)[number]

const panels: Record<SettingsTab, () => React.JSX.Element> = {
  profile: ProfileSettings,
  organization: OrganizationSettings,
  preferences: PreferencesSettings,
  rentals: RentalSettings,
  messages: MessageSettings,
}

export function SettingsPage() {
  const { t } = useTranslation()
  const [params, setParams] = useSearchParams()
  const requested = params.get('tab')
  const tab: SettingsTab = tabs.includes(requested as SettingsTab)
    ? (requested as SettingsTab)
    : 'profile'

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <header>
        <h1 className="text-2xl">{t('nav.settings')}</h1>
        <p className="mt-1 text-sm text-muted">{t('settings.subtitle')}</p>
      </header>

      <Tabs
        variant="secondary"
        selectedKey={tab}
        onSelectionChange={(key) =>
          setParams(key === 'profile' ? {} : { tab: String(key) }, { replace: true })
        }
        className="w-full"
      >
        <Tabs.ListContainer className="overflow-x-auto border-b border-separator">
          <Tabs.List aria-label={t('settings.tabs')}>
            {tabs.map((id) => (
              <Tabs.Tab key={id} id={id} className="whitespace-nowrap">
                {t(`settings.tab.${id}`)}
                <Tabs.Indicator />
              </Tabs.Tab>
            ))}
          </Tabs.List>
        </Tabs.ListContainer>
        {tabs.map((id) => {
          const Panel = panels[id]
          return (
            <Tabs.Panel key={id} id={id} className="pt-6">
              <Panel />
            </Tabs.Panel>
          )
        })}
      </Tabs>

      <p className="text-xs text-muted">{t('settings.storageNotice')}</p>
    </div>
  )
}
