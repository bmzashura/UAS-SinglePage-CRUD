import { reactive } from 'vue'

const auth = reactive({ user: null, token: null })

const STORAGE_KEY = 'uas_admin_user'

// restore from sessionStorage
const saved = sessionStorage.getItem(STORAGE_KEY)
if (saved) {
  try {
    const parsed = JSON.parse(saved)
    auth.user = { username: parsed.username }
    auth.token = parsed.token
  } catch (e) { /* ignore */ }
}

async function login(username, password) {
  try {
    const res = await fetch('/auth/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    })
    const data = await res.json()
    if (!res.ok || !data.ok) return { ok: false, message: data.message || 'Login gagal' }
    auth.user = { username: data.username }
    auth.token = data.token
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ username: data.username, token: data.token }))
    return { ok: true }
  } catch (err) {
    return { ok: false, message: err.message }
  }
}

async function logout() {
  try { await fetch('/auth/logout', { method: 'POST', headers: { 'x-admin-token': auth.token || '' } }) } catch(e){}
  auth.user = null
  auth.token = null
  sessionStorage.removeItem(STORAGE_KEY)
}

export default { auth, login, logout }