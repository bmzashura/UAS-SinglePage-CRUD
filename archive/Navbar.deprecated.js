import authModule from '../services/auth.js'

export default {
  name: 'Navbar',
  data() { return { auth: authModule.auth } },
  methods: {
    openLogin() { window.dispatchEvent(new Event('open-login')) },
    logout() { authModule.logout(); window.dispatchEvent(new Event('auth-changed')) }
  },
  template: `
    <header class="bg-white shadow">
      ... (deprecated JS component, moved to Vue SFC)
    </header>
  `
}