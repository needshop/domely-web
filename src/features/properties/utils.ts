import type { Property, PropertyStats } from './types'

/** Calcule les indicateurs d'un bien à partir de ses lots. */
export function propertyStats(property: Property): PropertyStats {
  const stats: PropertyStats = {
    units: property.units.length,
    rented: 0,
    vacant: 0,
    underWorks: 0,
    occupancyRate: 0,
    monthlyRent: 0,
    potentialRent: 0,
    lateCount: 0,
    totalArea: 0,
  }
  for (const u of property.units) {
    stats.potentialRent += u.rent
    stats.totalArea += u.area
    if (u.status === 'rented') {
      stats.rented += 1
      stats.monthlyRent += u.rent
      if (u.isLate) stats.lateCount += 1
    } else if (u.status === 'vacant') stats.vacant += 1
    else stats.underWorks += 1
  }
  stats.occupancyRate = stats.units ? stats.rented / stats.units : 0
  return stats
}

/** Indicateurs agrégés d'un ensemble de biens. */
export function portfolioStats(properties: Property[]) {
  const all = properties.map(propertyStats)
  const units = all.reduce((s, p) => s + p.units, 0)
  const rented = all.reduce((s, p) => s + p.rented, 0)
  return {
    properties: properties.length,
    units,
    rented,
    vacant: all.reduce((s, p) => s + p.vacant, 0),
    underWorks: all.reduce((s, p) => s + p.underWorks, 0),
    occupancyRate: units ? rented / units : 0,
    monthlyRent: all.reduce((s, p) => s + p.monthlyRent, 0),
    lateCount: all.reduce((s, p) => s + p.lateCount, 0),
  }
}
