import { expect, test } from '@playwright/test'

test.describe('Formulaire locataire — création', () => {
  test('le bouton « Ajouter un locataire » ouvre le formulaire', async ({ page }) => {
    await page.goto('/tenants')
    await page.getByRole('link', { name: 'Ajouter un locataire' }).click()
    await expect(page).toHaveURL('/tenants/new')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Ajouter un locataire')
  })

  test('affiche les erreurs de validation', async ({ page }) => {
    await page.goto('/tenants/new')
    await page.getByRole('button', { name: 'Créer le locataire' }).click()
    await expect(page.getByText('Le formulaire contient des erreurs')).toBeVisible()
    await expect(page.getByText('Ce champ est obligatoire.')).toHaveCount(2)
    await expect(page.getByLabel('Nom complet')).toBeFocused()

    await page.getByLabel('Téléphone', { exact: true }).first().fill('12')
    await page.getByLabel('E-mail').fill('pas-un-email')
    await page.getByRole('button', { name: 'Créer le locataire' }).click()
    await expect(page.getByText('Numéro de téléphone invalide')).toBeVisible()
    await expect(page.getByText('Adresse e-mail invalide.')).toBeVisible()
  })

  test('refuse un numéro déjà utilisé par un autre locataire', async ({ page }) => {
    await page.goto('/tenants/new')
    await page.getByLabel('Nom complet').fill('Test Doublon')
    await page.getByLabel('Téléphone', { exact: true }).first().fill('+225 0748129031')
    await page.getByRole('button', { name: 'Créer le locataire' }).click()
    await expect(
      page.getByText('Ce numéro est déjà utilisé par Teranga Digital SAS.'),
    ).toBeVisible()
  })

  test('crée un particulier puis affiche sa fiche', async ({ page }) => {
    await page.goto('/tenants/new')
    await page.getByLabel('Nom complet').fill('Mariama Ba')
    await page.getByLabel('Profession').fill('Avocate')
    await page.getByLabel('Téléphone', { exact: true }).first().fill('+221 77 000 11 22')
    await page.getByLabel('E-mail').fill('mariama.ba@example.com')
    await page.getByLabel('Nom', { exact: true }).fill('Ousmane Ba')
    await page.getByLabel('Téléphone', { exact: true }).last().fill('+221 77 000 33 44')
    await page.getByRole('button', { name: 'Créer le locataire' }).click()

    await expect(page).toHaveURL(/\/tenants\/t-/)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Mariama Ba')
    await expect(page.getByText('Locataire créé')).toBeVisible()
    await expect(page.getByText('Sans bail', { exact: true })).toBeVisible()
    await expect(page.getByText('Ousmane Ba')).toBeVisible()

    // Visible dans la liste
    await page.getByRole('link', { name: 'Locataires' }).first().click()
    await page.getByRole('searchbox').fill('mariama')
    await expect(page.getByRole('link', { name: 'Mariama Ba' })).toBeVisible()
  })

  test('une société propose le RCCM et un interlocuteur, sans personne à prévenir', async ({
    page,
  }) => {
    await page.goto('/tenants/new')
    await page.getByRole('radio', { name: 'Société' }).click()
    await expect(page.getByLabel('Raison sociale')).toBeVisible()
    await expect(page.getByLabel('Interlocuteur')).toBeVisible()
    await expect(page.getByText('Personne à prévenir')).toHaveCount(0)

    await page.getByLabel('Raison sociale').fill('Baobab Conseil SARL')
    await page.getByLabel('Téléphone', { exact: true }).fill('+221 33 800 00 00')
    await page.getByRole('button', { name: /Type de pièce/ }).click()
    await expect(page.getByRole('option')).toHaveText(['RCCM'])
    await page.getByRole('option', { name: 'RCCM' }).click()
    await page.getByLabel('Numéro', { exact: true }).fill('SN-DKR-2024-B-1234')
    await page.getByRole('button', { name: 'Créer le locataire' }).click()

    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Baobab Conseil SARL')
    await expect(page.getByText('SN-DKR-2024-B-1234')).toBeVisible()
  })
})

test.describe('Formulaire locataire — modification', () => {
  test('modifie un locataire et conserve ses baux', async ({ page }) => {
    await page.goto('/tenants/c3')
    await page.getByRole('link', { name: 'Modifier' }).click()
    await expect(page).toHaveURL('/tenants/c3/edit')
    await expect(page.getByLabel('Raison sociale')).toHaveValue('Teranga Digital SAS')

    await page.getByLabel('Interlocuteur').fill('Fatou Sarr')
    await page.getByRole('button', { name: 'Enregistrer' }).click()

    await expect(page).toHaveURL('/tenants/c3')
    await expect(page.getByText('Modifications enregistrées')).toBeVisible()
    await expect(page.getByText('Fatou Sarr')).toBeVisible()
    await expect(page.getByRole('link', { name: 'Horizon Business Center' })).toHaveCount(2)
  })

  test('le nom modifié apparaît sur la fiche du bien', async ({ page }) => {
    await page.goto('/tenants/c2/edit')
    await page.getByLabel('Raison sociale').fill('Atlantique Assurances Vie SA')
    await page.getByRole('button', { name: 'Enregistrer' }).click()
    await expect(page).toHaveURL('/tenants/c2')
    await page.getByRole('link', { name: 'Horizon Business Center' }).click()
    await expect(page.getByRole('link', { name: 'Atlantique Assurances Vie SA' })).toBeVisible()
  })

  test('demande confirmation avant de quitter avec des modifications', async ({ page }) => {
    await page.goto('/tenants/c1/edit')
    await page.getByLabel('Notes').fill('Note non enregistrée')
    await page.getByRole('button', { name: 'Annuler' }).click()
    await expect(page.getByText('Quitter sans enregistrer ?')).toBeVisible()
    await page.getByRole('button', { name: 'Continuer l’édition' }).click()
    await expect(page).toHaveURL('/tenants/c1/edit')
    await page.getByRole('button', { name: 'Annuler' }).click()
    await page.getByRole('button', { name: 'Quitter' }).click()
    await expect(page).toHaveURL('/tenants/c1')
  })

  test('locataire introuvable', async ({ page }) => {
    await page.goto('/tenants/inconnu/edit')
    await expect(page.getByText('Ce locataire est introuvable.')).toBeVisible()
  })
})
