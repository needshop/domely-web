import { Button } from '@heroui/react'
import { FileCheck2, Trash2, Upload } from 'lucide-react'
import { useState } from 'react'
import { DropZone, FileTrigger } from 'react-aria-components'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/cn'
import { DOCUMENT_MAX_BYTES, DOCUMENT_MIME_TYPES } from '../constants'
import type { DocumentType } from '../types'
import { formatFileSize } from '../utils'

const accepted: readonly string[] = DOCUMENT_MIME_TYPES

/** Dépôt d'un justificatif : glisser-déposer ou sélection, avec contrôle du type et du poids. */
export function DocumentUpload({
  type,
  required,
  file,
  error,
  onChange,
}: {
  type: DocumentType
  required: boolean
  file: File | null
  error?: string
  onChange: (file: File | null) => void
}) {
  const { t, i18n } = useTranslation()
  const [localError, setLocalError] = useState<string | null>(null)
  const label = t(`auth.documents.types.${type}`)
  const message = localError ?? error

  const pick = (candidate: File | undefined) => {
    if (!candidate) return
    if (!accepted.includes(candidate.type)) {
      setLocalError(t('auth.documents.errors.type'))
      return
    }
    if (candidate.size > DOCUMENT_MAX_BYTES) {
      setLocalError(t('auth.documents.errors.size'))
      return
    }
    setLocalError(null)
    onChange(candidate)
  }

  return (
    <div className="flex flex-col gap-1.5">
      <p className="flex items-baseline justify-between gap-2 text-sm font-medium">
        <span>{label}</span>
        <span className="text-xs font-normal text-muted">
          {t(required ? 'auth.documents.required' : 'auth.documents.optional')}
        </span>
      </p>

      {file ? (
        <div className="flex items-center gap-3 rounded-xl border border-border bg-surface-secondary p-3">
          <FileCheck2 className="size-5 shrink-0 text-success-soft-foreground" aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{file.name}</p>
            <p className="text-xs text-muted">{formatFileSize(file.size, i18n.language)}</p>
          </div>
          <Button
            isIconOnly
            size="sm"
            variant="ghost"
            aria-label={t('auth.documents.remove', { name: label })}
            onPress={() => onChange(null)}
          >
            <Trash2 className="size-4" aria-hidden />
          </Button>
        </div>
      ) : (
        <DropZone
          aria-label={label}
          getDropOperation={(types) =>
            accepted.some((mime) => types.has(mime)) ? 'copy' : 'cancel'
          }
          onDrop={async (e) => {
            const item = e.items.find((i) => i.kind === 'file')
            if (item?.kind === 'file') pick(await item.getFile())
          }}
          className={({ isDropTarget }) =>
            cn(
              'flex flex-col items-center gap-2 rounded-xl border border-dashed p-4 text-center transition-colors',
              isDropTarget ? 'border-accent bg-accent/5' : 'border-border',
              message && 'border-danger',
            )
          }
        >
          <Upload className="size-5 text-muted" aria-hidden />
          <p className="text-xs text-muted">{t(`auth.documents.hints.${type}`)}</p>
          <FileTrigger acceptedFileTypes={accepted} onSelect={(files) => pick(files?.[0])}>
            <Button
              size="sm"
              variant="secondary"
              aria-label={t('auth.documents.chooseFor', { name: label })}
            >
              {t('auth.documents.choose')}
            </Button>
          </FileTrigger>
          <p className="text-xs text-muted">{t('auth.documents.dropHint')}</p>
        </DropZone>
      )}

      {message && (
        <p role="alert" className="text-xs text-danger">
          {message}
        </p>
      )}
    </div>
  )
}
