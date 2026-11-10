import { expect, type Page, test } from '@playwright/test'

const rows = (page: Page) => page.locator('tbody tr')

/** En-tête de la fiche (titre, statut, priorité). */
const header = (page: Page) =>
  page.locator('header', { has: page.getByRole('heading', { level: 1 }) })

/** Saisit une date (jj/mm/aaaa) dans un champ date React Aria. */
async function typeDate(page: Page, group: string, date: Date) {
  await page.getByRole('group', { name: group }).getByRole('spinbutton').first().focus()
  const dd = String(date.getDate()).padStart(2, '0')
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  await page.keyboard.type(`${dd}${mm}${date.getFullYear()}`)
}

test.describe('Interventions — liste', () => {
  test('affiche les interventions à traiter, urgentes en premier', async ({ page }) => {
    await page.goto('/maintenance')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Interventions')
    await expect(page.getByText('7 résultats')).toBeVisible()
    // Les trois urgentes en tête
    for (let i = 0; i < 3; i++) {
      await expect(rows(page).nth(i).getByText('Urgente', { exact: true })).toBeVisible()
    }
  })

  test('filtres de statut, catégorie et recherche', async ({ page }) => {
    await page.goto('/maintenance?status=all')
    await expect(page.getByText('14 résultats')).toBeVisible()
    await page.goto('/maintenance?status=done')
    await expect(page.getByText('6 résultats')).toBeVisible()
    await page.goto('/maintenance?status=all&category=plumbing')
    await expect(page.getByText('4 résultats')).toBeVisible()
    await page.goto('/maintenance?status=all')
    await page.getByRole('searchbox').fill('kouadio')
    await expect(page.getByText('1 résultat', { exact: true })).toBeVisible()
  })
})

test.describe('Interventions — cycle de vie', () => {
  test('planifier, démarrer puis terminer une nouvelle intervention', async ({ page }) => {
    await page.goto('/maintenance')
    await page.getByRole('link', { name: 'Climatisation en panne' }).click()
    await expect(page).toHaveURL(/\/maintenance\/m\d+$/)
    await expect(header(page).getByText('Nouvelle', { exact: true })).toBeVisible()

    // Planifier
    await page.getByRole('button', { name: 'Planifier' }).click()
    const dialog = page.getByRole('dialog')
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    await typeDate(page, 'Date de passage', tomorrow)
    await dialog.getByLabel('Prestataire', { exact: true }).fill('Froid Plus')
    await dialog.getByRole('button', { name: 'Planifier' }).click()
    await expect(page.getByText('Passage planifié').first()).toBeVisible()
    await expect(header(page).getByText('Planifiée', { exact: true })).toBeVisible()
    await expect(page.getByText('Froid Plus')).toBeVisible()

    // Démarrer
    await page.getByRole('button', { name: 'Démarrer' }).click()
    await expect(header(page).getByText('En cours', { exact: true })).toBeVisible()

    // Terminer avec le coût réel
    await page.getByRole('button', { name: 'Terminer' }).click()
    await page.getByRole('dialog').getByLabel('Coût réel').fill('120000')
    await page.getByRole('dialog').getByRole('button', { name: 'Marquer comme terminée' }).click()
    await expect(header(page).getByText('Terminée', { exact: true })).toBeVisible()
    await expect(
      page.getByText('Coût réel', { exact: true }).locator('..').getByText('120 000 F CFA'),
    ).toBeVisible()
    await expect(page.getByText('Intervention terminée').first()).toBeVisible()

    // Rouvrir
    await page.getByRole('button', { name: 'Rouvrir' }).click()
    await expect(header(page).getByText('En cours', { exact: true })).toBeVisible()
  })

  test('annuler une intervention avec un motif', async ({ page }) => {
    await page.goto('/maintenance/m5')
    await page.getByRole('button', { name: 'Annuler l’intervention' }).click()
    const dialog = page.getByRole('dialog')
    await dialog.getByLabel('Motif (facultatif)').fill('Reportée à l’an prochain')
    await dialog.getByRole('button', { name: 'Annuler l’intervention' }).click()
    await expect(header(page).getByText('Annulée', { exact: true })).toBeVisible()
    await expect(page.getByText('Reportée à l’an prochain')).toBeVisible()
  })

  test('date de fin dans le futur refusée', async ({ page }) => {
    await page.goto('/maintenance/m1')
    await page.getByRole('button', { name: 'Terminer' }).click()
    const later = new Date()
    later.setDate(later.getDate() + 3)
    await typeDate(page, 'Date de fin', later)
    await page.getByRole('dialog').getByRole('button', { name: 'Marquer comme terminée' }).click()
    await expect(page.getByText('La date ne peut pas être dans le futur.')).toBeVisible()
  })
})

test.describe('Interventions — signalement et modification', () => {
  test('signaler depuis la fiche d’un bien, sur les parties communes', async ({ page }) => {
    await page.goto('/properties/p1')
    await page.getByRole('link', { name: 'Signaler une intervention' }).click()
    await expect(page).toHaveURL('/maintenance/new?property=p1')

    await page.getByLabel('Titre').fill('Ampoules du hall à remplacer')
    await page.getByRole('button', { name: 'Signaler', exact: true }).click()

    await expect(page).toHaveURL(/\/maintenance\/m-/)
    await expect(page.getByText('Intervention signalée')).toBeVisible()
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Ampoules du hall à remplacer')
    await expect(page.getByText('Parties communes').first()).toBeVisible()
    await expect(header(page).getByText('Nouvelle', { exact: true })).toBeVisible()

    // Visible dans l'onglet Interventions du bien
    await page.getByRole('link', { name: /Résidence Les Oliviers/ }).click()
    await page.getByRole('tab', { name: /Interventions/ }).click()
    await expect(page.getByRole('link', { name: 'Ampoules du hall à remplacer' })).toBeVisible()
  })

  test('champs obligatoires', async ({ page }) => {
    await page.goto('/maintenance/new')
    await page.getByRole('button', { name: 'Signaler', exact: true }).click()
    await expect(page.getByText('Le formulaire contient des erreurs')).toBeVisible()
    // titre, bien, lot
    await expect(page.getByText('Ce champ est obligatoire.')).toHaveCount(3)
  })

  test('ajouter une date de passage planifie une nouvelle demande', async ({ page }) => {
    await page.goto('/maintenance/m5/edit')
    const soon = new Date()
    soon.setDate(soon.getDate() + 10)
    await typeDate(page, 'Date de passage', soon)
    await page.getByRole('button', { name: 'Enregistrer' }).click()
    await expect(page).toHaveURL('/maintenance/m5')
    await expect(header(page).getByText('Planifiée', { exact: true })).toBeVisible()
  })
})

test('le tableau de bord liste les interventions à traiter', async ({ page }) => {
  await page.goto('/')
  const card = page
    .getByText('Interventions à traiter')
    .locator('xpath=ancestor::*[contains(concat(" ",@class," ")," card ")][1]')
  await expect(card.getByRole('link')).toHaveCount(5) // 4 interventions + « Tout voir »
  await expect(card.getByText('Fuite du chauffe-eau')).toBeVisible()
})

test('liste en cartes sur mobile, sans débordement horizontal', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto('/maintenance?status=all')
  await expect(page.getByRole('link', { name: /^Voir l’intervention/ })).toHaveCount(10)
  const { scrollWidth, clientWidth } = await page
    .locator('html')
    .evaluate((el) => ({ scrollWidth: el.scrollWidth, clientWidth: el.clientWidth }))
  expect(scrollWidth).toBe(clientWidth)
})
