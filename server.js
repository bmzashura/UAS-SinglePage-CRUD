const express = require('express')
const { createProxyMiddleware } = require('http-proxy-middleware')
const path = require('path')
const fs = require('fs').promises
const bcrypt = require('bcryptjs')
const { v4: uuidv4 } = require('uuid')

const app = express()
const PORT = process.env.PORT || 3000

// Parse JSON bodies for auth endpoints
app.use(express.json())

const ADMINS_FILE = path.join(__dirname, 'admins.json')
const SESSIONS = new Map() // token -> { username, expires }
const SESSION_TTL = 1000 * 60 * 60 // 1 hour

async function readAdmins() {
  try {
    const data = await fs.readFile(ADMINS_FILE, 'utf8')
    return JSON.parse(data)
  } catch (err) {
    return []
  }
}
async function writeAdmins(admins) {
  await fs.writeFile(ADMINS_FILE, JSON.stringify(admins, null, 2), 'utf8')
}

// Protect write operations to the Menu endpoint: require admin token and username header
app.use('/api/Menu', (req, res, next) => {
  if (["POST", "PUT", "DELETE"].includes(req.method)) {
    const admin = req.header('x-admin-username')
    const token = req.header('x-admin-token')
    if (!admin || !token) return res.status(403).json({ error: 'Admin authentication required (x-admin-username & x-admin-token headers)' })
    const session = SESSIONS.get(token)
    if (!session || session.username !== admin || session.expires < Date.now()) {
      return res.status(403).json({ error: 'Invalid or expired admin session' })
    }
  }
  next()
})

// Ensure default admin exists in local store (creates username 'bemis' with password 'L1nux3r' if missing)
async function ensureDefaultAdmin() {
  try {
    const username = 'bemis'
    const password = 'L1nux3r'
    const admins = await readAdmins()
    const found = admins.find(a => a.username === username)
    if (!found) {
      const hashed = await bcrypt.hash(password, 10)
      admins.push({ id: Date.now(), username, password: hashed })
      await writeAdmins(admins)
      console.log('Default admin created (local):', username)
    } else {
      console.log('Default admin already exists locally:', username)
    }
  } catch (err) {
    console.warn('Error ensuring default admin:', err.message)
  }
}

// Auth endpoints (server-side verification + token issuance)
app.post('/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body || {}
    if (!username || !password) return res.status(400).json({ ok: false, message: 'Username & password required' })
    const admins = await readAdmins()
    const user = admins.find(a => a.username === username)
    if (!user) return res.status(401).json({ ok: false, message: 'User not found' })
    const match = await bcrypt.compare(password, user.password)
    if (!match) return res.status(401).json({ ok: false, message: 'Invalid credentials' })
    const token = uuidv4()
    const expires = Date.now() + SESSION_TTL
    SESSIONS.set(token, { username, expires })
    return res.json({ ok: true, username, token })
  } catch (err) {
    return res.status(500).json({ ok: false, message: err.message })
  }
})

app.post('/auth/logout', (req, res) => {
  const token = req.header('x-admin-token')
  if (token) SESSIONS.delete(token)
  res.json({ ok: true })
})

// Proxy all /api/* requests to MockAPI to avoid CORS and add simple logging
app.use('/api', createProxyMiddleware({
  target: 'https://697b85bd0e6ff62c3c5c53d4.mockapi.io',
  changeOrigin: true,
  pathRewrite: { '^/api/': '/' },
  onProxyReq(proxyReq, req, res) {
    console.log(`[proxy] ${req.method} ${req.originalUrl} -> ${proxyReq.protocol}//${proxyReq.host}${proxyReq.path}`)
  }
}))

// Serve static files from project root
app.use(express.static(path.join(__dirname, '.')))

// Fallback to index.html for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'))
})

app.listen(PORT, async () => {
  console.log(`Server running at http://localhost:${PORT}`)
  // ensure default admin exists in MockAPI
  await ensureDefaultAdmin()
})