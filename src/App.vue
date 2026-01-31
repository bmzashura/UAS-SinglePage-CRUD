<template>
  <div class="min-h-screen flex flex-col relative">
    <Navbar />

    <section class="bg-[#4b0a0a] text-amber-100 py-8">
      <div class="container mx-auto px-4 flex items-center gap-6">
        <div class="flex-1">
          <h2 class="text-3xl font-bold">Selamat datang di Rumah Makan Padang</h2>
          <p class="mt-2 text-amber-200 max-w-xl">Nikmati aneka masakan Padang otentik — rasa kaya rempah dan hangat untuk keluarga.</p>
        </div>
        <div class="hidden md:block">
          <Ornament />
        </div>
      </div>
    </section>

    <main class="container mx-auto px-4 py-6 flex-1">
      <div class="flex items-center justify-between mb-6">
      </div>

      <!-- Form section (distinct background / divider) -->
      <div class="mb-6">
        <div class="bg-gray-50 border border-gray-200 rounded p-4">
          <FormInput :item="formItem" @submit="createItemOrUpdate" />
        </div>
      </div>

      <div v-if="store.lastError" class="mb-4 p-3 rounded bg-red-50 border border-red-200 text-red-800">
        <div class="flex items-start justify-between">
          <div>
            <div class="font-semibold">Terjadi error (detail):</div>
            <div class="text-sm">{{ store.lastError.message || store.lastError }}</div>
          </div>
          <div>
            <button @click="store.lastError = null" class="px-2 py-1 text-sm border rounded">Tutup</button>
          </div>
        </div>
      </div>

      <section class="bg-[#4b0a0a] rounded-lg p-6">
      <!-- ...existing code... -->
        <h2 class="text-xl font-semibold text-amber-100 mb-4">Daftar Menu</h2>
        <div v-if="store.loading" class="text-center py-6 text-amber-100">Memuat data...</div>
        <div v-else-if="store.error" class="text-center text-amber-200 py-4">{{ store.error }}</div>
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <CardItem v-for="item in store.items" :key="item.id" :item="item" @update="handleUpdate" @delete-request="handleDeleteRequest" />
        </div>
      </section>

    </main>

    <!-- Flash / Alert (near form) -->
    <div class="container mx-auto px-4">
      <div v-if="flash.show" :class="flash.type === 'success' ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-red-50 border-red-200 text-red-800'" class="p-3 rounded border mt-3 flex items-center justify-between">
        <div>{{ flash.message }}</div>
        <button class="ml-4 px-2 py-1 text-sm border border-amber-300 rounded text-amber-700" @click="flash.show = false">Tutup</button>
      </div>
    </div>

    <!-- Confirm delete dialog -->
    <div v-if="confirm.show" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div class="bg-white p-4 rounded shadow max-w-sm w-full">
        <div class="font-semibold mb-2">Konfirmasi Hapus</div>
        <div class="mb-4">{{ confirm.message }}</div>
        <div class="flex justify-end gap-2">
          <button class="px-3 py-1 border rounded" @click="confirmCancel">Batal</button>
          <button class="px-3 py-1 bg-red-500 text-white rounded" @click="confirmYes">Hapus</button>
        </div>
      </div>
    </div>

    <FooterCmp />
  </div>
</template>

<script setup>
import { reactive, onMounted, ref } from 'vue'
import Navbar from './components/Navbar.vue'
import CardItem from './components/CardItem.vue'
import FormInput from './components/FormInput.vue'
import FooterCmp from './components/Footer.vue'

const API_BASE = import.meta.env.DEV ? 'http://localhost:3000/api/Menu' : '/api/Menu'
const store = reactive({ items: [], loading: false, error: null, lastError: null })

const formItem = ref(null)
const flash = reactive({ show: false, message: '', type: 'success' })
const confirm = reactive({ show: false, id: null, message: '' })


async function loadItems() {
  store.loading = true
  store.error = null
  try {
    const res = await fetch(API_BASE)
    if (!res.ok) throw new Error('Gagal memuat data dari server')
    const data = await res.json()
    store.items = data.map(d => ({
      ...d,
      nama: d.nama || d.name || '',
      harga: d.harga || d.price || 0,
      kategori: d.kategori || '',
      foto: d.foto || '',
      isReady: (typeof d.isReady === 'boolean') ? d.isReady : true
    }))
  } catch (err) {
    store.error = err.message || 'Unknown error'
    store.lastError = err
    console.error('loadItems error:', err)
    // Show a helpful alert with technical details for debugging
    flash.show = true; flash.type = 'error'; flash.message = 'Terjadi error saat memuat data: ' + (err.message || err)
  } finally {
    store.loading = false
  }
}

async function createItemOrUpdate(payload) {
  try {
    if (payload.id) {
      const id = payload.id
      const body = { 
        nama: payload.nama,
        harga: Number(payload.harga),
        kategori: payload.kategori,
        foto: payload.foto,
        isReady: !!payload.isReady
      }
      const res = await fetch(`${API_BASE}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      if (!res.ok) {
        const body = await res.text().catch(()=>null)
        throw new Error('Gagal memperbarui data: ' + (body || res.statusText))
      }
      const updated = await res.json()
      const idx = store.items.findIndex(i => i.id === updated.id)
      if (idx !== -1) store.items[idx] = updated
      flash.show = true; flash.type = 'success'; flash.message = 'Perubahan berhasil disimpan.'
      setTimeout(() => { flash.show = false }, 4000)
    } else {
      const body = { 
        nama: payload.nama,
        harga: Number(payload.harga),
        kategori: payload.kategori,
        foto: payload.foto,
        isReady: !!payload.isReady
      }
      const res = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      if (!res.ok) {
        const body = await res.text().catch(()=>null)
        throw new Error('Gagal membuat item: ' + (body || res.statusText))
      }
      const created = await res.json()
      store.items.unshift(created)
      flash.show = true; flash.type = 'success'; flash.message = 'Menu berhasil ditambahkan.'
    }

    // auto-hide flash
    setTimeout(() => { flash.show = false }, 4000)
    // clear form after successful create
    if (!payload.id) formItem.value = null
  } catch (err) {
    flash.show = true; flash.type = 'error'; flash.message = 'Terjadi error: ' + (err.message || err)
  }
}

async function deleteItem(id) {
  try {
    const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' })
    if (!res.ok) {
      const errText = await res.text().catch(()=>null)
      throw new Error('Gagal menghapus item: ' + (errText || res.statusText))
    }
    store.items = store.items.filter(i => i.id !== id)
    flash.show = true; flash.type = 'success'; flash.message = 'Menu berhasil dihapus.'
    setTimeout(() => { flash.show = false }, 3000)
  } catch (err) {
    flash.show = true; flash.type = 'error'; flash.message = 'Terjadi error: ' + (err.message || err)
  }
}

function handleUpdate(payload) {
  // payload from CardItem (inline edit)
  createItemOrUpdate(payload)
}

function handleDeleteRequest(id) {
  confirm.show = true
  confirm.id = id
  confirm.message = 'Hapus menu ini? Tindakan ini tidak dapat dibatalkan.'
}

function confirmCancel() { confirm.show = false; confirm.id = null }
async function confirmYes() {
  if (!confirm.id) return confirmCancel()
  const id = confirm.id
  confirm.show = false
  confirm.id = null
  await deleteItem(id)
}

onMounted(() => {
  loadItems()
})


</script>
