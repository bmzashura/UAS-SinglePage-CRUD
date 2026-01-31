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

const MOCKAPI_BASE = 'https://697b85bd0e6ff62c3c5c53d4.mockapi.io'
const SESSIONS_FILE = path.join(__dirname, 'sessions.json')
let SESSIONS = new Map() // token -> { username, expires }
const SESSION_TTL = 1000 * 60 * 60 // 1 hour

// Helpers to manage admin on MockAPI
async function findAdminByUsername(username) {
  const res = await fetch(`${MOCKAPI_BASE}/admin?username=${encodeURIComponent(username)}`)
  if (!res.ok) throw new Error('Gagal terhubung ke admin service')
  const data = await res.json()
  return (data && data.length) ? data[0] : null
}

async function createAdminOnMock(username, hashedPassword) {
  const res = await fetch(`${MOCKAPI_BASE}/admin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password: hashedPassword })
  })
  if (!res.ok) throw new Error('Gagal membuat admin di MockAPI')
  return await res.json()
}

// Session persistence helpers
async function loadSessionsFromFile() {
  try {
    const raw = await fs.readFile(SESSIONS_FILE, 'utf8')
    const arr = JSON.parse(raw || '[]')
    let count = 0
    arr.forEach(s => {
      if (s && s.token && s.expires && s.expires > Date.now()) {
        SESSIONS.set(s.token, { username: s.username, expires: s.expires })
        count++
      }
    })
    return count
  } catch (err) {
    return 0
  }
}

async function persistSessionsToFile() {
  try {
    const arr = Array.from(SESSIONS.entries()).map(([token, v]) => ({ token, username: v.username, expires: v.expires }))
    await fs.writeFile(SESSIONS_FILE, JSON.stringify(arr, null, 2), 'utf8')
  } catch (err) {
    console.warn('Failed to persist sessions:', err.message)
  }
}

function setSession(token, data) {
  SESSIONS.set(token, data)
  persistSessionsToFile().catch(() => {})
}

function deleteSession(token) {
  if (SESSIONS.delete(token)) persistSessionsToFile().catch(() => {})
}

function cleanupExpiredSessions() {
  const now = Date.now()
  let changed = false
  for (const [token, v] of SESSIONS.entries()) {
    if (v.expires < now) {
      SESSIONS.delete(token)
      changed = true
    }
  }
  if (changed) persistSessionsToFile().catch(() => {})
}

// periodic cleanup every 10 minutes
setInterval(cleanupExpiredSessions, 1000 * 60 * 10)

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

// Ensure default admin exists on MockAPI (creates username 'bemis' with password 'L1nux3r' if missing)
async function ensureDefaultAdmin() {
  try {
    const username = 'bemis'
    const password = 'L1nux3r'
    const existing = await findAdminByUsername(username)
    if (!existing) {
      const hashed = await bcrypt.hash(password, 10)
      await createAdminOnMock(username, hashed)
      console.log('Default admin created on MockAPI:', username)
    } else {
      console.log('Admin already exists on MockAPI:', username)
    }
  } catch (err) {
    console.warn('Error ensuring default admin on MockAPI:', err.message)
  }
}

// Auth endpoints (server-side verification + token issuance)
app.post('/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body || {}
    if (!username || !password) return res.status(400).json({ ok: false, message: 'Username & password required' })
    const user = await findAdminByUsername(username)
    if (!user) return res.status(401).json({ ok: false, message: 'User not found' })
    const match = await bcrypt.compare(password, user.password)
    if (!match) return res.status(401).json({ ok: false, message: 'Invalid credentials' })
    const token = uuidv4()
    const expires = Date.now() + SESSION_TTL
    setSession(token, { username, expires })
    return res.json({ ok: true, username, token })
  } catch (err) {
    return res.status(500).json({ ok: false, message: err.message })
  }
})

app.post('/auth/logout', (req, res) => {
  const token = req.header('x-admin-token')
  if (token) deleteSession(token)
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

// Serve static files from `dist` if available (production build), otherwise serve project root
const fsSync = require('fs')
const distPath = path.join(__dirname, 'dist')
if (fsSync.existsSync(distPath)) {
  app.use(express.static(distPath))
  app.get('*', (req, res) => res.sendFile(path.join(distPath, 'index.html')))
} else {
  app.use(express.static(path.join(__dirname, '.')))
  app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'index.html')))
}

app.listen(PORT, async () => {
  console.log(`Server running at http://localhost:${PORT}`)
  const loaded = await loadSessionsFromFile()
  console.log(`Loaded ${loaded} sessions from ${SESSIONS_FILE}`)
  cleanupExpiredSessions()
  // ensure default admin exists in MockAPI
  await ensureDefaultAdmin()
})