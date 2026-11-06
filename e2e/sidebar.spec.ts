import { expect, test } from '@playwright/test'

test.describe('Sidebar', () => {
  test('affiche la version de l’application', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText(/^Domely v\d+\.\d+\.\d+$/)).toBeVisible()
  })

  test('se réduit aux icônes, affiche un tooltip et mémorise l’état', async ({ page }) => {
    await page.goto('/')
    const nav = page.getByRole('navigation', { name: 'Navigation principale' })
    const sidebar = page.locator('aside')

    await page.getByRole('button', { name: 'Réduire la barre latérale' }).click()
    await expect(sidebar).toHaveAttribute('data-collapsed', 'true')
    await expect(nav.getByText('Biens')).toHaveCount(0)

    // Le lien reste accessible par son nom et affiche un tooltip au survol
    await nav.getByRole('link', { name: 'Biens' }).hover()
    await expect(page.getByRole('tooltip')).toHaveText('Biens')

    // Navigation client toujours fonctionnelle en mode réduit
    await nav.getByRole('link', { name: 'Biens' }).click()
    await expect(page).toHaveURL('/properties')
    await expect(nav.getByRole('link', { name: 'Biens' })).toHaveAttribute('aria-current', 'page')

    await page.reload()
    await expect(sidebar).toHaveAttribute('data-collapsed', 'true')

    await page.getByRole('button', { name: 'Déplier la barre latérale' }).click()
    await expect(sidebar).toHaveAttribute('data-collapsed', 'false')
    await expect(nav.getByText('Biens')).toBeVisible()
  })
})
