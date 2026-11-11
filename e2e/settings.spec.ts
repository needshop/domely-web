import { expect, type Page, test } from '@playwright/test'

const save = (page: Page) => page.getByRole('button', { name: 'Enregistrer' }).click()

test.describe('Paramètres', () => {
  test('onglets dans l’URL', async ({ page }) => {
    await page.goto('/settings')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Paramètres')
    await page.getByRole('tab', { name: 'Location' }).click()
    await expect(page).toHaveURL(/tab=rentals/)
    await page.reload()
    await expect(page.getByRole('tab', { name: 'Location' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
  })

  test('le nom du profil personnalise le tableau de bord et survit au rechargement', async ({
    page,
  }) => {
    await page.goto('/settings')
    await page.getByLabel('Nom complet').fill('Fatou Ndiaye')
    await save(page)
    await expect(page.getByText('Paramètres enregistrés')).toBeVisible()

    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Bonjour Fatou,')
    await page.reload()
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Bonjour Fatou,')
  })

  test('organisation et modèle personnalisé utilisés dans les relances', async ({ page }) => {
    await page.goto('/settings?tab=organization')
    await page.getByLabel('Nom affiché').fill('Gestion Teranga')
    await save(page)
    await expect(page.getByText('Paramètres enregistrés')).toBeVisible()

    await page.getByRole('tab', { name: 'Messages' }).click()
    await page.getByLabel('Modèle').fill('Bonjour {{name}}, merci de régler {{amount}}.')
    await expect(page.getByText('Bonjour Awa Diallo, merci de régler')).toBeVisible()
    await save(page)

    await page.goto('/rents?view=unpaid&q=kwame')
    await page.getByRole('button', { name: 'Relancer Kwame Kouassi' }).first().click()
    const message = page.getByRole('dialog').getByLabel('Message')
    await expect(message).toHaveValue(
      /^Bonjour Kwame Kouassi, merci de régler 383\s000\sF\sCFA\.\nGestion Teranga$/,
    )
  })

  test('rétablir le modèle par défaut', async ({ page }) => {
    await page.goto('/settings?tab=messages')
    const template = page.getByLabel('Modèle')
    await template.fill('Texte libre')
    await page.getByRole('button', { name: 'Rétablir le modèle par défaut' }).click()
    await expect(template).toHaveValue(/^Bonjour \{\{name\}\},/)
  })

  test('le taux GNF modifié change la conversion des montants', async ({ page }) => {
    await page.goto('/settings?tab=preferences')
    await page.getByLabel('Franc guinéen (pour 1 F CFA)').fill('20')
    await page.getByRole('button', { name: 'Enregistrer' }).click()
    await expect(page.getByText('Paramètres enregistrés')).toBeVisible()

    // Contrat fictif à montant fixe : 756 000 F CFA × 20 = 15 120 000 GNF
    await page.goto('/contracts/l903')
    await page.getByRole('button', { name: /Devise/ }).click()
    await page.getByRole('option', { name: /GNF/ }).click()
    await expect(page.getByText('15,12 M GNF').first()).toBeVisible()
  })

  test('les valeurs par défaut des contrats pré-remplissent un nouveau bail', async ({ page }) => {
    await page.goto('/settings?tab=rentals')
    await page.getByLabel('Jour d’échéance').fill('10')
    await page.getByLabel('Dépôt de garantie — habitation').fill('3')
    await page.getByRole('button', { name: /Durée du bail/ }).click()
    await page.getByRole('option', { name: '24 mois' }).click()
    await save(page)
    await expect(page.getByText('Paramètres enregistrés')).toBeVisible()

    // Apt 18 de Bellevue : loyer 335 000 → dépôt 3 mois = 1 005 000
    await page.goto('/contracts/new?property=p3&unit=apt-18')
    await expect(page.getByLabel('Jour d’échéance')).toHaveValue('10')
    await expect(page.getByLabel('Dépôt de garantie')).toHaveValue(/^1\s005\s000\sF\sCFA$/)
    await expect(page.getByText('24 mois')).toBeVisible()
  })

  test('réinitialiser les paramètres après confirmation', async ({ page }) => {
    await page.goto('/settings')
    await page.getByLabel('Nom complet').fill('Fatou Ndiaye')
    await save(page)
    await expect(page.getByText('Paramètres enregistrés')).toBeVisible()

    await page.getByRole('tab', { name: 'Préférences' }).click()
    await page.getByRole('button', { name: 'Réinitialiser les paramètres' }).click()
    await page.getByRole('dialog').getByRole('button', { name: 'Réinitialiser' }).click()
    await expect(page.getByText('Paramètres réinitialisés')).toBeVisible()

    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Bonjour,')
  })

  test('sans débordement horizontal sur mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    for (const tab of ['profile', 'organization', 'preferences', 'rentals', 'messages']) {
      await page.goto(`/settings?tab=${tab}`)
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
      const { scrollWidth, clientWidth } = await page
        .locator('html')
        .evaluate((el) => ({ scrollWidth: el.scrollWidth, clientWidth: el.clientWidth }))
      expect(scrollWidth, tab).toBe(clientWidth)
    }
  })
})
