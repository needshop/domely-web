import { Breadcrumbs, buttonVariants, toast } from '@heroui/react'
import { ArrowLeft } from 'lucide-react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router'
import { createLease, updateLease, useLeases } from '@/features/contracts/api'
import { ContractForm } from '@/features/contracts/form/ContractForm'
import { emptyLeaseValues, fromFormValues, toFormValues } from '@/features/contracts/form/mapping'
import type { LeaseFormValues } from '@/features/contracts/form/schema'
import { useProperties } from '@/features/properties/api'
import { useSettings } from '@/features/settings/api'
import { useTenants } from '@/features/tenants/api'

/**
 * Création (/contracts/new, pré-remplissage possible via ?tenant=&property=&unit=)
 * ou modification (/contracts/:id/edit) d'un contrat de bail.
 */
export function ContractFormPage({ mode }: { mode: 'create' | 'edit' }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams()
  const [params] = useSearchParams()
  const leases = useLeases()
  const properties = useProperties()
  const tenants = useTenants()
  const rentalDefaults = useSettings().rentals
  const existing = mode === 'edit' ? leases.find((l) => l.id === id) : undefined

  // Valeurs initiales figées au montage : le formulaire ne doit pas se réinitialiser en cours de saisie
  const defaultValues = useMemo(() => {
    if (existing) return toFormValues(existing)
    const property = properties.find((p) => p.id === params.get('property'))
    const tenantId = params.get('tenant')
    return emptyLeaseValues(
      {
        tenantId: tenants.some((tn) => tn.id === tenantId) ? tenantId : null,
        property,
        unit: property?.units.find((u) => u.id === params.get('unit')),
      },
      rentalDefaults,
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existing?.id])
  const others = useMemo(() => leases.filter((l) => l.id !== existing?.id), [leases, existing?.id])

  if (mode === 'edit' && (!existing || existing.terminatedAt)) {
    return (
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-4 py-16 text-center">
        <p className="font-display text-lg">
          {existing ? t('contracts.form.notEditable') : t('contracts.detail.notFound')}
        </p>
        <Link
          to={existing ? `/contracts/${existing.id}` : '/contracts'}
          className={buttonVariants({ variant: 'secondary' })}
        >
          <ArrowLeft className="size-4" aria-hidden />
          {t('contracts.detail.back')}
        </Link>
      </div>
    )
  }

  const backTo = existing
    ? `/contracts/${existing.id}`
    : params.get('tenant')
      ? `/tenants/${params.get('tenant')}`
      : params.get('property')
        ? `/properties/${params.get('property')}`
        : '/contracts'

  const handleSubmit = async (values: LeaseFormValues) => {
    const lease = fromFormValues(values, leases, existing)
    if (existing) {
      await updateLease(lease)
      toast.success(t('contracts.form.toast.updated'), {
        description: t('contracts.form.toast.updatedDescription', { reference: lease.reference }),
      })
    } else {
      await createLease(lease)
      toast.success(t('contracts.form.toast.created'), {
        description: t('contracts.form.toast.createdDescription', { reference: lease.reference }),
      })
    }
    void navigate(`/contracts/${lease.id}`)
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <Breadcrumbs>
        <Breadcrumbs.Item href="/contracts">{t('contracts.title')}</Breadcrumbs.Item>
        {existing && (
          <Breadcrumbs.Item href={`/contracts/${existing.id}`}>
            {existing.reference}
          </Breadcrumbs.Item>
        )}
        <Breadcrumbs.Item>
          {existing ? t('contracts.detail.edit') : t('contracts.form.createTitle')}
        </Breadcrumbs.Item>
      </Breadcrumbs>

      <header>
        <h1 className="text-2xl">
          {existing
            ? t('contracts.form.editTitle', { reference: existing.reference })
            : t('contracts.form.createTitle')}
        </h1>
        <p className="mt-1 text-sm text-muted">
          {existing ? t('contracts.form.editSubtitle') : t('contracts.form.createSubtitle')}
        </p>
      </header>

      <ContractForm
        defaultValues={defaultValues}
        isEdit={Boolean(existing)}
        tenants={tenants}
        properties={properties}
        others={others}
        submitLabel={existing ? t('tenants.form.actions.save') : t('contracts.form.create')}
        onSubmit={handleSubmit}
        onCancel={() => void navigate(backTo)}
      />
    </div>
  )
}
