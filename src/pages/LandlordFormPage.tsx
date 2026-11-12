import { Breadcrumbs, buttonVariants, toast } from '@heroui/react'
import { ArrowLeft } from 'lucide-react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useParams } from 'react-router'
import { createLandlord, updateLandlord, useLandlords } from '@/features/landlords/api'
import { LandlordForm } from '@/features/landlords/form/LandlordForm'
import {
  emptyLandlordValues,
  fromFormValues,
  toFormValues,
} from '@/features/landlords/form/mapping'
import type { LandlordFormValues } from '@/features/landlords/form/schema'

/** Ajout (/landlords/new) ou modification (/landlords/:id/edit) d'un bailleur. */
export function LandlordFormPage({ mode }: { mode: 'create' | 'edit' }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams()
  const landlords = useLandlords()
  const existing = mode === 'edit' ? landlords.find((l) => l.id === id) : undefined

  // Valeurs initiales figées au montage : le formulaire ne doit pas se réinitialiser en cours de saisie
  const defaultValues = useMemo(
    () => (existing ? toFormValues(existing) : emptyLandlordValues()),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [existing?.id],
  )
  const others = useMemo(
    () => landlords.filter((l) => l.id !== existing?.id),
    [landlords, existing?.id],
  )

  if (mode === 'edit' && !existing) {
    return (
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-4 py-16 text-center">
        <p className="font-display text-lg">{t('landlords.detail.notFound')}</p>
        <Link to="/landlords" className={buttonVariants({ variant: 'secondary' })}>
          <ArrowLeft className="size-4" aria-hidden />
          {t('landlords.detail.back')}
        </Link>
      </div>
    )
  }

  const backTo = existing ? `/landlords/${existing.id}` : '/landlords'

  const handleSubmit = async (values: LandlordFormValues) => {
    const landlord = fromFormValues(values, existing)
    if (existing) {
      await updateLandlord(landlord)
      toast.success(t('landlords.form.toast.updated'), {
        description: t('landlords.form.toast.updatedDescription', { name: landlord.name }),
      })
    } else {
      await createLandlord(landlord)
      toast.success(t('landlords.form.toast.created'), {
        description: t('landlords.form.toast.createdDescription', { name: landlord.name }),
      })
    }
    void navigate(`/landlords/${landlord.id}`)
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <Breadcrumbs>
        <Breadcrumbs.Item href="/landlords">{t('landlords.title')}</Breadcrumbs.Item>
        {existing && (
          <Breadcrumbs.Item href={`/landlords/${existing.id}`}>{existing.name}</Breadcrumbs.Item>
        )}
        <Breadcrumbs.Item>
          {existing ? t('landlords.detail.edit') : t('landlords.form.createTitle')}
        </Breadcrumbs.Item>
      </Breadcrumbs>

      <header>
        <h1 className="text-2xl">
          {existing
            ? t('landlords.form.editTitle', { name: existing.name })
            : t('landlords.form.createTitle')}
        </h1>
        <p className="mt-1 text-sm text-muted">
          {existing ? t('landlords.form.editSubtitle') : t('landlords.form.createSubtitle')}
        </p>
      </header>

      <LandlordForm
        defaultValues={defaultValues}
        others={others}
        submitLabel={
          existing ? t('landlords.form.actions.save') : t('landlords.form.actions.create')
        }
        onSubmit={handleSubmit}
        onCancel={() => void navigate(backTo)}
      />
    </div>
  )
}
