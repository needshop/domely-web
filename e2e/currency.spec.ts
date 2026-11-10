import { expect, test } from '@playwright/test'

test.describe('Devise', () => {
  test('XOF par défaut, convertit en EUR puis GNF et mémorise le choix', async ({ page }) => {
    // Montant fixe d'un contrat fictif : 700 000 + 56 000 de charges
    await page.goto('/contracts/l903')
    const monthly = page
      .getByText('Loyer + charges', { exact: true })
      .first()
      .locator('xpath=ancestor::*[contains(@class,"card")][1]')
    await expect(monthly).toContainText('756 000 F CFA')

    const select = page.getByRole('button', { name: /Devise/ })
    await select.click()
    await page.getByRole('option', { name: /EUR/ }).click()
    // 756 000 XOF / 655,957 = 1 152,52 €
    await expect(monthly).toContainText('1 153 €')

    await page.reload()
    await expect(monthly).toContainText('1 153 €')

    await page.getByRole('button', { name: /Devise/ }).click()
    await page.getByRole('option', { name: /GNF/ }).click()
    // 756 000 XOF × 14,18 = 10 720 080 GNF → abrégé au-delà du million
    await expect(monthly).toContainText('10,72 M GNF')
  })

  test('pas de défilement horizontal du header sur mobile', async ({ browser }) => {
    const context = await browser.newContext({
      locale: 'fr-FR',
      viewport: { width: 360, height: 780 },
    })
    const page = await context.newPage()
    await page.goto('/')
    await expect(page.getByRole('button', { name: /Devise/ })).toBeVisible()
    const { scrollWidth, clientWidth } = await page
      .locator('html')
      .evaluate((el) => ({ scrollWidth: el.scrollWidth, clientWidth: el.clientWidth }))
    expect(scrollWidth).toBe(clientWidth)
    await context.close()
  })
})
