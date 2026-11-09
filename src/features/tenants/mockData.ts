import { propertiesMock } from '@/features/properties/mockData'
import type { EmergencyRelation, Tenant } from './types'

/**
 * Données fictives des locataires, en attendant l'API (../api).
 * Les particuliers (t1, t2…) sont ceux attribués aux lots loués des biens fictifs ;
 * les sociétés (c1…) sont rattachées explicitement à des bureaux et boutiques.
 */

const firstNames = [
  'Awa',
  'Moussa',
  'Fatou',
  'Koffi',
  'Aïcha',
  'Ibrahima',
  'Mariam',
  'Yao',
  'Aminata',
  'Serge',
  'Ramatou',
  'Cheikh',
  'Adjoa',
  'Mamadou',
  'Nafissatou',
  'Kodjo',
  'Salimata',
  'Ousmane',
  'Grâce',
  'Abdoulaye',
  'Rokia',
  'Kwame',
  'Fanta',
  'Edem',
  'Binta',
]

const lastNames = [
  'Diallo',
  'Traoré',
  'Ndiaye',
  'Mensah',
  'Koné',
  'Sow',
  'Ouattara',
  'Kouassi',
  'Cissé',
  'Agbodjan',
  'Bah',
  'Fall',
  'Diop',
  'Coulibaly',
  'Sarr',
  'Adjovi',
  'Touré',
  'Hounkpatin',
  'Konaté',
  'Gueye',
  'Yeo',
  'Amegah',
  'Sylla',
  'Dossou',
  'Kaboré',
  'Faye',
]

const occupations = [
  'Comptable',
  'Médecin',
  'Architecte',
  'Journaliste',
  'Fonctionnaire',
  'Juriste',
  'Chef de projet',
  'Cadre bancaire',
  'Pharmacien',
  'Ingénieur',
  'Commerçant',
  'Professeur',
]

const relations: EmergencyRelation[] = ['spouse', 'parent', 'sibling', 'friend', 'child']
const mailDomains = ['gmail.com', 'yahoo.fr', 'outlook.com']

/** Indicatif et format de numéro mobile par pays. */
const phonePrefix: Record<string, string> = {
  SN: '+221 77',
  CI: '+225 07',
  TG: '+228 90',
  BJ: '+229 01 97',
}

const pad = (n: number, size = 2) => String(n % 10 ** size).padStart(size, '0')
const phone = (country: string, seed: number) =>
  `${phonePrefix[country] ?? '+221 77'} ${pad(seed * 37 + 11, 3)} ${pad(seed * 13 + 7)} ${pad(seed * 29 + 3)}`

const ascii = (s: string) =>
  s
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()

/** Baux des biens fictifs : locataire → pays et début du premier bail. */
const leaseInfo = new Map<string, { country: string; since: string }>()
for (const property of propertiesMock) {
  for (const unit of property.units) {
    if (!unit.lease) continue
    const previous = leaseInfo.get(unit.lease.tenantId)
    if (!previous || unit.lease.startDate < previous.since) {
      leaseInfo.set(unit.lease.tenantId, {
        country: previous?.country ?? property.address.country,
        since: unit.lease.startDate,
      })
    }
  }
}

function individual(id: string, i: number, country: string, since: string): Tenant {
  const first = firstNames[(i * 7) % firstNames.length]
  const last = lastNames[(i * 11) % lastNames.length]
  const relative = `${firstNames[(i * 7 + 5) % firstNames.length]} ${last}`
  return {
    id,
    kind: 'individual',
    name: `${first} ${last}`,
    phone: phone(country, i + 1),
    email:
      i % 5 === 4
        ? undefined
        : `${ascii(first)}.${ascii(last)}@${mailDomains[i % mailDomains.length]}`,
    occupation: occupations[(i * 5) % occupations.length],
    idDocument:
      i % 4 === 3
        ? { type: 'passport', number: `A${pad(i * 7919 + 1234567, 8)}` }
        : { type: 'nationalId', number: `${country}-${pad(i * 104_729 + 1_500_000_000, 10)}` },
    emergencyContact:
      i % 3 === 2
        ? undefined
        : {
            name: relative,
            phone: phone(country, i + 101),
            relation: relations[i % relations.length],
          },
    createdAt: since,
  }
}

const individualIds = [...leaseInfo.keys()]
  .filter((id) => id.startsWith('t'))
  .sort((a, b) => Number(a.slice(1)) - Number(b.slice(1)))

const companies: Tenant[] = [
  {
    id: 'c1',
    kind: 'company',
    name: 'Cabinet Kouamé & Associés',
    phone: '+225 27 20 21 45 60',
    email: 'contact@kouame-associes.ci',
    occupation: 'Cabinet d’avocats',
    contactPerson: 'Me Didier Kouamé',
    idDocument: { type: 'companyRegistration', number: 'CI-ABJ-2012-B-10452' },
    createdAt: leaseInfo.get('c1')?.since ?? '2024-01-01',
  },
  {
    id: 'c2',
    kind: 'company',
    name: 'Atlantique Assurances SA',
    phone: '+225 27 20 33 18 00',
    email: 'services.generaux@atlantique-assurances.ci',
    occupation: 'Assurance',
    contactPerson: 'Clarisse Yao',
    idDocument: { type: 'companyRegistration', number: 'CI-ABJ-2003-B-2871' },
    createdAt: leaseInfo.get('c2')?.since ?? '2024-01-01',
  },
  {
    id: 'c3',
    kind: 'company',
    name: 'Teranga Digital SAS',
    phone: '+225 07 48 12 90 31',
    email: 'hello@teranga-digital.com',
    occupation: 'Services numériques',
    contactPerson: 'Pape Ndiaye',
    idDocument: { type: 'companyRegistration', number: 'CI-ABJ-2019-B-22310' },
    createdAt: leaseInfo.get('c3')?.since ?? '2024-01-01',
    notes: 'Occupe deux bureaux au même étage ; souhaite un troisième si disponible.',
  },
  {
    id: 'c4',
    kind: 'company',
    name: 'Pharmacie du Golfe',
    phone: '+228 22 21 54 87',
    email: 'pharmaciedugolfe@yahoo.fr',
    occupation: 'Pharmacie',
    contactPerson: 'Dr Akossiwa Amegah',
    idDocument: { type: 'companyRegistration', number: 'TG-LOM-2016-B-1408' },
    createdAt: leaseInfo.get('c4')?.since ?? '2024-01-01',
  },
  {
    id: 'c5',
    kind: 'company',
    name: 'Sahel Distribution SARL',
    phone: '+229 01 21 30 44 52',
    email: 'direction@saheldistribution.com',
    occupation: 'Distribution de produits alimentaires',
    contactPerson: 'Hamidou Sylla',
    idDocument: { type: 'companyRegistration', number: 'RB-COT-2014-B-9921' },
    createdAt: leaseInfo.get('c5')?.since ?? '2024-01-01',
  },
]

/** Anciens locataires, sans bail en cours. */
const formerTenants: Tenant[] = [
  { ...individual('f1', 60, 'SN', '2022-04-01'), notes: 'Bail résilié en août 2026 (mutation).' },
  { ...individual('f2', 61, 'CI', '2023-02-15'), notes: 'Parti fin juin 2026, caution restituée.' },
  individual('f3', 62, 'TG', '2021-09-10'),
]

export const tenantsMock: Tenant[] = [
  ...individualIds.map((id, i) => {
    const info = leaseInfo.get(id)!
    return individual(id, i, info.country, info.since)
  }),
  ...companies,
  ...formerTenants,
]
