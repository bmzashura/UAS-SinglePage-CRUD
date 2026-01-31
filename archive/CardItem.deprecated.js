export default {
  name: 'CardItem',
  props: ['item'],
  emits: ['edit', 'delete'],
  methods: {
    edit() { this.$emit('edit', this.item) },
    del() { if (confirm('Hapus menu ini?')) this.$emit('delete', this.item.id) }
  },
  template: `
    <article class="bg-white rounded-lg shadow p-4 flex flex-col">
      <div class="flex-1">
        <h3 class="text-lg font-semibold">{{ item.name }}</h3>
        <p class="text-sm text-gray-600 mt-1">{{ item.desc }}</p>
      </div>
      <div class="mt-4 flex items-center justify-between">
        <div class="text-emerald-600 font-bold">Rp {{ Number(item.price).toLocaleString() }}</div>
        <div class="flex gap-2">
          <button @click="edit" class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">Edit</button>
          <button @click="del" class="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600">Hapus</button>
        </div>
      </div>
    </article>
  `
}