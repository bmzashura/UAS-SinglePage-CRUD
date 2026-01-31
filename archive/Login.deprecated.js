import authModule from '../services/auth.js'

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
  template: `... (deprecated JS component, moved to Vue SFC)`
}