<template>
  <header class="bg-[#7a0d0d] shadow">
    <div class="container mx-auto px-4 py-4 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <img src="/image/logo.png" alt="Logo" class="w-12 h-12 object-contain shadow-sm" />
        <div>
          <div class="font-semibold text-amber-100">Rumah Makan Padang</div>
          <div class="text-sm text-amber-200">Manajemen Menu SPA (Mock CRUD)</div>
        </div>
      </div>
      <nav class="hidden sm:flex items-center gap-4">
        <button @click="showModal = true" class="text-sm text-amber-100 hover:text-amber-200 focus:outline-none">Tentang</button>
      </nav>
    </div>
    <!-- Modal Tentang UAS -->
    <transition name="fade">
      <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div class="bg-white/80 backdrop-blur rounded-lg shadow-lg max-w-md w-full p-6 relative border-2 border-amber-400">
          <button @click="showModal = false" class="absolute top-2 right-2 text-[#7a0d0d] hover:text-amber-500 text-xl font-bold">&times;</button>
          <div class="mb-4 text-center">
            <img src="/image/logo.png" alt="Logo" class="mx-auto w-16 h-16 object-contain mb-2" />
            <h2 class="text-2xl font-bold text-[#7a0d0d] mb-1">UAS Pemrograman Front-End</h2>
            <div class="text-amber-700 font-semibold text-base mb-2">Rumah Makan Padang - SPA CRUD</div>
          </div>
          <div class="overflow-x-auto">
            <table class="min-w-full text-sm text-left text-gray-800 bg-transparent">
              <tbody>
                <tr>
                  <th class="pr-3 py-1 font-semibold whitespace-nowrap align-top">Mata Kuliah</th>
                  <td class="py-1">Pemrograman Front-End</td>
                </tr>
                <tr>
                  <th class="pr-3 py-1 font-semibold whitespace-nowrap align-top">Kode Mata Kuliah</th>
                  <td class="py-1">IF220</td>
                </tr>
                <tr>
                  <th class="pr-3 py-1 font-semibold whitespace-nowrap align-top">Dosen Pengampu</th>
                  <td class="py-1">Taufik Iqbal Ramdhani, S.Kom., M.Sc.</td>
                </tr>
                <tr>
                  <th class="pr-3 py-1 font-semibold whitespace-nowrap align-top">Nama Mahasiswa</th>
                  <td class="py-1">Bemis Huntala</td>
                </tr>
                <tr>
                  <th class="pr-3 py-1 font-semibold whitespace-nowrap align-top">Semester</th>
                  <td class="py-1">3 (tiga)</td>
                </tr>
                <tr>
                  <th class="pr-3 py-1 font-semibold whitespace-nowrap align-top">NIM</th>
                  <td class="py-1">1002240018</td>
                </tr>
                <tr>
                  <th class="pr-3 py-1 font-semibold whitespace-nowrap align-top">Program Studi</th>
                  <td class="py-1">Teknologi Informasi</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </transition>
  </header>
</template>

<script setup>
import { ref } from 'vue'
const showModal = ref(false)
</script>
