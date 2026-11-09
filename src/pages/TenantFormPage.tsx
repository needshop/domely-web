import { Breadcrumbs, buttonVariants, toast } from '@heroui/react'
import { ArrowLeft } from 'lucide-react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useParams } from 'react-router'
import { createTenant, updateTenant, useTenants } from '@/features/tenants/api'
import { emptyTenantValues, fromFormValues, toFormValues } from '@/features/tenants/form/mapping'
import type { TenantFormValues } from '@/features/tenants/form/schema'
import { TenantForm } from '@/features/tenants/form/TenantForm'

/** Ajout (/tenants/new) ou modification (/tenants/:id/edit) d'un locataire. */
export function TenantFormPage({ mode }: { mode: 'create' | 'edit' }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams()
  const tenants = useTenants()
  const existing = mode === 'edit' ? tenants.find((tn) => tn.id === id) : undefined

  // Valeurs initiales figées au montage : le formulaire ne doit pas se réinitialiser en cours de saisie
  const defaultValues = useMemo(
    () => (existing ? toFormValues(existing) : emptyTenantValues()),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [existing?.id],
  )
  const others = useMemo(
    () => tenants.filter((tn) => tn.id !== existing?.id),
    [tenants, existing?.id],
  )

  if (mode === 'edit' && !existing) {
    return (
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-4 py-16 text-center">
        <p className="font-display text-lg">{t('tenants.detail.notFound')}</p>
        <Link to="/tenants" className={buttonVariants({ variant: 'secondary' })}>
          <ArrowLeft className="size-4" aria-hidden />
          {t('tenants.detail.back')}
        </Link>
      </div>
    )
  }

  const backTo = existing ? `/tenants/${existing.id}` : '/tenants'

  const handleSubmit = async (values: TenantFormValues) => {
    const tenant = fromFormValues(values, existing)
    if (existing) {
      await updateTenant(tenant)
      toast.success(t('tenants.form.toast.updated'), {
        description: t('tenants.form.toast.updatedDescription', { name: tenant.name }),
      })
    } else {
      await createTenant(tenant)
      toast.success(t('tenants.form.toast.created'), {
        description: t('tenants.form.toast.createdDescription', { name: tenant.name }),
      })
    }
    void navigate(`/tenants/${tenant.id}`)
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <Breadcrumbs>
        <Breadcrumbs.Item href="/tenants">{t('tenants.title')}</Breadcrumbs.Item>
        {existing && (
          <Breadcrumbs.Item href={`/tenants/${existing.id}`}>{existing.name}</Breadcrumbs.Item>
        )}
        <Breadcrumbs.Item>
          {existing ? t('tenants.detail.edit') : t('tenants.form.createTitle')}
        </Breadcrumbs.Item>
      </Breadcrumbs>

      <header>
        <h1 className="text-2xl">
          {existing
            ? t('tenants.form.editTitle', { name: existing.name })
            : t('tenants.form.createTitle')}
        </h1>
        <p className="mt-1 text-sm text-muted">
          {existing ? t('tenants.form.editSubtitle') : t('tenants.form.createSubtitle')}
        </p>
      </header>

      <TenantForm
        defaultValues={defaultValues}
        others={others}
        submitLabel={existing ? t('tenants.form.actions.save') : t('tenants.form.actions.create')}
        onSubmit={handleSubmit}
        onCancel={() => void navigate(backTo)}
      />
    </div>
  )
}
