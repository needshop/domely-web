import { Card } from '@heroui/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useFormatters } from '@/lib/format'
import type { MonthlyCollection } from '../types'

const HEIGHT = 240
const MARGIN = { top: 12, right: 8, bottom: 28 }
const MAX_BAR = 24
const RADIUS = 4

/** Pas d'axe « propre » (1, 2, 2.5, 5 × 10^n) pour ~4 graduations. */
function niceStep(max: number, ticks = 4) {
  const raw = max / ticks
  const pow = 10 ** Math.floor(Math.log10(raw))
  const n = raw / pow
  const nice = n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10
  return nice * pow
}

/** Barre arrondie (4px) côté valeur, carrée côté ligne de base. */
function barPath(x: number, y: number, w: number, h: number) {
  const r = Math.min(RADIUS, h, w / 2)
  return `M${x},${y + h}V${y + r}Q${x},${y} ${x + r},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h}Z`
}

function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [width, setWidth] = useState(0)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return [ref, width] as const
}

export function RentCollectionChart({ data: rawData }: { data: MonthlyCollection[] }) {
  const { t } = useTranslation()
  const f = useFormatters()
  // Montants convertis dans la devise d'affichage : l'axe a ainsi des graduations « rondes »
  const data = useMemo(
    () =>
      rawData.map((d) => ({
        ...d,
        collected: f.convert(d.collected),
        expected: f.convert(d.expected),
      })),
    [rawData, f],
  )
  const [containerRef, width] = useWidth<HTMLDivElement>()
  const [active, setActive] = useState<number | null>(null)

  const totals = useMemo(() => {
    const collected = data.reduce((s, d) => s + d.collected, 0)
    const expected = data.reduce((s, d) => s + d.expected, 0)
    return { collected, rate: expected ? collected / expected : 0 }
  }, [data])

  const innerH = HEIGHT - MARGIN.top - MARGIN.bottom
  const step = niceStep(Math.max(...data.map((d) => d.collected)))
  const yMax = Math.ceil(Math.max(...data.map((d) => d.collected)) / step) * step
  const ticks = Array.from({ length: Math.round(yMax / step) + 1 }, (_, i) => i * step)
  // Marge gauche adaptée au plus long libellé d'axe (ex. « 15 M F CFA »)
  const marginLeft = Math.max(40, Math.max(...ticks.map((v) => f.formatAxis(v).length)) * 6.4 + 14)
  const innerW = Math.max(0, width - marginLeft - MARGIN.right)
  const band = data.length ? innerW / data.length : 0
  const barW = Math.min(MAX_BAR, band * 0.6)
  const y = (v: number) => MARGIN.top + innerH - (v / yMax) * innerH
  const showEveryOther = band < 40
  const months = data.map((d) => new Date(`${d.month}T12:00:00`))
  const lastIndex = data.length - 1

  const activeDatum = active !== null ? data[active] : null

  return (
    <Card className="gap-4 p-5">
      <Card.Header className="flex-row flex-wrap items-end justify-between gap-4">
        <div>
          <Card.Title className="font-display text-base">
            {t('dashboard.collections.title')}
          </Card.Title>
          <Card.Description>{t('dashboard.collections.subtitle')}</Card.Description>
        </div>
        <dl className="flex gap-6 text-right">
          <div>
            <dt className="text-xs text-muted">{t('dashboard.collections.collected')}</dt>
            <dd className="text-lg font-semibold">{f.formatAmount(totals.collected)}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted">{t('dashboard.collections.rate')}</dt>
            <dd className="text-lg font-semibold">{f.percent(totals.rate)}</dd>
          </div>
        </dl>
      </Card.Header>

      <Card.Content>
        <div ref={containerRef} className="relative" onPointerLeave={() => setActive(null)}>
          {width > 0 && (
            <svg
              width={width}
              height={HEIGHT}
              role="img"
              aria-label={t('dashboard.collections.chartLabel', {
                from: f.monthLong(months[0]),
                to: f.monthLong(months[lastIndex]),
              })}
              className="block overflow-visible"
            >
              {/* Grille + axe Y */}
              {ticks.map((tick) => (
                <g key={tick}>
                  <line
                    x1={marginLeft}
                    x2={width - MARGIN.right}
                    y1={y(tick)}
                    y2={y(tick)}
                    stroke="var(--chart-grid)"
                    strokeWidth={1}
                  />
                  <text
                    x={marginLeft - 8}
                    y={y(tick)}
                    dy="0.32em"
                    textAnchor="end"
                    className="fill-muted text-[11px] tabular-nums"
                  >
                    {f.formatAxis(tick)}
                  </text>
                </g>
              ))}

              {data.map((d, i) => {
                const cx = marginLeft + band * i + band / 2
                const top = y(d.collected)
                const isCurrent = i === lastIndex
                const isActive = active === i
                return (
                  <g key={d.month}>
                    <path
                      d={barPath(cx - barW / 2, top, barW, MARGIN.top + innerH - top)}
                      fill={isCurrent ? 'var(--chart-highlight)' : 'var(--chart-bar)'}
                      opacity={active === null || isActive ? 1 : 0.55}
                      className="transition-opacity"
                    />
                    {(!showEveryOther || i % 2 === lastIndex % 2) && (
                      <text
                        x={cx}
                        y={HEIGHT - 8}
                        textAnchor="middle"
                        className={
                          isCurrent
                            ? 'fill-foreground text-[11px] font-medium'
                            : 'fill-muted text-[11px]'
                        }
                      >
                        {f.monthShort(months[i])}
                      </text>
                    )}
                    {/* Zone de survol / focus : toute la colonne */}
                    <rect
                      x={cx - band / 2}
                      y={MARGIN.top}
                      width={band}
                      height={innerH}
                      fill="transparent"
                      tabIndex={0}
                      aria-label={`${f.monthLong(months[i])} : ${f.formatAmountExact(d.collected)} / ${f.formatAmountExact(d.expected)}`}
                      onPointerEnter={() => setActive(i)}
                      onFocus={() => setActive(i)}
                      onBlur={() => setActive(null)}
                      className="cursor-default outline-none"
                    />
                  </g>
                )
              })}
            </svg>
          )}

          {activeDatum && active !== null && (
            <div
              role="tooltip"
              className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-lg bg-overlay px-3 py-2 text-xs whitespace-nowrap text-overlay-foreground shadow-overlay"
              style={{
                left: Math.min(Math.max(marginLeft + band * active + band / 2, 90), width - 90),
                top: y(activeDatum.collected) - 8,
              }}
            >
              <p className="text-muted capitalize">{f.monthLong(months[active])}</p>
              <p className="mt-0.5 flex items-center gap-2">
                <span
                  aria-hidden
                  className="h-0.5 w-3 rounded-full"
                  style={{
                    background:
                      active === lastIndex ? 'var(--chart-highlight)' : 'var(--chart-bar)',
                  }}
                />
                <span className="text-sm font-semibold">
                  {f.formatAmount(activeDatum.collected)}
                </span>
                <span className="text-muted">{t('dashboard.collections.tooltipCollected')}</span>
              </p>
              <p className="text-muted">
                {t('dashboard.collections.tooltipExpected', {
                  amount: f.formatAmount(activeDatum.expected),
                })}
              </p>
            </div>
          )}
        </div>

        {/* Vue tableau : les valeurs restent accessibles sans survol */}
        <details className="mt-2 text-sm">
          <summary className="cursor-pointer text-xs text-muted hover:text-foreground">
            {t('dashboard.collections.tableToggle')}
          </summary>
          <table className="mt-2 w-full text-left text-xs tabular-nums">
            <thead className="text-muted">
              <tr>
                <th className="py-1 font-normal">{t('dashboard.collections.month')}</th>
                <th className="py-1 text-right font-normal">
                  {t('dashboard.collections.collected')}
                </th>
                <th className="py-1 text-right font-normal">
                  {t('dashboard.collections.expected')}
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((d, i) => (
                <tr key={d.month} className="border-t border-separator">
                  <td className="py-1 capitalize">{f.monthLong(months[i])}</td>
                  <td className="py-1 text-right">{f.formatAmountExact(d.collected)}</td>
                  <td className="py-1 text-right text-muted">{f.formatAmountExact(d.expected)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </details>
      </Card.Content>
    </Card>
  )
}
