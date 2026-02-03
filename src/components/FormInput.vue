<template>
  <div class="bg-[#7a0d0d] rounded-2xl shadow-lg p-8 mb-6 border border-[#a03c3c]/60 text-amber-100">
    <h3 class="text-2xl font-bold mb-6 text-amber-100 tracking-wide drop-shadow">Tambah Menu</h3>

    <form @submit.prevent="submitForm" autocomplete="off">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div class="space-y-5">
          <div>
            <label class="block text-base font-semibold text-amber-200 mb-1">Nama</label>
            <input v-model="form.nama" class="w-full bg-white/90 text-[#3c0a0a] border-2 border-amber-200 focus:border-amber-400 rounded-lg px-4 py-2.5 shadow-sm focus:outline-none transition" placeholder="Masukkan nama menu" />
          </div>
          <div>
            <label class="block text-base font-semibold text-amber-200 mb-1">Kategori</label>
            <div class="flex items-center gap-8 mt-2">
              <label class="inline-flex items-center gap-2 text-amber-100 font-medium">
                <input type="radio" value="Makanan" v-model="form.kategori" class="h-4 w-4 accent-amber-400" />
                <span>Makanan</span>
              </label>
              <label class="inline-flex items-center gap-2 text-amber-100 font-medium">
                <input type="radio" value="Minuman" v-model="form.kategori" class="h-4 w-4 accent-amber-400" />
                <span>Minuman</span>
              </label>
            </div>
          </div>
          <div class="flex items-center gap-2 mt-4">
            <input id="isReady" type="checkbox" v-model="form.isReady" class="accent-amber-400 h-5 w-5" />
            <label for="isReady" class="text-base text-amber-100 font-medium">Tersedia</label>
          </div>
        </div>
        <div class="space-y-5">
          <div>
            <label class="block text-base font-semibold text-amber-200 mb-1">Harga (Rp)</label>
            <input v-model="form.harga" type="number" class="w-full bg-white/90 text-[#3c0a0a] border-2 border-amber-200 focus:border-amber-400 rounded-lg px-4 py-2.5 shadow-sm focus:outline-none transition" placeholder="Masukkan harga" />
          </div>
          <div>
            <label class="block text-base font-semibold text-amber-200 mb-1">Foto (URL atau file)</label>
            <input v-model="form.foto" placeholder="Atau isi URL langsung" class="w-full bg-white/90 text-[#3c0a0a] border-2 border-amber-200 focus:border-amber-400 rounded-lg px-4 py-2.5 shadow-sm focus:outline-none transition mb-2" />
            <div class="flex items-center gap-3">
              <input type="file" @change="onFileChange" accept="image/*" class="text-amber-100 file:bg-amber-100 file:text-[#7a0d0d] file:rounded file:px-3 file:py-1 file:border-none file:mr-3" />
              <span class="text-xs text-amber-200">Pilih file gambar</span>
            </div>
            <div v-if="previewUrl" class="mt-3">
              <div class="text-xs text-amber-200 mb-1">Preview:</div>
              <img :src="previewUrl" class="w-32 h-32 object-cover rounded-lg border-2 border-amber-200 shadow" />
            </div>
          </div>
        </div>
      </div>
      <div class="flex justify-end gap-3 mt-8">
        <button type="button" @click="reset" :disabled="uploading" class="px-5 py-2 rounded-lg border-2 border-amber-300 text-white bg-transparent hover:bg-amber-300/20 font-semibold transition">Bersihkan</button>
        <button type="submit" :disabled="uploading" class="px-6 py-2 rounded-lg bg-amber-500 text-[#7a0d0d] hover:bg-amber-600 font-bold shadow transition">{{ uploading ? 'Mengunggah…' : (form.id ? 'Simpan Perubahan' : 'Tambah') }}</button>
      </div>
    </form>
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

defineExpose({ reset })

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