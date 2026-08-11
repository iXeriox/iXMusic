import { defineStore } from 'pinia'

let nextId = 1

export const useToastStore = defineStore('toast', {
  state: () => ({
    items: [],
  }),
  actions: {
    push(message, type = 'info', ttl = 3500) {
      const id = nextId++
      this.items.push({ id, message, type })
      setTimeout(() => this.dismiss(id), ttl)
    },
    success(message) {
      this.push(message, 'success')
    },
    error(message) {
      this.push(message, 'error')
    },
    dismiss(id) {
      this.items = this.items.filter((t) => t.id !== id)
    },
  },
})
