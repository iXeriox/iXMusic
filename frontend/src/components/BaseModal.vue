<script setup>
defineProps({ title: { type: String, default: '' } })
defineEmits(['close'])
</script>

<template>
  <div class="backdrop" @click.self="$emit('close')">
    <div class="panel card">
      <div class="panel-header">
        <h3>{{ title }}</h3>
        <button class="close-btn" @click="$emit('close')">✕</button>
      </div>
      <div class="panel-body">
        <slot />
      </div>
    </div>
  </div>
</template>

<style scoped>
.backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}
.panel {
  width: 420px;
  max-width: 90vw;
  max-height: 80vh;
  overflow-y: auto;
  padding: 20px;
}
.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
.close-btn {
  background: transparent;
  border: none;
  color: var(--text-secondary);
  font-size: 14px;
  width: 26px;
  height: 26px;
  border-radius: 6px;
}
.close-btn:hover { background: var(--bg-elevated-hover); color: var(--text-primary); }
</style>
