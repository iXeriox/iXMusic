<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()
</script>

<template>
  <div class="not-found">
    <span class="waveform paused"><span /><span /><span /><span /></span>
    <h1>404</h1>
    <p>This page doesn't exist.</p>
    <button class="btn btn-primary" @click="router.push('/')">Back to home</button>
  </div>
</template>

<style scoped>
.not-found {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: var(--text-secondary);
}
h1 { font-size: 48px; color: var(--text-primary); }
</style>
