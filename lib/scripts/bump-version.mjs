#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'fs'
import { execSync } from 'child_process'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

const releaseType = process.argv[2]
if (!['patch', 'minor', 'major'].includes(releaseType)) {
  console.error('Usage: node scripts/bump-version.mjs <patch|minor|major>')
  process.exit(1)
}

const pkgPath = resolve(root, 'package.json')
const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'))
const [major, minor, patch] = pkg.version.split('.').map(Number)

const next = {
  patch: `${major}.${minor}.${patch + 1}`,
  minor: `${major}.${minor + 1}.0`,
  major: `${major + 1}.0.0`,
}[releaseType]

const prev = pkg.version
pkg.version = next
writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n')
console.log(`Version bumped: ${prev} → ${next}`)

const changelogPath = resolve(root, 'CHANGELOG.md')
const today = new Date().toISOString().slice(0, 10)
const existing = readFileSync(changelogPath, 'utf8')
const lines = existing.split('\n')
const headerEnd = lines.findIndex((l, i) => i > 0 && l.startsWith('##'))
const header = lines.slice(0, headerEnd).join('\n')
const rest = lines.slice(headerEnd).join('\n')
const entry = `## [${next}] (${today})\n- <!-- describe changes here -->\n\n`
writeFileSync(changelogPath, `${header}\n${entry}${rest}`)
console.log(`CHANGELOG.md updated with entry for [${next}]`)

execSync('git add package.json CHANGELOG.md', { cwd: root, stdio: 'inherit' })
execSync(`git commit -m "chore: release v${next}"`, { cwd: root, stdio: 'inherit' })
execSync(`git tag v${next}`, { cwd: root, stdio: 'inherit' })
execSync('git pull --rebase origin main', { cwd: root, stdio: 'inherit' })
execSync('git push --follow-tags', { cwd: root, stdio: 'inherit' })
console.log(`Tagged and pushed v${next}`)
