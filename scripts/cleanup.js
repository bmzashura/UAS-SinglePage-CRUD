const fs = require('fs')
const path = require('path')

const projectRoot = path.resolve(__dirname, '..')
const targets = [
  path.join(projectRoot, 'server.js'),
  path.join(projectRoot, 'sessions.json'),
  path.join(projectRoot, 'admins.json'),
  path.join(projectRoot, 'src', 'auth.js'),
  path.join(projectRoot, 'src', 'services', 'auth.js'),
  path.join(projectRoot, 'src', 'components', 'Footer.js'),
  path.join(projectRoot, 'src', 'components', 'CardItem.js'),
  path.join(projectRoot, 'src', 'components', 'Navbar.js'),
  path.join(projectRoot, 'src', 'components', 'Login.js'),
  path.join(projectRoot, 'src', 'components', 'Login.vue'),
  path.join(projectRoot, 'src', 'components', 'FormInput.js'),
  path.join(projectRoot, 'archive')
]

console.log('Cleanup script started. Will remove the following targets (if they exist):')
targets.forEach(t => console.log(' -', path.relative(projectRoot, t)))

for (const t of targets) {
  try {
    if (fs.existsSync(t)) {
      const stat = fs.statSync(t)
      if (stat.isDirectory()) {
        fs.rmSync(t, { recursive: true, force: true })
        console.log('Removed directory:', path.relative(projectRoot, t))
      } else {
        fs.unlinkSync(t)
        console.log('Removed file:', path.relative(projectRoot, t))
      }
    } else {
      console.log('Not found (skipping):', path.relative(projectRoot, t))
    }
  } catch (err) {
    console.error('Failed to remove', path.relative(projectRoot, t), '-', err.message)
  }
}

// Minor housekeeping: if root sessions.json existed and was used earlier, ensure server/sessions.json exists
const serverSessions = path.join(projectRoot, 'server', 'sessions.json')
if (!fs.existsSync(serverSessions)) {
  try {
    fs.writeFileSync(serverSessions, '[]', 'utf8')
    console.log('Created empty', path.relative(projectRoot, serverSessions))
  } catch (err) {
    console.error('Failed to create server sessions file:', err.message)
  }
}

console.log('Cleanup finished.')
