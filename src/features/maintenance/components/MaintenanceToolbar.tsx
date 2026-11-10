import { Button, SearchField } from '@heroui/react'
import { RotateCcw } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { FilterSelect } from '@/components/FilterSelect'
import {
  type MaintenanceFilters,
  type MaintenanceSortOption,
  maintenanceSortOptions,
  type MaintenanceStatusFilter,
  maintenanceStatusFilters,
} from '../hooks/useMaintenanceFilters'
import {
  type MaintenanceCategory,
  maintenanceCategories,
  type MaintenancePriority,
  maintenancePriorities,
} from '../types'

interface MaintenanceToolbarProps {
  filters: MaintenanceFilters
  properties: { id: string; name: string }[]
  isFiltered: boolean
  onFilter: <K extends keyof MaintenanceFilters>(key: K, value: MaintenanceFilters[K]) => void
  onReset: () => void
}

export function MaintenanceToolbar({
  filters,
  properties,
  isFiltered,
  onFilter,
  onReset,
}: MaintenanceToolbarProps) {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center">
      <SearchField
        aria-label={t('maintenance.filters.searchLabel')}
        value={filters.q}
        onChange={(q) => onFilter('q', q)}
        className="w-full lg:w-72"
      >
        <SearchField.Group className="h-10">
          <SearchField.SearchIcon />
          <SearchField.Input placeholder={t('maintenance.filters.search')} />
          <SearchField.ClearButton />
        </SearchField.Group>
      </SearchField>

      <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:items-center">
        <FilterSelect<MaintenanceStatusFilter>
          label={t('maintenance.filters.status')}
          value={filters.status}
          onChange={(v) => onFilter('status', v)}
          options={maintenanceStatusFilters.map((s) => ({
            id: s,
            label:
              s === 'open' || s === 'all'
                ? t(`maintenance.filters.statuses.${s}`)
                : t(`maintenance.status.${s}`),
          }))}
        />
        <FilterSelect<MaintenancePriority | 'all'>
          label={t('maintenance.filters.priority')}
          value={filters.priority}
          onChange={(v) => onFilter('priority', v)}
          options={[
            { id: 'all', label: t('maintenance.filters.allPriorities') },
            ...maintenancePriorities.map((p) => ({ id: p, label: t(`maintenance.priority.${p}`) })),
          ]}
        />
        <FilterSelect<MaintenanceCategory | 'all'>
          label={t('maintenance.filters.category')}
          value={filters.category}
          onChange={(v) => onFilter('category', v)}
          options={[
            { id: 'all', label: t('maintenance.filters.allCategories') },
            ...maintenanceCategories.map((c) => ({ id: c, label: t(`maintenance.category.${c}`) })),
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
        <FilterSelect<MaintenanceSortOption>
          label={t('maintenance.filters.sort')}
          value={filters.sort}
          onChange={(v) => onFilter('sort', v)}
          options={maintenanceSortOptions.map((s) => ({
            id: s,
            label: t(`maintenance.filters.sorts.${s}`),
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
