import { defineStore } from 'pinia'
import api from '@/services/api'

const ROLE_LEVEL = { user: 1, moderator: 2, admin: 3 }

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('auth_token') || null,
    initializing: true,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token && !!state.user,
    isModerator: (state) => ROLE_LEVEL[state.user?.role] >= ROLE_LEVEL.moderator,
    isAdmin: (state) => state.user?.role === 'admin',
  },

  actions: {
    setSession(user, token) {
      this.user = user
      this.token = token
      localStorage.setItem('auth_token', token)
    },

    clearSession() {
      this.user = null
      this.token = null
      localStorage.removeItem('auth_token')
    },

    async register({ username, email, password, displayName }) {
      const res = await api.post('/auth.php?action=register', {
        username,
        email,
        password,
        display_name: displayName,
      })
      this.setSession(res.data.user, res.data.token)
      return res.data.user
    },

    async login({ identifier, password }) {
      const res = await api.post('/auth.php?action=login', { identifier, password })
      this.setSession(res.data.user, res.data.token)
      return res.data.user
    },

    async loginWithDiscord(code) {
      const res = await api.post('/auth.php?action=discord', { code })
      this.setSession(res.data.user, res.data.token)
      return res.data.user
    },

    async logout() {
      try {
        await api.post('/auth.php?action=logout')
      } finally {
        this.clearSession()
      }
    },

    /** Restores session from a stored token on app boot. */
    async fetchCurrentUser() {
      if (!this.token) {
        this.initializing = false
        return
      }
      try {
        const res = await api.get('/auth.php?action=me')
        this.user = res.data.user
      } catch {
        this.clearSession()
      } finally {
        this.initializing = false
      }
    },
  },
})
