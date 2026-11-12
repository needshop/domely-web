import { expect, type Page, test } from '@playwright/test'

const fill = (scope: Page | ReturnType<Page['locator']>, label: string, value: string) =>
  scope.getByLabel(label, { exact: true }).fill(value)

const nav = (page: Page) => page.getByRole('navigation', { name: 'Navigation principale' })

test.describe('Bailleurs — compte propriétaire', () => {
  // Session par défaut : compte de démonstration propriétaire
  test('module réservé aux comptes professionnels', async ({ page }) => {
    await page.goto('/')
    await expect(nav(page).getByRole('link', { name: 'Biens' })).toBeVisible()
    await expect(nav(page).getByRole('link', { name: 'Bailleurs' })).toHaveCount(0)

    await page.goto('/landlords')
    await expect(page).toHaveURL('/')

    // Pas de bailleur dans le formulaire ni sur la fiche d'un bien
    await page.goto('/properties/new')
    await expect(page.getByRole('combobox', { name: 'Bailleur' })).toHaveCount(0)
  })
})

test.describe('Bailleurs — compte agence', () => {
  test.use({ storageState: 'e2e/fixtures/agency-auth-state.json' })

  test('liste, recherche et fiche d’un bailleur', async ({ page }) => {
    await page.goto('/')
    await nav(page).getByRole('link', { name: 'Bailleurs' }).click()
    await expect(page).toHaveURL('/landlords')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Bailleurs')
    await expect(page.getByText('6 bailleurs')).toBeVisible()

    await page.getByRole('searchbox', { name: 'Rechercher un bailleur' }).fill('palmiers')
    await expect(page.getByText('1 bailleur', { exact: true })).toBeVisible()
    await expect(page).toHaveURL(/q=palmiers/)

    await page.getByRole('link', { name: 'SCI Les Palmiers' }).click()
    await expect(page).toHaveURL('/landlords/l2')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('SCI Les Palmiers')
    await expect(page.getByRole('link', { name: /Immeuble Bellevue/ })).toBeVisible()
    await expect(page.getByRole('link', { name: /Résidence Baobab/ })).toBeVisible()
    await expect(page.getByText('Mariama Bâ')).toBeVisible()

    // Depuis le bien, retour vers son bailleur
    await page.getByRole('link', { name: /Immeuble Bellevue/ }).click()
    await expect(page).toHaveURL('/properties/p3')
    await page.getByRole('tab', { name: 'Informations' }).click()
    await page.getByRole('link', { name: 'SCI Les Palmiers' }).click()
    await expect(page).toHaveURL('/landlords/l2')
  })

  test('crée un bailleur puis un bien qui lui est rattaché', async ({ page }) => {
    await page.goto('/landlords/new')
    await page.getByRole('button', { name: 'Ajouter le bailleur' }).click()
    await expect(page.getByText('Le formulaire contient des erreurs')).toBeVisible()
    // Nom, téléphone et e-mail obligatoires
    await expect(page.getByText('Ce champ est obligatoire.')).toHaveCount(3)

    await page.getByRole('radio', { name: 'Société' }).click()
    await fill(page, 'Raison sociale', 'SCI Horizon')
    await fill(page, 'Interlocuteur', 'Awa Sarr')
    // Numéro déjà utilisé par un autre bailleur
    await fill(page, 'Téléphone', '+221 77 410 22 18')
    await page.getByRole('button', { name: 'Ajouter le bailleur' }).click()
    await expect(page.getByText('Ce numéro est déjà celui de Abdou Karim Ndiaye.')).toBeVisible()
    await fill(page, 'Téléphone', '+221 78 000 11 22')
    await fill(page, 'E-mail', 'horizon')
    await page.getByRole('button', { name: 'Ajouter le bailleur' }).click()
    await expect(page.getByText('Adresse e-mail invalide.')).toBeVisible()
    await fill(page, 'E-mail', 'contact@sci-horizon.example.com')
    await fill(page, 'Honoraires de gestion (%)', '7,5')
    await page.getByRole('button', { name: 'Ajouter le bailleur' }).click()

    await expect(page).toHaveURL(/\/landlords\/l-/)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('SCI Horizon')
    await expect(page.getByText('Aucun bien n’est encore rattaché à ce bailleur.')).toBeVisible()

    // « Ajouter un bien » : bailleur pré-sélectionné
    await page.getByRole('link', { name: 'Ajouter un bien' }).click()
    await expect(page).toHaveURL(/\/properties\/new\?landlord=l-/)
    await expect(page.getByRole('combobox', { name: 'Bailleur' })).toHaveValue('SCI Horizon')
    await fill(page, 'Nom du bien', 'Résidence Horizon')
    await fill(page, 'Rue / voie', 'Rue 12')
    await fill(page, 'Ville', 'Dakar')
    const lot = page.getByRole('listitem', { name: 'Lot 1' })
    await fill(lot, 'Surface (m²)', '60')
    await fill(lot, 'Loyer mensuel', '300000')
    await page.getByRole('button', { name: 'Créer le bien' }).click()
    await expect(page).toHaveURL(/\/properties\/p-/)

    await page.getByRole('tab', { name: 'Informations' }).click()
    await page.getByRole('link', { name: 'SCI Horizon' }).click()
    await expect(page.getByRole('link', { name: /Résidence Horizon/ })).toBeVisible()
  })

  test('choisit le bailleur d’un bien dans la liste déroulante', async ({ page }) => {
    await page.goto('/properties/p2/edit')
    const field = page.getByRole('combobox', { name: 'Bailleur' })
    await expect(field).toHaveValue('')
    // Saisie pour filtrer, puis choix au clavier (le clic sur l'option est instable pendant
    // l'animation d'ouverture de la liste)
    await field.fill('Keï')
    await expect(page.getByRole('option', { name: 'Fatoumata Keïta' })).toBeVisible()
    await field.press('ArrowDown')
    await field.press('Enter')
    await expect(field).toHaveValue('Fatoumata Keïta')
    await page.getByRole('button', { name: 'Enregistrer' }).click()
    await expect(page).toHaveURL('/properties/p2')

    await page.getByRole('tab', { name: 'Informations' }).click()
    await page.getByRole('link', { name: 'Fatoumata Keïta' }).click()
    await expect(page).toHaveURL('/landlords/l4')
    await expect(page.getByRole('link', { name: /Villa Harmonie/ })).toBeVisible()
  })
})
