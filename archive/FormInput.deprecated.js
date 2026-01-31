export default {
  name: 'FormInput',
  emits: ['submit'],
  data() {
    return {
      show: false,
      form: { id: null, name: '', price: '', desc: '' }
    }
  },
  created() {
    window.addEventListener('open-form', (e) => {
      if (e.detail) this.form = { ...e.detail }
      else this.form = { id: null, name: '', price: '', desc: '' }
      this.show = true
    })
  },
  methods: {
    close() { this.show = false },
    submitForm() {
      if (!this.form.name || !this.form.price) return alert('Nama dan Harga wajib diisi')
      this.$emit('submit', { ...this.form, price: Number(this.form.price) })
      this.close()
    }
  },
  template: `... (deprecated JS component, moved to Vue SFC)`
}