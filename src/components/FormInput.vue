<template>
  <div v-if="show" class="fixed inset-0 bg-black/40 z-40 flex items-center justify-center px-4">
    <div class="bg-white rounded-lg shadow-lg w-full max-w-md p-6 z-50">
      <h3 class="text-lg font-semibold mb-4">{{ form.id ? 'Edit Menu' : 'Tambah Menu' }}</h3>
      <div class="space-y-3">
        <div>
          <label class="block text-sm">Nama</label>
          <input v-model="form.name" class="w-full border rounded px-3 py-2 mt-1" />
        </div>

        <div>
          <label class="block text-sm">Harga (Rp)</label>
          <input v-model="form.price" type="number" class="w-full border rounded px-3 py-2 mt-1" />
        </div>

        <div>
          <label class="block text-sm">Deskripsi</label>
          <textarea v-model="form.desc" class="w-full border rounded px-3 py-2 mt-1" rows="3"></textarea>
        </div>

        <div class="flex justify-end gap-2 mt-4">
          <button @click="close" class="px-4 py-2 rounded border">Batal</button>
          <button @click="submitForm" class="px-4 py-2 rounded bg-emerald-500 text-white">Simpan</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, onMounted, ref } from 'vue'
const emit = defineEmits(['submit'])
const form = reactive({ id: null, name: '', price: '', desc: '' })
const show = ref(false)

function openHandler(e) {
  if (e.detail) {
    form.id = e.detail.id
    form.name = e.detail.name
    form.price = e.detail.price
    form.desc = e.detail.desc
  } else {
    form.id = null; form.name = ''; form.price = ''; form.desc = ''
  }
  show.value = true
}

function close() { show.value = false }

function submitForm() {
  if (!form.name || !form.price) return alert('Nama dan Harga wajib diisi')
  const payload = { id: form.id, name: form.name, price: Number(form.price), desc: form.desc }
  emit('submit', payload)
  close()
}

onMounted(() => {
  window.addEventListener('open-form', openHandler)
})
</script>
</script>

<style scoped>
/* nothing */
</style>