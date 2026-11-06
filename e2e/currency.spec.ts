import { expect, test } from '@playwright/test'

test.describe('Devise', () => {
  test('XOF par défaut, convertit en EUR puis GNF et mémorise le choix', async ({ page }) => {
    await page.goto('/')
    const unpaid = page
      .getByText('Loyers impayés')
      .locator('xpath=ancestor::*[contains(@class,"card")][1]')
    await expect(unpaid).toContainText('1,27 M F CFA')

    const select = page.getByRole('button', { name: /Devise/ })
    await select.click()
    await page.getByRole('option', { name: /EUR/ }).click()
    // 1 268 000 XOF / 655,957 = 1 933,07 €
    await expect(unpaid).toContainText('1 933 €')

    await page.reload()
    await expect(unpaid).toContainText('1 933 €')

    await page.getByRole('button', { name: /Devise/ }).click()
    await page.getByRole('option', { name: /GNF/ }).click()
    // 1 268 000 XOF × 14,18 = 17 980 240 GNF → abrégé au-delà du million
    await expect(unpaid).toContainText('17,98 M GNF')
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
