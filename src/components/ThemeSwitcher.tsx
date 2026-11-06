import { ToggleButton, ToggleButtonGroup, useTheme } from '@heroui/react'
import { Monitor, Moon, Sun } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const options = [
  { id: 'light', icon: Sun },
  { id: 'dark', icon: Moon },
  { id: 'system', icon: Monitor },
] as const

/** Bascule clair / sombre / système. Le choix est persisté par HeroUI (localStorage « heroui-theme »). */
export function ThemeSwitcher() {
  const { t } = useTranslation()
  const { theme, setTheme } = useTheme('system')

  return (
    <ToggleButtonGroup
      aria-label={t('theme.label')}
      size="sm"
      selectionMode="single"
      disallowEmptySelection
      selectedKeys={new Set([theme])}
      onSelectionChange={(keys) => {
        const [next] = keys
        if (next) setTheme(String(next))
      }}
    >
      {options.map(({ id, icon: Icon }, index) => (
        <ToggleButton key={id} id={id} isIconOnly aria-label={t(`theme.${id}`)}>
          {index > 0 && <ToggleButtonGroup.Separator />}
          <Icon className="size-4" aria-hidden />
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  )
}
