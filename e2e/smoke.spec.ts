import { expect, test } from '@playwright/test'

test.describe('Socle applicatif', () => {
  test('affiche le tableau de bord', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle('Domely')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Bonjour,')
    await expect(page.getByRole('link', { name: 'Tableau de bord' })).toHaveAttribute(
      'aria-current',
      'page',
    )
  })

  test('navigue vers un module via la sidebar', async ({ page }) => {
    await page.goto('/')
    await page
      .getByRole('navigation', { name: 'Navigation principale' })
      .getByRole('link', { name: 'Biens' })
      .click()
    await expect(page).toHaveURL('/properties')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Biens')
  })

  test('affiche la page 404 sur une route inconnue', async ({ page }) => {
    await page.goto('/route-inexistante')
    await expect(page.getByRole('heading', { name: 'Page introuvable' })).toBeVisible()
  })

  test('expose un manifeste PWA', async ({ request }) => {
    const res = await request.get('/manifest.webmanifest')
    expect(res.ok()).toBeTruthy()
    const manifest = await res.json()
    expect(manifest.name).toBe('Domely')
    expect(manifest.icons.some((i: { purpose: string }) => i.purpose === 'maskable')).toBe(true)
  })
})
