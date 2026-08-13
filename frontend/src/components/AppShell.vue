<script setup>
import Sidebar from './Sidebar.vue'
import TopBar from './TopBar.vue'
import PlayerBar from './PlayerBar.vue'
import YouTubePlayer from './YouTubePlayer.vue'
</script>

<template>
  <div class="shell">
    <Sidebar />
    <div class="shell-main">
      <TopBar />
      <div class="shell-content">
        <slot />
      </div>
    </div>
    <PlayerBar />
    <YouTubePlayer />
  </div>
</template>

<style scoped>
.shell {
  display: grid;
  grid-template-columns: var(--sidebar-w) 1fr;
  grid-template-rows: 1fr var(--player-h);
  height: 100%;
}
.shell-main {
  grid-column: 2;
  grid-row: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  background: radial-gradient(circle at 72% -10%, rgba(124,92,255,.14), transparent 34%), linear-gradient(180deg, var(--bg-surface) 0%, var(--bg-void) 360px);
}
.shell-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px 32px 40px;
}
</style>
