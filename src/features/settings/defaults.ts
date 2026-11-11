import { GNF_PER_XOF } from '@/lib/currency'
import type { Settings } from './types'

export const defaultSettings: Settings = {
  profile: { name: '', email: '', phone: '' },
  organization: {
    kind: 'individual',
    name: '',
    country: 'SN',
    city: '',
    address: '',
    registration: '',
    phone: '',
    email: '',
  },
  rentals: {
    paymentDay: 5,
    leaseMonths: 12,
    tacitRenewal: true,
    depositMonthsResidential: 2,
    depositMonthsCommercial: 3,
  },
  exchangeRates: { GNF: GNF_PER_XOF },
  reminder: { template: '' },
}
