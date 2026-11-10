import { Button, SearchField } from '@heroui/react'
import { RotateCcw } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { FilterSelect } from '@/components/FilterSelect'
import { type RentFilters, type RentStatusFilter, rentStatusFilters } from '../hooks/useRentFilters'

interface RentsToolbarProps {
  filters: RentFilters
  properties: { id: string; name: string }[]
  /** Filtre de situation (vue par mois uniquement) */
  showStatus: boolean
  isFiltered: boolean
  onFilter: <K extends keyof RentFilters>(key: K, value: RentFilters[K]) => void
  onReset: () => void
}

export function RentsToolbar({
  filters,
  properties,
  showStatus,
  isFiltered,
  onFilter,
  onReset,
}: RentsToolbarProps) {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center">
      <SearchField
        aria-label={t('rents.filters.searchLabel')}
        value={filters.q}
        onChange={(q) => onFilter('q', q)}
        className="w-full lg:w-80"
      >
        <SearchField.Group className="h-10">
          <SearchField.SearchIcon />
          <SearchField.Input placeholder={t('rents.filters.search')} />
          <SearchField.ClearButton />
        </SearchField.Group>
      </SearchField>

      <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:items-center">
        {showStatus && (
          <FilterSelect<RentStatusFilter>
            label={t('rents.filters.status')}
            value={filters.status}
            onChange={(v) => onFilter('status', v)}
            options={rentStatusFilters.map((s) => ({
              id: s,
              label: s === 'all' ? t('rents.filters.allStatuses') : t(`rents.status.${s}`),
            }))}
          />
        )}
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
