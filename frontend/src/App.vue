<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AppShell from '@/components/AppShell.vue'
import ToastStack from '@/components/ToastStack.vue'

const route = useRoute()
const auth = useAuthStore()

const showShell = computed(() => !route.meta.guestOnly && auth.isAuthenticated)
</script>

<template>
  <div class="app-root">
    <AppShell v-if="showShell">
      <RouterView />
    </AppShell>
    <RouterView v-else />
    <ToastStack />
  </div>
</template>

<style>
.app-root {
  height: 100%;
}
</style>
