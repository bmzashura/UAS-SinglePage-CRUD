// Deprecated: use `Login.vue` component
export default {}
export default {
  name: 'LoginModal',
  data() {
    return { show: false, username: '', password: '', error: '' }
  },
  created() {
    window.addEventListener('open-login', () => { this.show = true })
  },
  methods: {
    async submit() {
      this.error = ''
      try {
        const res = await authModule.login(this.username.trim(), this.password)
        if (res.ok) {
          this.show = false
          this.username = ''
          this.password = ''
          this.$emit('logged-in')
        } else {
          this.error = res.message || 'Login gagal'
        }
      } catch (err) {
        this.error = err.message || 'Error'
      }
    },
    close() { this.show = false }
  },
  template: `
    <div v-if="show" class="fixed inset-0 bg-black/40 z-40 flex items-center justify-center px-4">
      <div class="bg-white rounded-lg shadow-lg w-full max-w-sm p-6 z-50">
        <h3 class="text-lg font-semibold mb-4">Login Admin</h3>
        <div class="space-y-3">
          <div>
            <label class="block text-sm">Username</label>
            <input v-model="username" class="w-full border rounded px-3 py-2 mt-1" />
          </div>
          <div>
            <label class="block text-sm">Password</label>
            <input v-model="password" type="password" class="w-full border rounded px-3 py-2 mt-1" />
          </div>
          <div v-if="error" class="text-red-500 text-sm">{{ error }}</div>
          <div class="flex justify-end gap-2 mt-4">
            <button @click="close" class="px-4 py-2 rounded border">Batal</button>
            <button @click="submit" class="px-4 py-2 rounded bg-emerald-500 text-white">Login</button>
          </div>
        </div>
      </div>
    </div>
  `
}
