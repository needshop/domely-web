import { Breadcrumbs, buttonVariants, toast } from '@heroui/react'
import { ArrowLeft } from 'lucide-react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router'
import {
  createIntervention,
  updateIntervention,
  useInterventions,
} from '@/features/maintenance/api'
import { InterventionForm } from '@/features/maintenance/form/InterventionForm'
import {
  emptyInterventionValues,
  fromFormValues,
  toFormValues,
} from '@/features/maintenance/form/mapping'
import type { InterventionFormValues } from '@/features/maintenance/form/schema'
import { useProperties } from '@/features/properties/api'
import { useTenants } from '@/features/tenants/api'

/** Signalement (/maintenance/new, ?property=&unit=) ou modification d'une intervention. */
export function InterventionFormPage({ mode }: { mode: 'create' | 'edit' }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams()
  const [params] = useSearchParams()
  const interventions = useInterventions()
  const properties = useProperties()
  const tenants = useTenants()
  const existing = mode === 'edit' ? interventions.find((i) => i.id === id) : undefined

  // Valeurs initiales figées au montage
  const defaultValues = useMemo(() => {
    if (existing) return toFormValues(existing)
    const property = properties.find((p) => p.id === params.get('property'))
    const unit = property?.units.find((u) => u.id === params.get('unit'))
    return emptyInterventionValues({ propertyId: property?.id, unitId: unit?.id })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existing?.id])

  if (mode === 'edit' && !existing) {
    return (
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-4 py-16 text-center">
        <p className="font-display text-lg">{t('maintenance.detail.notFound')}</p>
        <Link to="/maintenance" className={buttonVariants({ variant: 'secondary' })}>
          <ArrowLeft className="size-4" aria-hidden />
          {t('maintenance.detail.back')}
        </Link>
      </div>
    )
  }

  const backTo = existing
    ? `/maintenance/${existing.id}`
    : params.get('property')
      ? `/properties/${params.get('property')}`
      : '/maintenance'

  const handleSubmit = async (values: InterventionFormValues) => {
    const intervention = fromFormValues(values, properties, interventions, existing)
    if (existing) {
      await updateIntervention(intervention)
      toast.success(t('maintenance.form.toast.updated'), { description: intervention.title })
    } else {
      await createIntervention(intervention)
      toast.success(t('maintenance.form.toast.created'), {
        description: t('maintenance.form.toast.createdDescription', {
          reference: intervention.reference,
        }),
      })
    }
    void navigate(`/maintenance/${intervention.id}`)
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <Breadcrumbs>
        <Breadcrumbs.Item href="/maintenance">{t('nav.maintenance')}</Breadcrumbs.Item>
        {existing && (
          <Breadcrumbs.Item href={`/maintenance/${existing.id}`}>
            {existing.reference}
          </Breadcrumbs.Item>
        )}
        <Breadcrumbs.Item>
          {existing ? t('maintenance.detail.edit') : t('maintenance.form.createTitle')}
        </Breadcrumbs.Item>
      </Breadcrumbs>

      <header>
        <h1 className="text-2xl">
          {existing
            ? t('maintenance.form.editTitle', { reference: existing.reference })
            : t('maintenance.form.createTitle')}
        </h1>
        <p className="mt-1 text-sm text-muted">
          {existing ? t('maintenance.form.editSubtitle') : t('maintenance.form.createSubtitle')}
        </p>
      </header>

      <InterventionForm
        defaultValues={defaultValues}
        properties={properties}
        tenants={tenants}
        submitLabel={existing ? t('tenants.form.actions.save') : t('maintenance.form.create')}
        onSubmit={handleSubmit}
        onCancel={() => void navigate(backTo)}
      />
    </div>
  )
}
