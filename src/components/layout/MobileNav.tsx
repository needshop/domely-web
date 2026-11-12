import { Button, Drawer, useOverlayState } from '@heroui/react'
import { Menu, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { OrganizationBadge } from '@/features/auth/components/OrganizationBadge'
import { SidebarContent } from './Sidebar'

/** Menu mobile (< lg) : bouton ☰ dans l'en-tête, navigation dans un tiroir à gauche. */
export function MobileNav() {
  const { t } = useTranslation()
  const state = useOverlayState()

  return (
    <>
      <Button
        isIconOnly
        variant="ghost"
        className="lg:hidden"
        aria-label={t('sidebar.openMenu')}
        aria-expanded={state.isOpen}
        onPress={state.open}
      >
        <Menu className="size-5" aria-hidden />
      </Button>

      <Drawer.Backdrop isOpen={state.isOpen} onOpenChange={state.setOpen}>
        <Drawer.Content placement="left" className="lg:hidden">
          <Drawer.Dialog
            aria-label={t('nav.label')}
            className="flex h-full w-72 max-w-[85vw] flex-col rounded-none bg-night-900 px-4 py-6 text-white"
          >
            <Button
              isIconOnly
              size="sm"
              variant="ghost"
              slot="close"
              aria-label={t('sidebar.closeMenu')}
              className="absolute top-4 right-3 text-night-200 hover:bg-night-800 hover:text-white"
            >
              <X className="size-5" aria-hidden />
            </Button>
            <SidebarContent
              onNavigate={state.close}
              beforeNav={<OrganizationBadge variant="sidebar" />}
            />
          </Drawer.Dialog>
        </Drawer.Content>
      </Drawer.Backdrop>
    </>
  )
}
