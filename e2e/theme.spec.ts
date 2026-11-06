import { expect, test } from '@playwright/test'

test.describe('Thème clair / sombre', () => {
  test('bascule en sombre puis en clair et persiste le choix', async ({ page }) => {
    await page.goto('/')
    const html = page.locator('html')

    await page.getByRole('radio', { name: 'Thème sombre' }).click()
    await expect(html).toHaveAttribute('data-theme', 'dark')
    await expect(html).toHaveClass(/\bdark\b/)

    await page.reload()
    await expect(html).toHaveAttribute('data-theme', 'dark')

    await page.getByRole('radio', { name: 'Thème clair' }).click()
    await expect(html).toHaveAttribute('data-theme', 'light')
    await expect(html).not.toHaveClass(/\bdark\b/)
  })

  test('suit la préférence système par défaut', async ({ browser }) => {
    const context = await browser.newContext({ colorScheme: 'dark' })
    const page = await context.newPage()
    await page.goto('/')
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
    await expect(page.getByRole('radio', { name: 'Thème du système' })).toBeChecked()
    await context.close()
  })
})
