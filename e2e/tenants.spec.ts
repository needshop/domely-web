import { expect, test } from '@playwright/test'

const rows = (page: import('@playwright/test').Page) => page.locator('tbody tr')

test.describe('Locataires — liste', () => {
  test('affiche les locataires, indicateurs et pagination par 10', async ({ page }) => {
    await page.goto('/tenants')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Locataires')
    await expect(page.getByText('62 résultats')).toBeVisible()
    await expect(rows(page)).toHaveCount(10)
    await expect(page.getByText('1–10 sur 62')).toBeVisible()

    await page.getByRole('button', { name: 'Page 7' }).click()
    await expect(page).toHaveURL(/page=7/)
    await expect(rows(page)).toHaveCount(2)
  })

  test('recherche par nom, téléphone et bien', async ({ page }) => {
    await page.goto('/tenants')
    await page.getByRole('searchbox').fill('teranga')
    await expect(page.getByText('1 résultat', { exact: true })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Teranga Digital SAS' })).toBeVisible()

    // Numéro saisi sans espaces
    await page.getByRole('searchbox').fill('0748129031')
    await expect(page.getByText('1 résultat', { exact: true })).toBeVisible()

    await page.getByRole('searchbox').fill('horizon business')
    await expect(page.getByText('3 résultats')).toBeVisible()
  })

  test('filtres de situation, type et bien dans l’URL', async ({ page }) => {
    await page.goto('/tenants?status=late')
    await expect(page.getByText('4 résultats')).toBeVisible()
    await expect(page.getByText('Loyer en retard').first()).toBeVisible()

    await page.goto('/tenants?status=inactive')
    await expect(page.getByText('3 résultats')).toBeVisible()

    await page.goto('/tenants?kind=company')
    await expect(page.getByText('5 résultats')).toBeVisible()

    await page.goto('/tenants?property=p1')
    await expect(page.getByText('12 résultats')).toBeVisible()

    await page.getByRole('button', { name: 'Réinitialiser les filtres' }).first().click()
    await expect(page.getByText('62 résultats')).toBeVisible()
  })

  test('état vide', async ({ page }) => {
    await page.goto('/tenants?q=introuvable')
    await expect(page.getByText('Aucun locataire ne correspond à votre recherche')).toBeVisible()
  })

  test('liste en cartes sur mobile, sans débordement', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/tenants')
    await expect(page.getByRole('link', { name: /^Voir la fiche de/ })).toHaveCount(10)
    const { scrollWidth, clientWidth } = await page
      .locator('html')
      .evaluate((el) => ({ scrollWidth: el.scrollWidth, clientWidth: el.clientWidth }))
    expect(scrollWidth).toBe(clientWidth)
  })
})

test.describe('Locataires — fiche', () => {
  test('société avec deux baux, liens vers les biens', async ({ page }) => {
    await page.goto('/tenants')
    await page.getByRole('searchbox').fill('teranga')
    await page.getByRole('link', { name: 'Teranga Digital SAS' }).click()

    await expect(page).toHaveURL(/\/tenants\/c3$/)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Teranga Digital SAS')
    await expect(page.getByText('Société', { exact: true })).toBeVisible()
    await expect(page.getByText('Pape Ndiaye')).toBeVisible()
    await expect(page.getByRole('link', { name: 'Appeler' })).toHaveAttribute(
      'href',
      'tel:+2250748129031',
    )

    const leases = page.getByRole('link', { name: 'Horizon Business Center' })
    await expect(leases).toHaveCount(2)
    await leases.first().click()
    await expect(page).toHaveURL(/\/properties\/p6$/)
  })

  test('locataire sans bail en cours', async ({ page }) => {
    await page.goto('/tenants/f1')
    await expect(page.getByText('Sans bail', { exact: true })).toBeVisible()
    await expect(page.getByText('Aucun bail en cours').first()).toBeVisible()
  })

  test('locataire introuvable', async ({ page }) => {
    await page.goto('/tenants/inconnu')
    await expect(page.getByText('Ce locataire est introuvable.')).toBeVisible()
    await page.getByRole('link', { name: 'Retour aux locataires' }).click()
    await expect(page).toHaveURL(/\/tenants$/)
  })

  test('depuis la fiche d’un bien, le nom du locataire mène à sa fiche', async ({ page }) => {
    await page.goto('/properties/p6')
    await page.getByRole('link', { name: 'Atlantique Assurances SA' }).click()
    await expect(page).toHaveURL(/\/tenants\/c2$/)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Atlantique Assurances SA')
  })
})
