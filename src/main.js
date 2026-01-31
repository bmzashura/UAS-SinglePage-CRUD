import { createApp, reactive, ref, onMounted } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js'
import Navbar from './components/Navbar.js'
import CardItem from './components/CardItem.js'
import FormInput from './components/FormInput.js'
import FooterCmp from './components/Footer.js'
import LoginModal from './components/Login.js'
import authModule from './auth.js'

// API base URL (proxy through local server)
// When running the Node server (see README) requests use `/api/Menu` which is proxied to the real MockAPI
const API_BASE = '/api/Menu'

// Reactive store backed by API
const store = reactive({ items: [], loading: false, error: null })

const App = {
  components: { Navbar, CardItem, FormInput, FooterCmp, LoginModal },
  setup() {
    const { auth, login, logout } = authModule
    const openLogin = () => window.dispatchEvent(new Event('open-login'))

    const openForm = (item = null) => {
      if (!auth.user) { openLogin(); return }
      const event = new CustomEvent('open-form', { detail: item })
      window.dispatchEvent(event)
    }

    const loadItems = async () => {
      store.loading = true
      store.error = null
      try {
        const res = await fetch(API_BASE)
        if (!res.ok) throw new Error('Gagal memuat data dari server')
        const data = await res.json()
        store.items = data
      } catch (err) {
        store.error = err.message || 'Unknown error'
      } finally {
        store.loading = false
      }
    }

    const createItem = async (payload) => {
      if (!auth.user) { openLogin(); return }
      try {
        if (payload.id) {
          // update existing
          const res = await fetch(`${API_BASE}/${payload.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'x-admin-username': auth.user.username, 'x-admin-token': auth.token },
            body: JSON.stringify(payload)
          })
          if (!res.ok) throw new Error('Gagal memperbarui data')
          const updated = await res.json()
          const idx = store.items.findIndex(i => i.id === updated.id)
          if (idx !== -1) store.items[idx] = updated
        } else {
          // create new
          const res = await fetch(API_BASE, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-admin-username': auth.user.username, 'x-admin-token': auth.token },
            body: JSON.stringify(payload)
          })
          if (!res.ok) throw new Error('Gagal membuat item')
          const created = await res.json()
          // add to top
          store.items.unshift(created)
        }
      } catch (err) {
        alert('Terjadi error: ' + (err.message || err))
      }
    }

    const deleteItem = async (id) => {
      if (!auth.user) { openLogin(); return }
      try {
        const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE', headers: { 'x-admin-username': auth.user.username, 'x-admin-token': auth.token } })
        if (!res.ok) {
          const errText = await res.text().catch(()=>null)
          throw new Error(errText || 'Gagal menghapus item')
        }
        store.items = store.items.filter(i => i.id !== id)
      } catch (err) {
        alert('Terjadi error: ' + (err.message || err))
      }
    }

    onMounted(() => {
      loadItems()
    })

    return { store, openForm, createItem, deleteItem }
  },
  template: `
    <div class="min-h-screen flex flex-col">
      <Navbar />
      <main class="container mx-auto px-4 py-6 flex-1">
        <div class="flex items-center justify-between mb-6">
          <h1 class="text-2xl font-semibold">Menu Rumah Makan Padang</h1>
          <button @click="openForm()" class="bg-emerald-500 text-white px-4 py-2 rounded shadow hover:bg-emerald-600">Tambah Menu</button>
        </div>

        <section>
          <div v-if="store.loading" class="text-center py-6">Memuat data...</div>
          <div v-else-if="store.error" class="text-center text-red-500 py-4">{{ store.error }}</div>
          <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <CardItem v-for="item in store.items" :key="item.id" :item="item" @edit="openForm" @delete="deleteItem" />
          </div>
        </section>

      </main>

      <FormInput @submit="createItem" />

      <LoginModal @logged-in="() => { window.dispatchEvent(new Event('auth-changed')) }" />

      <FooterCmp />
    </div>
  `
}

createApp(App).mount('#app')
