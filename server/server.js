const express = require('express')
const { createProxyMiddleware } = require('http-proxy-middleware')
const path = require('path')
const fsSync = require('fs')

const app = express()
const PORT = process.env.PORT || 3000

// Parse JSON bodies (allow large payloads for image uploads)
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Enable simple CORS for development and cross-origin requests
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept')
  if (req.method === 'OPTIONS') return res.sendStatus(204)
  next()
})

// Menu endpoints with a resilient fallback (try MockAPI, fallback to local file store)
const menuStore = require('./menu-store')
const MOCKAPI_BASE = 'https://697b85bd0e6ff62c3c5c53d4.mockapi.io'

async function tryProxyToMockAPI(method, path, body) {
  try {
    const url = `${MOCKAPI_BASE}${path}`
    const opts = { method }
    if (body) {
      opts.headers = { 'Content-Type': 'application/json' }
      opts.body = JSON.stringify(body)
    }
    const r = await fetch(url, opts)
    if (!r.ok) {
      console.warn('[mockapi] non-ok response', r.status, await r.text().catch(()=>''))
      return null
    }
    const data = await r.json()
    return data
  } catch (err) {
    console.warn('[mockapi] request failed', err.message)
    return null
  }
}

// GET /api/Menu
app.get('/api/Menu', async (req, res) => {
  const data = await tryProxyToMockAPI('GET', '/Menu')
  if (data) return res.json(data)
  // fallback
  return res.json(menuStore.load())
})

// POST /api/Menu
app.post('/api/Menu', async (req, res) => {
  console.log('[server] POST /api/Menu received')
  const payload = req.body || {}
  try {
    const created = await tryProxyToMockAPI('POST', '/Menu', payload)
    if (created) {
      console.log('[server] POST proxied to MockAPI OK')
      return res.status(201).json(created)
    }
  } catch (err) {
    console.warn('[server] POST proxy attempt threw', err && err.message)
  }
  // fallback: create locally
  console.log('[server] POST falling back to local store')
  const arr = menuStore.load()
  const newItem = Object.assign({}, payload, { id: menuStore.id() })
  arr.unshift(newItem)
  menuStore.save(arr)
  return res.status(201).json(newItem)
})

// PUT /api/Menu/:id
app.put('/api/Menu/:id', async (req, res) => {
  const id = req.params.id
  const payload = req.body || {}
  const updated = await tryProxyToMockAPI('PUT', `/Menu/${id}`, payload)
  if (updated) return res.json(updated)
  // fallback: update local
  const arr = menuStore.load()
  const idx = arr.findIndex(i => String(i.id) === String(id))
  if (idx === -1) return res.status(404).json({ message: 'Not found (local)' })
  arr[idx] = Object.assign({}, arr[idx], payload)
  menuStore.save(arr)
  return res.json(arr[idx])
})

// DELETE /api/Menu/:id
app.delete('/api/Menu/:id', async (req, res) => {
  const id = req.params.id
  const deleted = await tryProxyToMockAPI('DELETE', `/Menu/${id}`)
  if (deleted) return res.json(deleted)
  // fallback: delete local
  let arr = menuStore.load()
  const before = arr.length
  arr = arr.filter(i => String(i.id) !== String(id))
  if (arr.length === before) return res.status(404).json({ message: 'Not found (local)' })
  menuStore.save(arr)
  return res.json({ ok: true })
})

// Proxy remaining /api/* requests to MockAPI to avoid CORS and add simple logging
app.use('/api', createProxyMiddleware({
  target: 'https://697b85bd0e6ff62c3c5c53d4.mockapi.io',
  changeOrigin: true,
  pathRewrite: { '^/api/': '/' },
  onProxyReq(proxyReq, req, res) {
    console.log(`[proxy] ${req.method} ${req.originalUrl} -> ${proxyReq.protocol}//${proxyReq.host}${proxyReq.path}`)
  }
}))
// Simple server-side upload proxy to ImgBB (accepts JSON { image: base64 })
const IMGBB_KEY = '4a940fdeb265ea3e6e36ceba473f0d4c'
const IMGBB_ENDPOINT = `https://api.imgbb.com/1/upload?expiration=15552000&key=${IMGBB_KEY}`

// Allow CORS preflight for upload endpoint (used during dev when client runs on different port)
app.options('/upload', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.sendStatus(204)
})

app.post('/upload', async (req, res) => {
  try {
    // allow cross-origin from dev tools
    res.setHeader('Access-Control-Allow-Origin', '*')

    const { image } = req.body || {}
    console.log(`[upload] incoming request from origin=${req.headers.origin} method=${req.method} content-length=${req.headers['content-length'] || 'unknown'} image-length=${image ? image.length : 0}`)
    if (!image) return res.status(400).json({ ok: false, message: 'image (base64) required' })

    // send as application/x-www-form-urlencoded
    const params = new URLSearchParams()
    params.append('image', image)

    const r = await fetch(IMGBB_ENDPOINT, { method: 'POST', body: params })
    console.log(`[upload] ImgBB status: ${r.status}`)
    if (!r.ok) {
      const text = await r.text().catch(() => '')
      console.warn('ImgBB responded with error:', r.status, text)
      return res.status(502).json({ ok: false, message: 'ImgBB error', detail: text || r.statusText })
    }

    const data = await r.json()
    const url = data && data.data && (data.data.display_url || data.data.url)
    console.log('[upload] ImgBB returned url:', url)
    if (!url) return res.status(502).json({ ok: false, message: 'ImgBB returned unexpected response', raw: data })
    return res.json({ ok: true, url })
  } catch (err) {
    console.error('Upload error:', err)
    return res.status(500).json({ ok: false, message: err.message })
  }
})
// Serve static files from `dist` if available (production build), otherwise serve project root (one level up)
const distPath = path.join(__dirname, 'dist')
const rootStatic = path.join(__dirname, '..')
const rootIndex = path.join(rootStatic, 'index.html')

if (fsSync.existsSync(distPath)) {
  app.use(express.static(distPath))
  app.get('*', (req, res) => res.sendFile(path.join(distPath, 'index.html')))
} else if (fsSync.existsSync(rootIndex)) {
  // Serve the project root (useful during development when index.html is at project root)
  app.use(express.static(rootStatic))
  app.get('*', (req, res) => res.sendFile(rootIndex))
} else {
  // No index.html found — provide a helpful message
  app.get('*', (req, res) => res.status(404).send('index.html not found. Run `npm run dev` or `npm run build` first.'))
}

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`)
})