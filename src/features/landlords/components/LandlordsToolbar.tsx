import { Button, SearchField } from '@heroui/react'
import { RotateCcw } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { FilterSelect } from '@/components/FilterSelect'
import {
  type LandlordFilters,
  type LandlordSortOption,
  landlordSortOptions,
} from '../hooks/useLandlordFilters'
import { type LandlordKind, landlordKinds } from '../types'

interface LandlordsToolbarProps {
  filters: LandlordFilters
  isFiltered: boolean
  onFilter: <K extends keyof LandlordFilters>(key: K, value: LandlordFilters[K]) => void
  onReset: () => void
}

/** Recherche, filtre et tri au-dessus de la liste des bailleurs. */
export function LandlordsToolbar({
  filters,
  isFiltered,
  onFilter,
  onReset,
}: LandlordsToolbarProps) {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center">
      <SearchField
        aria-label={t('landlords.filters.searchLabel')}
        value={filters.q}
        onChange={(q) => onFilter('q', q)}
        className="w-full lg:w-80"
      >
        <SearchField.Group className="h-10">
          <SearchField.SearchIcon />
          <SearchField.Input placeholder={t('landlords.filters.search')} />
          <SearchField.ClearButton />
        </SearchField.Group>
      </SearchField>

      <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:items-center">
        <FilterSelect<LandlordKind | 'all'>
          label={t('landlords.filters.kind')}
          value={filters.kind}
          onChange={(v) => onFilter('kind', v)}
          options={[
            { id: 'all', label: t('landlords.filters.allKinds') },
            ...landlordKinds.map((k) => ({ id: k, label: t(`landlords.kind.${k}`) })),
          ]}
        />
        <FilterSelect<LandlordSortOption>
          label={t('landlords.filters.sort')}
          value={filters.sort}
          onChange={(v) => onFilter('sort', v)}
          options={landlordSortOptions.map((s) => ({
            id: s,
            label: t(`landlords.filters.sorts.${s}`),
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
            {t('landlords.filters.reset')}
          </Button>
        )}
      </div>
    </div>
  )
}
