import { Button } from '@heroui/react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DOCUMENT_MAX_BYTES, requiredDocuments } from '../../constants'
import type { DocumentType, ProfessionalKind } from '../../types'
import { DocumentUpload } from '../DocumentUpload'
import { AuthAlert } from '../AuthAlert'

export type DocumentFiles = Partial<Record<DocumentType, File>>

/** Étape 4 (professionnels) : justificatifs pour la vérification de l'agence ou du statut. */
export function DocumentsStep({
  kind,
  isSubmitting,
  error,
  onSubmit,
}: {
  kind: ProfessionalKind
  isSubmitting: boolean
  error: string | null
  onSubmit: (files: DocumentFiles) => void
}) {
  const { t } = useTranslation()
  const [files, setFiles] = useState<DocumentFiles>({})
  const [submitted, setSubmitted] = useState(false)
  const documents = requiredDocuments[kind]
  const missing = documents.filter((d) => d.required && !files[d.type])

  return (
    <form
      noValidate
      className="flex flex-col gap-5"
      onSubmit={(e) => {
        e.preventDefault()
        setSubmitted(true)
        if (missing.length === 0) onSubmit(files)
      }}
    >
      <p className="text-xs text-muted">
        {t('auth.documents.formats', { size: DOCUMENT_MAX_BYTES / (1024 * 1024) })}
      </p>
      {error && <AuthAlert status="danger">{error}</AuthAlert>}
      {submitted && missing.length > 0 && (
        <AuthAlert status="danger">{t('auth.documents.errors.missing')}</AuthAlert>
      )}

      {documents.map(({ type, required }) => (
        <DocumentUpload
          key={type}
          type={type}
          required={required}
          file={files[type] ?? null}
          error={
            submitted && required && !files[type] ? t('auth.documents.errors.required') : undefined
          }
          onChange={(file) =>
            setFiles((prev) => {
              const next = { ...prev }
              if (file) next[type] = file
              else delete next[type]
              return next
            })
          }
        />
      ))}

      <AuthAlert>{t('auth.documents.reviewNotice')}</AuthAlert>

      <Button type="submit" variant="primary" fullWidth isPending={isSubmitting}>
        {t('auth.documents.submit')}
      </Button>
    </form>
  )
}
