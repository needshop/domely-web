import { Button, SearchField, ToggleButton, ToggleButtonGroup } from '@heroui/react'
import { LayoutGrid, List, RotateCcw } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { FilterSelect } from '@/components/FilterSelect'
import {
  type OccupancyFilter,
  type PropertyFilters,
  type SortOption,
} from '../hooks/usePropertyFilters'
import { type PropertyType, propertyTypes } from '../types'

export type PropertiesView = 'grid' | 'table'

interface PropertiesToolbarProps {
  filters: PropertyFilters
  cities: string[]
  view: PropertiesView
  isFiltered: boolean
  onFilter: <K extends keyof PropertyFilters>(key: K, value: PropertyFilters[K]) => void
  onReset: () => void
  onViewChange: (view: PropertiesView) => void
}

/** Barre de recherche, filtres, tri et choix d'affichage — une seule ligne au-dessus de la liste. */
export function PropertiesToolbar({
  filters,
  cities,
  view,
  isFiltered,
  onFilter,
  onReset,
  onViewChange,
}: PropertiesToolbarProps) {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center">
      <SearchField
        aria-label={t('properties.filters.searchLabel')}
        value={filters.q}
        onChange={(q) => onFilter('q', q)}
        className="w-full lg:w-80"
      >
        <SearchField.Group className="h-10">
          <SearchField.SearchIcon />
          <SearchField.Input placeholder={t('properties.filters.search')} />
          <SearchField.ClearButton />
        </SearchField.Group>
      </SearchField>

      <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:items-center">
        <FilterSelect<PropertyType | 'all'>
          label={t('properties.filters.type')}
          value={filters.type}
          onChange={(v) => onFilter('type', v)}
          options={[
            { id: 'all', label: t('properties.filters.allTypes') },
            ...propertyTypes.map((type) => ({ id: type, label: t(`properties.type.${type}`) })),
          ]}
        />
        <FilterSelect
          label={t('properties.filters.city')}
          value={filters.city}
          onChange={(v) => onFilter('city', v)}
          options={[
            { id: 'all', label: t('properties.filters.allCities') },
            ...cities.map((city) => ({ id: city, label: city })),
          ]}
        />
        <FilterSelect<OccupancyFilter>
          label={t('properties.filters.occupancy')}
          value={filters.occupancy}
          onChange={(v) => onFilter('occupancy', v)}
          options={[
            { id: 'all', label: t('properties.filters.occupancyAll') },
            { id: 'vacant', label: t('properties.filters.occupancyVacant') },
            { id: 'full', label: t('properties.filters.occupancyFull') },
          ]}
        />
        <FilterSelect<SortOption>
          label={t('properties.filters.sort')}
          value={filters.sort}
          onChange={(v) => onFilter('sort', v)}
          options={[
            { id: 'recent', label: t('properties.filters.sortRecent') },
            { id: 'name', label: t('properties.filters.sortName') },
            { id: 'rent', label: t('properties.filters.sortRent') },
            { id: 'occupancy', label: t('properties.filters.sortOccupancy') },
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
            {t('properties.filters.reset')}
          </Button>
        )}
      </div>

      <ToggleButtonGroup
        aria-label={t('properties.filters.view')}
        selectionMode="single"
        disallowEmptySelection
        selectedKeys={new Set([view])}
        onSelectionChange={(keys) => {
          const [next] = keys
          if (next) onViewChange(next as PropertiesView)
        }}
        className="hidden sm:flex lg:ml-auto"
      >
        <ToggleButton id="grid" isIconOnly aria-label={t('properties.filters.viewGrid')}>
          <LayoutGrid className="size-4" aria-hidden />
        </ToggleButton>
        <ToggleButton id="table" isIconOnly aria-label={t('properties.filters.viewTable')}>
          <ToggleButtonGroup.Separator />
          <List className="size-4" aria-hidden />
        </ToggleButton>
      </ToggleButtonGroup>
    </div>
  )
}
