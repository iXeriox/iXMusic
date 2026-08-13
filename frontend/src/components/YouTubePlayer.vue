<script setup>
import { onMounted } from 'vue'
import { usePlayerStore } from '@/stores/player'

const player = usePlayerStore()

onMounted(() => {
  player.mount('yt-player-target')
})
</script>

<template>
  <div style="position: absolute; width: 0; height: 0; overflow: hidden">
    <div id="yt-player-target"></div>
  </div>
</template>
