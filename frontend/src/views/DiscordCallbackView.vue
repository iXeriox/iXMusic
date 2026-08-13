<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const message = ref('Tuning your account…')

onMounted(async () => {
  const code = route.query.code
  const state = route.query.state
  const expectedState = sessionStorage.getItem('discord_oauth_state')
  sessionStorage.removeItem('discord_oauth_state')

  if (!code || !state || state !== expectedState) {
    message.value = 'This Discord login link is invalid or has expired.'
    return
  }
  try {
    await auth.loginWithDiscord(code)
    router.replace(sessionStorage.getItem('auth_redirect') || '/')
    sessionStorage.removeItem('auth_redirect')
  } catch (error) {
    message.value = error.message || 'We could not sign you in with Discord.'
  }
})
</script>

<template>
  <main class="callback-screen">
    <div class="callback-mark"><span /><span /><span /></div>
    <h1>{{ message }}</h1>
    <RouterLink v-if="message.includes('invalid') || message.includes('could not')" to="/login" class="btn btn-ghost">Back to login</RouterLink>
  </main>
</template>

<style scoped>
.callback-screen { min-height: 100%; display: grid; place-content: center; justify-items: center; gap: 20px; background: var(--bg-void); }
h1 { font-size: 18px; font-weight: 500; color: var(--text-secondary); }
.callback-mark { display: flex; gap: 5px; align-items: end; height: 36px; }
.callback-mark span { width: 6px; border-radius: 8px; background: var(--accent); animation: pulse .8s ease-in-out infinite alternate; }
.callback-mark span:nth-child(1) { height: 45%; }.callback-mark span:nth-child(2) { height: 100%; animation-delay: -.3s }.callback-mark span:nth-child(3) { height: 65%; animation-delay: -.6s }
@keyframes pulse { to { transform: scaleY(.45); opacity: .5; } }
</style>
