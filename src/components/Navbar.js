import authModule from '../auth.js'

export default {
  name: 'Navbar',
  data() { return { auth: authModule.auth } },
  methods: {
    openLogin() { window.dispatchEvent(new Event('open-login')) },
    logout() { authModule.logout(); window.dispatchEvent(new Event('auth-changed')) }
  },
  template: `
    <header class="bg-white shadow">
      <div class="container mx-auto px-4 py-4 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold">RM</div>
          <div>
            <div class="font-semibold">Rumah Makan Padang</div>
            <div class="text-sm text-gray-500">Manajemen Menu SPA (Mock CRUD)</div>
          </div>
        </div>
        <nav class="hidden sm:flex items-center gap-4">
          <a href="#" class="text-sm text-gray-600 hover:text-emerald-600 mr-4">Beranda</a>
          <a href="#" class="text-sm text-gray-600 hover:text-emerald-600">Tentang</a>
          <div class="ml-4">
            <template v-if="auth && auth.user">
              <span class="text-sm text-gray-700 mr-3">Hi, {{ auth.user.username }}</span>
              <button @click="logout" class="text-sm px-3 py-1 border rounded">Logout</button>
            </template>
            <template v-else>
              <button @click="openLogin" class="text-sm px-3 py-1 bg-emerald-500 text-white rounded">Login</button>
            </template>
          </div>
        </nav>
      </div>
    </header>
  `
}
