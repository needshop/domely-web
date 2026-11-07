import { Pagination } from '@heroui/react'
import { useTranslation } from 'react-i18next'

/** Numéros à afficher : 1 … 4 5 6 … 12 (pages proches de la page courante + extrémités). */
function pageItems(page: number, pageCount: number): (number | 'ellipsis')[] {
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, i) => i + 1)
  const items: (number | 'ellipsis')[] = [1]
  const start = Math.max(2, page - 1)
  const end = Math.min(pageCount - 1, page + 1)
  if (start > 2) items.push('ellipsis')
  for (let p = start; p <= end; p++) items.push(p)
  if (end < pageCount - 1) items.push('ellipsis')
  items.push(pageCount)
  return items
}

interface ListPaginationProps {
  page: number
  pageCount: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
}

/** Pagination de liste : résumé « 1–9 sur 12 » + précédent / pages / suivant. */
export function ListPagination({
  page,
  pageCount,
  pageSize,
  total,
  onPageChange,
}: ListPaginationProps) {
  const { t } = useTranslation()
  if (pageCount <= 1) return null

  const from = (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, total)

  return (
    <Pagination
      aria-label={t('pagination.label')}
      className="flex-col gap-3 sm:flex-row sm:justify-between"
    >
      <Pagination.Summary>{t('pagination.summary', { from, to, total })}</Pagination.Summary>
      <Pagination.Content>
        <Pagination.Item>
          <Pagination.Previous isDisabled={page === 1} onPress={() => onPageChange(page - 1)}>
            <Pagination.PreviousIcon />
            <span className="hidden sm:inline">{t('pagination.previous')}</span>
          </Pagination.Previous>
        </Pagination.Item>
        {pageItems(page, pageCount).map((item, i) =>
          item === 'ellipsis' ? (
            <Pagination.Item key={`e${i}`}>
              <Pagination.Ellipsis />
            </Pagination.Item>
          ) : (
            <Pagination.Item key={item}>
              <Pagination.Link
                isActive={item === page}
                aria-label={t('pagination.page', { page: item })}
                aria-current={item === page ? 'page' : undefined}
                onPress={() => onPageChange(item)}
              >
                {item}
              </Pagination.Link>
            </Pagination.Item>
          ),
        )}
        <Pagination.Item>
          <Pagination.Next isDisabled={page === pageCount} onPress={() => onPageChange(page + 1)}>
            <span className="hidden sm:inline">{t('pagination.next')}</span>
            <Pagination.NextIcon />
          </Pagination.Next>
        </Pagination.Item>
      </Pagination.Content>
    </Pagination>
  )
}
