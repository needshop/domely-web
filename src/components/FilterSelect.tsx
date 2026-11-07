import { ListBox, Select } from '@heroui/react'
import { cn } from '@/lib/cn'

export interface FilterOption<T extends string> {
  id: T
  label: string
}

interface FilterSelectProps<T extends string> {
  label: string
  value: T
  options: FilterOption<T>[]
  onChange: (value: T) => void
  className?: string
}

/** Liste déroulante compacte pour les barres de filtres. */
export function FilterSelect<T extends string>({
  label,
  value,
  options,
  onChange,
  className,
}: FilterSelectProps<T>) {
  return (
    <Select
      aria-label={label}
      value={value}
      onChange={(key) => {
        if (key !== null) onChange(String(key) as T)
      }}
      className={cn('min-w-40', className)}
    >
      <Select.Trigger className="h-10 text-sm">
        <Select.Value />
        <Select.Indicator />
      </Select.Trigger>
      <Select.Popover>
        <ListBox>
          {options.map((o) => (
            <ListBox.Item key={o.id} id={o.id} textValue={o.label}>
              {o.label}
              <ListBox.ItemIndicator />
            </ListBox.Item>
          ))}
        </ListBox>
      </Select.Popover>
    </Select>
  )
}
