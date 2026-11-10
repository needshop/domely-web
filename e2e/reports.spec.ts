import { readFile } from 'node:fs/promises'
import { expect, test } from '@playwright/test'

const card = (page: import('@playwright/test').Page, title: string) =>
  page
    .getByText(title, { exact: true })
    .locator('xpath=ancestor::*[contains(concat(" ",@class," ")," card ")][1]')

test.describe('Rapports', () => {
  test('affiche indicateurs, graphique, performance, impayés et dépenses', async ({ page }) => {
    await page.goto('/reports')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Rapports')
    for (const label of ['Loyers encaissés', 'Taux de recouvrement', 'Résultat net']) {
      await expect(page.getByText(label, { exact: true }).first()).toBeVisible()
    }
    // Un bien par ligne + total
    const performance = card(page, 'Performance par bien')
    await expect(performance.locator('tbody tr')).toHaveCount(11)
    await expect(performance.locator('tfoot')).toContainText('Total')

    await expect(card(page, 'Principaux débiteurs').getByText('Kwame Kouassi')).toBeVisible()
    await expect(card(page, 'Dépenses par catégorie').getByText('Peinture')).toBeVisible()
    await expect(card(page, 'Impayés par ancienneté').getByText('Plus de 90 jours')).toBeVisible()
  })

  test('changer de période et filtrer par bien (dans l’URL)', async ({ page }) => {
    const lastYear = new Date().getFullYear() - 1
    await page.goto('/reports')
    await page.getByRole('button', { name: /Période/ }).click()
    await page.getByRole('option', { name: String(lastYear) }).click()
    await expect(page).toHaveURL(new RegExp(`period=${lastYear}`))
    await expect(page.getByText(`Du 1 janv. ${lastYear} au 31 déc. ${lastYear}`)).toBeVisible()

    await page.goto('/reports?property=p1')
    const performance = card(page, 'Performance par bien')
    await expect(performance.locator('tbody tr')).toHaveCount(1)
    await expect(performance).toContainText('Résidence Les Oliviers')
    await expect(card(page, 'Principaux débiteurs').locator('li')).toHaveCount(1)
  })

  test('export CSV de la performance par bien', async ({ page }) => {
    await page.goto('/reports')
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      card(page, 'Performance par bien').getByRole('button', { name: 'Exporter (CSV)' }).click(),
    ])
    expect(download.suggestedFilename()).toBe('domely-performance-12m.csv')
    const content = await readFile((await download.path())!, 'utf8')
    const lines = content.replace(/^﻿/, '').split('\r\n')
    expect(lines[0]).toContain('Bien;Ville;Occupation;Attendu (XOF)')
    expect(lines).toHaveLength(12)
    expect(content).toContain('Résidence Les Oliviers;Dakar')
  })

  test('export CSV des encaissements mensuels', async ({ page }) => {
    await page.goto('/reports')
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: 'Exporter les encaissements mensuels (CSV)' }).click(),
    ])
    const content = await readFile((await download.path())!, 'utf8')
    // En-tête + 12 mois
    expect(content.replace(/^﻿/, '').split('\r\n')).toHaveLength(13)
  })

  test('sans débordement horizontal sur mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/reports')
    await expect(page.getByText('Performance par bien')).toBeVisible()
    const { scrollWidth, clientWidth } = await page
      .locator('html')
      .evaluate((el) => ({ scrollWidth: el.scrollWidth, clientWidth: el.clientWidth }))
    expect(scrollWidth).toBe(clientWidth)
  })
})
