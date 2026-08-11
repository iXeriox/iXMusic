import { defineStore } from 'pinia'
import api from '@/services/api'

export const useSearchStore = defineStore('search', {
  state: () => ({
    query: '',
    results: [],
    loading: false,
    error: '',
  }),

  actions: {
    async run(query) {
      this.query = query
      if (!query.trim()) {
        this.results = []
        return
      }
      this.loading = true
      this.error = ''
      try {
        const res = await api.get(`/youtube.php?q=${encodeURIComponent(query)}`)
        this.results = res.data.results
      } catch (e) {
        this.error = e.message
        this.results = []
      } finally {
        this.loading = false
      }
    },

    clear() {
      this.query = ''
      this.results = []
    },
  },
})
