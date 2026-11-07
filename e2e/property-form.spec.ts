import { expect, type Page, test } from '@playwright/test'

/** Remplit un champ par son libellé (dans un conteneur optionnel). */
const fill = (scope: Page | ReturnType<Page['locator']>, label: string, value: string) =>
  scope.getByLabel(label, { exact: true }).fill(value)

test.describe('Formulaire de bien — création', () => {
  test('le bouton « Ajouter un bien » ouvre le formulaire', async ({ page }) => {
    await page.goto('/properties')
    await page.getByRole('link', { name: 'Ajouter un bien' }).click()
    await expect(page).toHaveURL('/properties/new')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Ajouter un bien')
  })

  test('affiche les erreurs de validation', async ({ page }) => {
    await page.goto('/properties/new')
    await page.getByRole('button', { name: 'Créer le bien' }).click()
    await expect(page.getByText('Le formulaire contient des erreurs')).toBeVisible()
    // nom, rue, ville, surface, loyer
    await expect(page.getByText('Ce champ est obligatoire.')).toHaveCount(5)
    // Le focus va sur le premier champ en erreur
    await expect(page.getByLabel('Nom du bien')).toBeFocused()
  })

  test('crée un bien avec deux lots puis affiche sa fiche', async ({ page }) => {
    await page.goto('/properties/new')
    await fill(page, 'Nom du bien', 'Résidence Test')
    await fill(page, 'Rue / voie', 'Rue 10')
    await fill(page, 'Quartier', 'Point E')
    await fill(page, 'Ville', 'Dakar')

    const lot1 = page.getByRole('listitem', { name: 'Lot 1' })
    await fill(lot1, 'Surface (m²)', '50')
    await fill(lot1, 'Loyer mensuel', '200000')

    await page.getByRole('button', { name: 'Ajouter un lot' }).click()
    const lot2 = page.getByRole('listitem', { name: 'Lot 2' })
    await fill(lot2, 'Surface (m²)', '65')
    await fill(lot2, 'Loyer mensuel', '250000')

    await page.getByRole('button', { name: 'Créer le bien' }).click()

    await expect(page).toHaveURL(/\/properties\/p-/)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Résidence Test')
    await expect(page.getByText('Bien créé')).toBeVisible()
    await expect(page.getByRole('tab', { name: /Lots/ })).toContainText('2')

    // Le bien apparaît dans la liste
    await page.getByRole('link', { name: 'Biens' }).first().click()
    await expect(page.getByRole('link', { name: /Résidence Test/ })).toBeVisible()
  })

  test('libellés de lots en double refusés', async ({ page }) => {
    await page.goto('/properties/new')
    await page.getByRole('button', { name: 'Ajouter un lot' }).click()
    const lot2 = page.getByRole('listitem', { name: 'Lot 2' })
    await fill(lot2, 'Libellé du lot', 'Lot 1')
    await page.getByRole('button', { name: 'Créer le bien' }).click()
    await expect(page.getByText('Ce libellé est déjà utilisé par un autre lot.')).toBeVisible()
  })
})

test.describe('Formulaire de bien — modification', () => {
  test('modifie le nom depuis la fiche', async ({ page }) => {
    await page.goto('/properties/p4')
    await page.getByRole('link', { name: 'Modifier' }).click()
    await expect(page).toHaveURL('/properties/p4/edit')
    await expect(page.getByLabel('Nom du bien')).toHaveValue('Résidence Baobab')

    await fill(page, 'Nom du bien', 'Résidence Baobab II')
    await page.getByRole('button', { name: 'Enregistrer' }).click()

    await expect(page).toHaveURL('/properties/p4')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Résidence Baobab II')
    await expect(page.getByText('Modifications enregistrées')).toBeVisible()
  })

  test('un lot loué ne peut pas être supprimé', async ({ page }) => {
    await page.goto('/properties/p4/edit')
    const lot1 = page.getByRole('listitem', { name: 'Studio 1' })
    await expect(lot1.getByText(/Loué à/)).toBeVisible()
    await expect(lot1.getByRole('button', { name: /Supprimer le lot/ })).toBeDisabled()
  })

  test('demande confirmation avant de quitter avec des modifications', async ({ page }) => {
    await page.goto('/properties/p4/edit')
    await fill(page, 'Nom du bien', 'Brouillon')
    await page.getByRole('button', { name: 'Annuler' }).click()

    const dialog = page.getByRole('dialog')
    await expect(dialog.getByText('Quitter sans enregistrer ?')).toBeVisible()
    await dialog.getByRole('button', { name: 'Continuer l’édition' }).click()
    await expect(page).toHaveURL('/properties/p4/edit')

    await page.getByRole('button', { name: 'Annuler' }).click()
    await page.getByRole('dialog').getByRole('button', { name: 'Quitter' }).click()
    await expect(page).toHaveURL('/properties/p4')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Résidence Baobab')
  })

  test('appartement : un seul lot', async ({ page }) => {
    await page.goto('/properties/p11/edit')
    await expect(page.getByRole('button', { name: 'Ajouter un lot' })).toHaveCount(0)
    await expect(page.getByText('Un bien de ce type est loué en un seul lot.')).toBeVisible()
  })
})
