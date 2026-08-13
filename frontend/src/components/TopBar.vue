<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()
</script>

<template>
  <header class="topbar">
    <div class="nav-arrows">
      <button class="round-btn" @click="router.go(-1)" title="Back">‹</button>
      <button class="round-btn" @click="router.go(1)" title="Forward">›</button>
    </div>
  </header>
</template>

<style scoped>
.topbar {
  height: var(--topbar-h);
  display: flex;
  align-items: center;
  padding: 0 32px;
  flex-shrink: 0;
}
.nav-arrows { display: flex; gap: 8px; }
.round-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: rgba(0,0,0,0.4);
  color: var(--text-primary);
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.round-btn:hover { background: var(--bg-elevated-hover); }
</style>
