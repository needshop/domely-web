import { expect, test } from '@playwright/test'

test.describe('Tableau de bord', () => {
  test('affiche les indicateurs et les sections', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('Biens gérés')).toBeVisible()
    await expect(page.getByText('Loyers impayés')).toBeVisible()
    for (const title of [
      'Loyers encaissés',
      'Occupation du parc',
      'Loyers en retard',
      'Échéances à venir',
      'Mes biens récents',
      'Interventions en cours',
    ]) {
      await expect(page.getByText(title, { exact: true })).toBeVisible()
    }
  })

  test('le graphique affiche un tooltip au survol et une vue tableau', async ({ page }) => {
    await page.goto('/')
    const chart = page.getByRole('img', { name: /Histogramme des loyers encaissés/ })
    await expect(chart).toBeVisible()
    await chart.locator('rect[tabindex]').last().hover()
    await expect(page.getByRole('tooltip')).toContainText('novembre 2026')

    await page.getByText('Voir les données').click()
    await expect(page.getByRole('cell', { name: 'novembre 2026' })).toBeVisible()
  })

  test('pas de défilement horizontal sur mobile', async ({ browser }) => {
    const context = await browser.newContext({
      locale: 'fr-FR',
      viewport: { width: 390, height: 844 },
    })
    const page = await context.newPage()
    await page.goto('/')
    await expect(page.getByText('Loyers en retard')).toBeVisible()
    const { scrollWidth, clientWidth } = await page
      .locator('html')
      .evaluate((el) => ({ scrollWidth: el.scrollWidth, clientWidth: el.clientWidth }))
    expect(scrollWidth).toBe(clientWidth)
    await context.close()
  })

  test('déplier les données du graphique ne change pas la hauteur de la carte Occupation', async ({
    page,
  }) => {
    await page.goto('/')
    const occupancy = page
      .getByText('Occupation du parc', { exact: true })
      .locator('xpath=ancestor::*[contains(concat(" ", @class, " "), " card ")][1]')
    const chartCard = page
      .getByRole('img', { name: /Histogramme/ })
      .locator('xpath=ancestor::*[contains(concat(" ", @class, " "), " card ")][1]')
    const before = await occupancy.boundingBox()
    // Alignées tableau fermé
    expect(before?.height).toBe((await chartCard.boundingBox())?.height)

    await page.getByText('Voir les données').click()
    await expect(page.getByRole('cell', { name: 'novembre 2026' })).toBeVisible()
    expect((await occupancy.boundingBox())?.height).toBe(before?.height)
  })
})
