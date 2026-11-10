import { Button, SearchField } from '@heroui/react'
import { RotateCcw } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { FilterSelect } from '@/components/FilterSelect'
import {
  type ContractFilters,
  type ContractSortOption,
  contractSortOptions,
  type ContractStatusFilter,
  contractStatusFilters,
} from '../hooks/useContractFilters'
import { type LeaseType, leaseTypes } from '../types'

interface ContractsToolbarProps {
  filters: ContractFilters
  properties: { id: string; name: string }[]
  isFiltered: boolean
  onFilter: <K extends keyof ContractFilters>(key: K, value: ContractFilters[K]) => void
  onReset: () => void
}

/** Recherche, filtres et tri — une seule ligne au-dessus de la liste. */
export function ContractsToolbar({
  filters,
  properties,
  isFiltered,
  onFilter,
  onReset,
}: ContractsToolbarProps) {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center">
      <SearchField
        aria-label={t('contracts.filters.searchLabel')}
        value={filters.q}
        onChange={(q) => onFilter('q', q)}
        className="w-full lg:w-80"
      >
        <SearchField.Group className="h-10">
          <SearchField.SearchIcon />
          <SearchField.Input placeholder={t('contracts.filters.search')} />
          <SearchField.ClearButton />
        </SearchField.Group>
      </SearchField>

      <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:items-center">
        <FilterSelect<ContractStatusFilter>
          label={t('contracts.filters.status')}
          value={filters.status}
          onChange={(v) => onFilter('status', v)}
          options={contractStatusFilters.map((s) => ({
            id: s,
            label: t(`contracts.filters.statuses.${s}`),
          }))}
        />
        <FilterSelect<LeaseType | 'all'>
          label={t('contracts.filters.type')}
          value={filters.type}
          onChange={(v) => onFilter('type', v)}
          options={[
            { id: 'all', label: t('contracts.filters.allTypes') },
            ...leaseTypes.map((type) => ({ id: type, label: t(`contracts.type.${type}`) })),
          ]}
        />
        <FilterSelect
          label={t('contracts.filters.property')}
          value={filters.property}
          onChange={(v) => onFilter('property', v)}
          className="sm:min-w-48"
          options={[
            { id: 'all', label: t('tenants.filters.allProperties') },
            ...properties.map((p) => ({ id: p.id, label: p.name })),
          ]}
        />
        <FilterSelect<ContractSortOption>
          label={t('contracts.filters.sort')}
          value={filters.sort}
          onChange={(v) => onFilter('sort', v)}
          options={contractSortOptions.map((s) => ({
            id: s,
            label: t(`contracts.filters.sorts.${s}`),
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
            {t('contracts.filters.reset')}
          </Button>
        )}
      </div>
    </div>
  )
}
