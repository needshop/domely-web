/**
 * Serveur des tests e2e (webServer de playwright.config.ts).
 *
 * Rebuilde l'application seulement si les sources ont changé depuis le dernier build, puis
 * sert `dist/` avec `vite preview`. L'empreinte des sources (chemins, tailles et dates de
 * modification) est enregistrée dans `dist/.e2e-build-hash` : un fichier modifié, ajouté ou
 * supprimé déclenche un nouveau build.
 *
 * Forcer le build : E2E_BUILD=always npx playwright test
 * Les messages passent par stderr : Playwright n'affiche que celle-ci pour le webServer.
 */
import { spawn, spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const port = process.env.E2E_PORT ?? '4173'
const hashFile = join(root, 'dist', '.e2e-build-hash')

/** Fichiers et dossiers qui influencent le build. */
const inputs = [
  'src',
  'public',
  'index.html',
  'package.json',
  'package-lock.json',
  'vite.config.ts',
  'tsconfig.json',
  'tsconfig.app.json',
  'tsconfig.node.json',
]

function* files(path) {
  if (!existsSync(path)) return
  const stat = statSync(path)
  if (stat.isDirectory()) {
    for (const entry of readdirSync(path).sort()) {
      if (entry === '.DS_Store') continue
      yield* files(join(path, entry))
    }
  } else {
    yield { path, stat }
  }
}

function sourcesHash() {
  const hash = createHash('sha256')
  for (const input of inputs) {
    for (const { path, stat } of files(join(root, input))) {
      hash.update(`${relative(root, path)}:${stat.size}:${stat.mtimeMs}\n`)
    }
  }
  return hash.digest('hex')
}

const current = sourcesHash()
const previous = existsSync(hashFile) ? readFileSync(hashFile, 'utf8').trim() : null
const force = process.env.E2E_BUILD === 'always'

if (force || current !== previous || !existsSync(join(root, 'dist', 'index.html'))) {
  console.error(force ? '[e2e] Build forcé (E2E_BUILD=always)' : '[e2e] Sources modifiées : build')
  const build = spawnSync('npm', ['run', 'build'], { cwd: root, stdio: 'inherit' })
  if (build.status !== 0) process.exit(build.status ?? 1)
  writeFileSync(hashFile, `${current}\n`)
} else {
  console.error('[e2e] Sources inchangées depuis le dernier build : build ignoré')
}

// Serveur de preview ; arrêté par Playwright à la fin des tests
const preview = spawn('npx', ['vite', 'preview', '--port', port, '--strictPort'], {
  cwd: root,
  stdio: 'inherit',
})
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => preview.kill(signal))
}
preview.on('exit', (code) => process.exit(code ?? 0))
