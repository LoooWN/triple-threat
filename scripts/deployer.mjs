// Publie dist/ sur la branche gh-pages (servie par GitHub Pages). Lancer avec : npm run deployer
import { execSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'

const depot = execSync('git remote get-url origin').toString().trim()
const dans = (commande) => execSync(commande, { cwd: 'dist', stdio: 'inherit' })

writeFileSync('dist/.nojekyll', '') // GitHub sert les fichiers tels quels
dans('git init -q -b gh-pages')
dans('git add -A')
dans(`git commit -q -m "Mise en ligne ${new Date().toISOString()}"`)
dans(`git push -q -f ${depot} gh-pages`)
console.log('En ligne dans 1 à 2 minutes : https://loooown.github.io/triple-threat/')
