import { Button } from '@heroui/react'
import { Check, Copy } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

/** Identifiant de connexion mis en avant, avec bouton de copie. */
export function IdentifierCard({ identifier }: { identifier: string }) {
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(identifier)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* presse-papiers indisponible : l'identifiant reste lisible à l'écran */
    }
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface-secondary px-4 py-3">
      <div>
        <p className="text-xs text-muted">{t('auth.fields.identifier')}</p>
        <p className="font-display text-2xl tracking-[0.25em]" data-testid="identifier">
          {identifier}
        </p>
      </div>
      <Button size="sm" variant="tertiary" onPress={() => void copy()}>
        {copied ? (
          <Check className="size-4" aria-hidden />
        ) : (
          <Copy className="size-4" aria-hidden />
        )}
        <span aria-live="polite">{t(copied ? 'auth.success.copied' : 'auth.success.copy')}</span>
      </Button>
    </div>
  )
}
