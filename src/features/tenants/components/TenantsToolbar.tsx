import { Button, SearchField } from '@heroui/react'
import { RotateCcw } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { FilterSelect } from '@/components/FilterSelect'
import {
  type StatusFilter,
  type TenantFilters,
  type TenantSortOption,
  statusFilters,
  tenantSortOptions,
} from '../hooks/useTenantFilters'
import { type TenantKind, tenantKinds } from '../types'

interface TenantsToolbarProps {
  filters: TenantFilters
  properties: { id: string; name: string }[]
  isFiltered: boolean
  onFilter: <K extends keyof TenantFilters>(key: K, value: TenantFilters[K]) => void
  onReset: () => void
}

/** Recherche, filtres et tri — une seule ligne au-dessus de la liste. */
export function TenantsToolbar({
  filters,
  properties,
  isFiltered,
  onFilter,
  onReset,
}: TenantsToolbarProps) {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center">
      <SearchField
        aria-label={t('tenants.filters.searchLabel')}
        value={filters.q}
        onChange={(q) => onFilter('q', q)}
        className="w-full lg:w-80"
      >
        <SearchField.Group className="h-10">
          <SearchField.SearchIcon />
          <SearchField.Input placeholder={t('tenants.filters.search')} />
          <SearchField.ClearButton />
        </SearchField.Group>
      </SearchField>

      <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:items-center">
        <FilterSelect<StatusFilter>
          label={t('tenants.filters.status')}
          value={filters.status}
          onChange={(v) => onFilter('status', v)}
          options={statusFilters.map((s) => ({ id: s, label: t(`tenants.filters.statuses.${s}`) }))}
        />
        <FilterSelect<TenantKind | 'all'>
          label={t('tenants.filters.kind')}
          value={filters.kind}
          onChange={(v) => onFilter('kind', v)}
          options={[
            { id: 'all', label: t('tenants.filters.allKinds') },
            ...tenantKinds.map((k) => ({ id: k, label: t(`tenants.kind.${k}`) })),
          ]}
        />
        <FilterSelect
          label={t('tenants.filters.property')}
          value={filters.property}
          onChange={(v) => onFilter('property', v)}
          className="sm:min-w-48"
          options={[
            { id: 'all', label: t('tenants.filters.allProperties') },
            ...properties.map((p) => ({ id: p.id, label: p.name })),
          ]}
        />
        <FilterSelect<TenantSortOption>
          label={t('tenants.filters.sort')}
          value={filters.sort}
          onChange={(v) => onFilter('sort', v)}
          options={tenantSortOptions.map((s) => ({
            id: s,
            label: t(`tenants.filters.sorts.${s}`),
          }))}
        />
        {isFiltered && (
          <Button
            variant="ghost"
            size="sm"
            onPress={onReset}
            className="col-span-2 justify-start sm:col-auto"
          >
            <RotateCcw className="size-3.5" aria-hidden />
            {t('tenants.filters.reset')}
          </Button>
        )}
      </div>
    </div>
  )
}
