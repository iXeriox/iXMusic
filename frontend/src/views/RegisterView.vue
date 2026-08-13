<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'

const username = ref('')
const email = ref('')
const displayName = ref('')
const password = ref('')
const loading = ref(false)
const errorMsg = ref('')

const auth = useAuthStore()
const router = useRouter()
const toast = useToastStore()

async function submit() {
  errorMsg.value = ''
  loading.value = true
  try {
    await auth.register({
      username: username.value.trim(),
      email: email.value.trim(),
      displayName: displayName.value.trim(),
      password: password.value,
    })
    toast.success('Account created — welcome to Wavelength!')
    router.push('/')
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
      <p class="tagline">Create your account.</p>

      <form @submit.prevent="submit" class="form">
        <label class="field">
          <span>Username</span>
          <input v-model="username" class="input" autocomplete="username" required />
        </label>
        <label class="field">
          <span>Display name</span>
          <input v-model="displayName" class="input" placeholder="How others see you" />
        </label>
        <label class="field">
          <span>Email</span>
          <input v-model="email" type="email" class="input" autocomplete="email" required />
        </label>
        <label class="field">
          <span>Password</span>
          <input v-model="password" type="password" class="input" autocomplete="new-password" minlength="8" required />
        </label>
        <p v-if="errorMsg" class="error-msg">{{ errorMsg }}</p>
        <button type="submit" class="btn btn-primary" :disabled="loading">
          {{ loading ? 'Creating account…' : 'Create account' }}
        </button>
      </form>

      <p class="switch">
        Already have an account? <RouterLink to="/login">Log in</RouterLink>
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
