import { Breadcrumbs, buttonVariants, toast } from '@heroui/react'
import { ArrowLeft } from 'lucide-react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router'
import { useLandlord } from '@/features/landlords/api'
import { createProperty, updateProperty, useProperty } from '@/features/properties/api'
import {
  emptyPropertyValues,
  fromFormValues,
  toFormValues,
} from '@/features/properties/form/mapping'
import { PropertyForm } from '@/features/properties/form/PropertyForm'
import type { PropertyFormValues } from '@/features/properties/form/schema'

/** Ajout (/properties/new) ou modification (/properties/:id/edit) d'un bien. */
export function PropertyFormPage({ mode }: { mode: 'create' | 'edit' }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams()
  const existing = useProperty(mode === 'edit' ? id : undefined)
  // Pré-sélection du bailleur depuis sa fiche (« Ajouter un bien », ?landlord=)
  const presetLandlord = useLandlord(useSearchParams()[0].get('landlord') ?? undefined)

  // Valeurs initiales figées au montage : le formulaire ne doit pas se réinitialiser en cours de saisie
  const defaultValues = useMemo(
    () =>
      existing
        ? toFormValues(existing)
        : emptyPropertyValues(t('properties.form.units.labelPrefix'), presetLandlord?.id ?? null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [existing?.id],
  )

  if (mode === 'edit' && !existing) {
    return (
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 py-16 text-center">
        <p className="font-display text-lg">{t('properties.detail.notFound')}</p>
        <Link to="/properties" className={buttonVariants({ variant: 'secondary' })}>
          <ArrowLeft className="size-4" aria-hidden />
          {t('properties.detail.back')}
        </Link>
      </div>
    )
  }

  const backTo = existing ? `/properties/${existing.id}` : '/properties'

  const handleSubmit = async (values: PropertyFormValues) => {
    const property = fromFormValues(values, existing)
    if (existing) {
      await updateProperty(property)
      toast.success(t('properties.form.toast.updated'), {
        description: t('properties.form.toast.updatedDescription', { name: property.name }),
      })
    } else {
      await createProperty(property)
      toast.success(t('properties.form.toast.created'), {
        description: t('properties.form.toast.createdDescription', { name: property.name }),
      })
    }
    void navigate(`/properties/${property.id}`)
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <Breadcrumbs>
        <Breadcrumbs.Item href="/properties">{t('properties.title')}</Breadcrumbs.Item>
        {existing && (
          <Breadcrumbs.Item href={`/properties/${existing.id}`}>{existing.name}</Breadcrumbs.Item>
        )}
        <Breadcrumbs.Item>
          {existing ? t('properties.detail.edit') : t('properties.form.createTitle')}
        </Breadcrumbs.Item>
      </Breadcrumbs>

      <header>
        <h1 className="text-2xl">
          {existing
            ? t('properties.form.editTitle', { name: existing.name })
            : t('properties.form.createTitle')}
        </h1>
        <p className="mt-1 text-sm text-muted">
          {existing ? t('properties.form.editSubtitle') : t('properties.form.createSubtitle')}
        </p>
      </header>

      <PropertyForm
        defaultValues={defaultValues}
        submitLabel={
          existing ? t('properties.form.actions.save') : t('properties.form.actions.create')
        }
        onSubmit={handleSubmit}
        onCancel={() => void navigate(backTo)}
      />
    </div>
  )
}
