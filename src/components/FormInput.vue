<template>
  <div class="bg-[#7a0d0d] rounded-lg shadow-md p-4 mb-6 border border-[#5a0a0a] text-amber-100">
    <h3 class="text-lg font-semibold mb-3 text-amber-100">Tambah Menu</h3>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div>
        <label class="block text-sm text-amber-200">Nama</label>
        <input v-model="form.nama" class="w-full bg-white text-[#3c0a0a] border rounded px-3 py-2 mt-1" />
      </div>

      <div>
        <label class="block text-sm text-amber-200">Harga (Rp)</label>
        <input v-model="form.harga" type="number" class="w-full bg-white text-[#3c0a0a] border rounded px-3 py-2 mt-1" />
      </div>

      <div>
        <label class="block text-sm font-medium text-amber-200">Kategori</label>
        <div class="mt-2 flex items-center gap-6">
          <label class="inline-flex items-center gap-2 text-amber-100">
            <input type="radio" value="Makanan" v-model="form.kategori" class="h-4 w-4 accent-amber-400" />
            <span>Makanan</span>
          </label>
          <label class="inline-flex items-center gap-2 text-amber-100">
            <input type="radio" value="Minuman" v-model="form.kategori" class="h-4 w-4 accent-amber-400" />
            <span>Minuman</span>
          </label>
        </div>
      </div>

      <div>
        <label class="block text-sm text-amber-200">Foto (URL atau file)</label>
        <input v-model="form.foto" placeholder="Atau isi URL langsung" class="w-full bg-white text-[#3c0a0a] border rounded px-3 py-2 mt-1" />
        <div class="mt-2">
          <input type="file" @change="onFileChange" accept="image/*" class="text-amber-100" />
        </div>
        <div v-if="previewUrl" class="mt-3">
          <div class="text-sm text-amber-200">Preview:</div>
          <img :src="previewUrl" class="w-32 h-32 object-cover rounded mt-1 border border-[#5a0a0a]" />
        </div>
      </div>

      <div class="flex items-center gap-2">
        <input id="isReady" type="checkbox" v-model="form.isReady" class="accent-amber-400" />
        <label for="isReady" class="text-sm text-amber-100">Tersedia</label>
      </div>
    </div>

    <div class="flex justify-end gap-2 mt-4">
      <button @click="reset" :disabled="uploading" class="px-4 py-2 rounded border border-amber-300 text-white bg-transparent hover:bg-amber-300/10">Bersihkan</button>
      <button @click="submitForm" :disabled="uploading" class="px-4 py-2 rounded bg-amber-500 text-[#7a0d0d] hover:bg-amber-600">{{ uploading ? 'Mengunggah…' : (form.id ? 'Simpan Perubahan' : 'Tambah') }}</button>
    </div>
  </div>
</template>

<script setup>
import { reactive, watch, ref } from 'vue'
import uploadImage from '../services/imgbb.js'
const emit = defineEmits(['submit'])
const props = defineProps({ item: Object })
const form = reactive({ id: null, nama: '', harga: '', kategori: 'Makanan', foto: '', isReady: false })
const selectedFile = ref(null)
const previewUrl = ref('')
const uploading = ref(false)

watch(() => props.item, (v) => {
  if (v) {
    form.id = v.id || null
    form.nama = v.nama || v.name || ''
    form.harga = v.harga || v.price || ''
    form.kategori = v.kategori || ''
    form.foto = v.foto || ''
    form.isReady = (typeof v.isReady === 'boolean') ? v.isReady : !!v.isReady
    selectedFile.value = null
    previewUrl.value = form.foto || ''
  } else {
    form.id = null; form.nama = ''; form.harga = ''; form.kategori = ''; form.foto = ''; form.isReady = false
    selectedFile.value = null
    previewUrl.value = ''
  }
}, { immediate: true })

function onFileChange(e) {
  const f = e.target.files && e.target.files[0]
  if (!f) {
    selectedFile.value = null
    previewUrl.value = ''
    return
  }
  selectedFile.value = f
  previewUrl.value = URL.createObjectURL(f)
}

function reset() {
  // clear form
  form.id = null; form.nama = ''; form.harga = ''; form.kategori = 'Makanan'; form.foto = ''; form.isReady = false
  selectedFile.value = null
  if (previewUrl.value) { URL.revokeObjectURL(previewUrl.value); previewUrl.value = '' }
}

async function submitForm() {
  if (!form.nama || !form.harga) return alert('Nama dan Harga wajib diisi')
  try {
    uploading.value = true
    let photoUrl = form.foto || ''
    if (selectedFile.value) {
      // upload file to ImgBB
      photoUrl = await uploadImage(selectedFile.value)
    }

    const payload = { 
      ...(form.id ? { id: form.id } : {}),
      nama: form.nama,
      harga: Number(form.harga),
      kategori: form.kategori,
      foto: photoUrl,
      isReady: !!form.isReady
    }

    emit('submit', payload)
    // keep form contents (useful when parent wants to clear)
  } catch (err) {
    alert('Gagal mengunggah gambar atau menyimpan data: ' + (err.message || err))
  } finally {
    uploading.value = false
  }
}
</script>

<style scoped>
/* nothing */
</style>