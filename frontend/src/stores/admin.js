import { defineStore } from 'pinia'
import api from '@/services/api'
import { useToastStore } from './toast'

export const useAdminStore = defineStore('admin', {
  state: () => ({
    users: [],
    loading: false,
    search: '',
  }),

  actions: {
    async fetchUsers(query = '') {
      this.loading = true
      this.search = query
      try {
        const res = await api.get(`/users.php${query ? `?q=${encodeURIComponent(query)}` : ''}`)
        this.users = res.data.users
      } finally {
        this.loading = false
      }
    },

    async setRole(userId, role) {
      const res = await api.put(`/users.php?id=${userId}`, { role })
      this._sync(res.data.user)
      useToastStore().success(`Role updated to ${role}`)
    },

    async setStatus(userId, status) {
      const res = await api.put(`/users.php?id=${userId}`, { status })
      this._sync(res.data.user)
      useToastStore().success(status === 'active' ? 'Member reactivated' : 'Member suspended')
    },

    async removeUser(userId) {
      await api.delete(`/users.php?id=${userId}`)
      this.users = this.users.filter((u) => u.id !== userId)
      useToastStore().success('Member removed')
    },

    _sync(user) {
      const idx = this.users.findIndex((u) => u.id === user.id)
      if (idx >= 0) this.users[idx] = user
    },
  },
})
