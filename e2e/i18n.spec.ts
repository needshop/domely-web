import { expect, test } from '@playwright/test'

test.describe('Multilangue (fr / en)', () => {
  test('bascule en anglais, met à jour <html lang> et mémorise le choix', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Bonjour,')

    await page.getByRole('radio', { name: 'English' }).click()
    await expect(page.locator('html')).toHaveAttribute('lang', 'en')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Hello,')
    await expect(page.getByRole('link', { name: 'Properties' })).toBeVisible()

    await page.reload()
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Hello,')

    await page.getByRole('radio', { name: 'Français' }).click()
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Bonjour,')
  })

  test('détecte la langue du navigateur (en-US → en)', async ({ browser }) => {
    const context = await browser.newContext({ locale: 'en-US' })
    const page = await context.newPage()
    await page.goto('/')
    await expect(page.locator('html')).toHaveAttribute('lang', 'en')
    await expect(page.getByRole('link', { name: 'Dashboard' })).toBeVisible()
    await context.close()
  })

  test('retombe sur le français pour une langue non supportée', async ({ browser }) => {
    const context = await browser.newContext({ locale: 'de-DE' })
    const page = await context.newPage()
    await page.goto('/')
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Bonjour,')
    await context.close()
  })
})
