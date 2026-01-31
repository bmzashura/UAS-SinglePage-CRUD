<template>
  <article class="bg-white rounded-lg shadow p-4 flex flex-col relative">
    <div class="flex-1">
      <div v-if="!editing" class="flex items-start gap-3">
        <img v-if="item.foto" :src="item.foto" alt="foto" class="w-20 h-20 object-cover rounded" />
        <div>
          <h3 class="text-lg font-semibold">{{ item.nama || item.name }}</h3>
          <div class="mt-2">
            <span class="inline-block bg-amber-400 text-[#7a0d0d] text-sm font-semibold px-3 py-1 rounded-full">{{ item.kategori }}</span>
          </div>
        </div>
      </div>

      <div v-else class="space-y-2 border-2 border-amber-300 bg-amber-50 p-3 rounded">
        <input v-model="local.nama" class="w-full border rounded px-3 py-2 bg-white text-[#3c0a0a]" />
        <div class="grid grid-cols-2 gap-2">
          <input v-model="local.harga" type="number" class="border rounded px-3 py-2 bg-white text-[#3c0a0a]" />
          <input v-model="local.kategori" class="border rounded px-3 py-2 bg-white text-[#3c0a0a]" />
        </div>
        <input v-model="local.foto" placeholder="URL foto" class="w-full border rounded px-3 py-2 bg-white text-[#3c0a0a]" />

        <div class="mt-2">
          <label class="block text-sm">Unggah foto (opsional)</label>
          <input type="file" @change="onFileChange" accept="image/*" />
          <div v-if="previewUrl" class="mt-2">
            <img :src="previewUrl" class="w-24 h-24 object-cover rounded" />
          </div>
        </div>

        <div class="flex items-center gap-2">
          <input type="checkbox" :id="'ready-'+item.id" v-model="local.isReady" />
          <label :for="'ready-'+item.id">Tersedia</label>
        </div>
      </div>

      <p class="text-amber-700 font-semibold text-lg mt-3">Rp {{ Number(item.harga || item.price || 0).toLocaleString() }}</p>
    </div>
    <div class="mt-4 flex items-center justify-between">
      <div>
        <span :class="(editing ? (local.isReady ? 'text-amber-700' : 'text-[#7a0d0d]') : (item.isReady ? 'text-amber-700' : 'text-[#7a0d0d]'))" class="font-semibold">
          {{ (editing ? (local.isReady ? 'Tersedia' : 'Kosong') : (item.isReady ? 'Tersedia' : 'Kosong')) }}
        </span>
      </div>
      <div class="flex gap-2">
        <template v-if="!editing">
          <button @click="startEdit" class="px-3 py-1 bg-amber-500 text-[#7a0d0d] rounded hover:bg-amber-600">Edit</button>
          <button @click="requestDelete" class="px-3 py-1 bg-[#7a0d0d] text-white rounded hover:bg-[#5a0d0d]">Hapus</button>
        </template>
        <template v-else>
          <button @click="save" class="px-3 py-1 bg-amber-500 text-[#7a0d0d] rounded hover:bg-amber-600">Simpan</button>
          <button @click="cancel" class="px-3 py-1 border border-amber-500 text-amber-600 rounded">Batal</button>
        </template>
      </div>
    </div>
  </article>
</template>

<script setup>
import { ref, reactive } from 'vue'
import uploadImage from '../services/imgbb.js'
const props = defineProps({ item: Object })
const emit = defineEmits(['update', 'delete-request'])

const editing = ref(false)
const local = reactive({ id: null, nama: '', harga: 0, kategori: '', foto: '', isReady: false })
const selectedFile = ref(null)
const previewUrl = ref('')
const uploading = ref(false)

function startEdit() {
  editing.value = true
  local.id = props.item.id
  local.nama = props.item.nama || props.item.name || ''
  local.harga = props.item.harga || props.item.price || 0
  local.kategori = props.item.kategori || ''
  local.foto = props.item.foto || ''
  local.isReady = (typeof props.item.isReady === 'boolean') ? props.item.isReady : !!props.item.isReady
  selectedFile.value = null
  previewUrl.value = local.foto || ''
}
function cancel() {
  editing.value = false
  if (previewUrl.value && selectedFile.value) { URL.revokeObjectURL(previewUrl.value) }
  selectedFile.value = null
  previewUrl.value = ''
}

function onFileChange(e) {
  const f = e.target.files && e.target.files[0]
  if (!f) { selectedFile.value = null; previewUrl.value = local.foto || ''; return }
  selectedFile.value = f
  previewUrl.value = URL.createObjectURL(f)
}

async function save() {
  try {
    uploading.value = true
    if (selectedFile.value) {
      // upload file to ImgBB via service
      const url = await uploadImage(selectedFile.value)
      local.foto = url
      // cleanup object URL
      if (previewUrl.value) { URL.revokeObjectURL(previewUrl.value) }
      selectedFile.value = null
      previewUrl.value = ''
    }

    const payload = { id: local.id, nama: local.nama, harga: Number(local.harga), kategori: local.kategori, foto: local.foto, isReady: !!local.isReady }
    emit('update', payload)
    editing.value = false
  } catch (err) {
    alert('Gagal mengunggah gambar: ' + (err && err.message ? err.message : err))
  } finally {
    uploading.value = false
  }
}
function requestDelete() { emit('delete-request', props.item.id) }
</script>
