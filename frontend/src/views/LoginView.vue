<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'

const identifier = ref('')
const password = ref('')
const loading = ref(false)
const errorMsg = ref('')

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()
const toast = useToastStore()

async function submit() {
  errorMsg.value = ''
  loading.value = true
  try {
    await auth.login({ identifier: identifier.value.trim(), password: password.value })
    toast.success('Welcome back!')
    router.push(route.query.redirect || '/')
  } catch (e) {
    errorMsg.value = e.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="auth-screen">
    <div class="auth-card card">
      <div class="brand-lockup">
        <span class="waveform"><span /><span /><span /><span /></span>
        <h1>Wavelength</h1>
      </div>
      <p class="tagline">Sign in to keep the music going.</p>

      <form @submit.prevent="submit" class="form">
        <label class="field">
          <span>Username or email</span>
          <input v-model="identifier" class="input" autocomplete="username" required />
        </label>
        <label class="field">
          <span>Password</span>
          <input v-model="password" type="password" class="input" autocomplete="current-password" required />
        </label>
        <p v-if="errorMsg" class="error-msg">{{ errorMsg }}</p>
        <button type="submit" class="btn btn-primary" :disabled="loading">
          {{ loading ? 'Signing in…' : 'Log in' }}
        </button>
      </form>

      <p class="switch">
        New here? <RouterLink to="/register">Create an account</RouterLink>
      </p>
    </div>
  </div>
</template>

<style scoped>
.auth-screen {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle at 50% 0%, var(--accent-dim) 0%, var(--bg-void) 60%);
}
.auth-card { width: 380px; padding: 32px; }
.brand-lockup { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; }
.brand-lockup h1 { font-size: 22px; }
.tagline { color: var(--text-secondary); font-size: 14px; margin-bottom: 24px; }
.form { display: flex; flex-direction: column; gap: 14px; }
.field { display: flex; flex-direction: column; gap: 6px; font-size: 13px; color: var(--text-secondary); }
.error-msg { color: var(--danger); font-size: 13px; }
.switch { margin-top: 20px; text-align: center; font-size: 13.5px; color: var(--text-secondary); }
.switch a { color: var(--accent-soft); font-weight: 600; }
</style>
