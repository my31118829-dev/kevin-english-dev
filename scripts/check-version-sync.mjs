import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const pkgPath = path.join(root, 'package.json')
const mainPath = path.join(root, 'src', 'main.jsx')
const serverPath = path.join(root, 'server.mjs')

const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))
const main = fs.readFileSync(mainPath, 'utf8')
const server = fs.readFileSync(serverPath, 'utf8')

const appVersionMatch = main.match(/const APP_VERSION = '([^']+)'/)
if (!appVersionMatch) {
  console.error('Version check failed: APP_VERSION not found in src/main.jsx')
  process.exit(1)
}

const appVersion = appVersionMatch[1]
const packageVersion = String(pkg.version || '')
const serverVersionMatch = server.match(/V(\d+\.\d+\.\d+)/)
const serverVersion = serverVersionMatch?.[1] || ''

if (appVersion !== packageVersion) {
  console.error(`Version check failed: APP_VERSION (${appVersion}) !== package.json version (${packageVersion})`)
  process.exit(1)
}

if (serverVersion && serverVersion !== packageVersion) {
  console.error(`Version check failed: server banner (${serverVersion}) !== package.json version (${packageVersion})`)
  process.exit(1)
}

console.log(`Version check passed: ${packageVersion}`)
