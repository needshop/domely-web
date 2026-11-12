import { Alert } from '@heroui/react'
import type { ReactNode } from 'react'

/** Bandeau d'information ou d'erreur des pages d'authentification. */
export function AuthAlert({
  status = 'default',
  title,
  children,
}: {
  status?: 'default' | 'accent' | 'success' | 'warning' | 'danger'
  title?: string
  children?: ReactNode
}) {
  return (
    <Alert status={status} role={status === 'danger' ? 'alert' : 'status'}>
      <Alert.Indicator />
      <Alert.Content>
        {title && <Alert.Title>{title}</Alert.Title>}
        {children && <Alert.Description>{children}</Alert.Description>}
      </Alert.Content>
    </Alert>
  )
}
