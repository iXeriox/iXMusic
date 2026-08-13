<script setup>
import { computed, ref, watch, nextTick } from 'vue'
import { usePlayerStore } from '@/stores/player'
import { findLyrics, parseSyncedLyrics } from '@/services/lyrics'

const emit = defineEmits(['close'])
const player = usePlayerStore()
const loading = ref(false), error = ref(''), result = ref(null), panel = ref(null)
const lines = computed(() => parseSyncedLyrics(result.value?.syncedLyrics))
const activeIndex = computed(() => lines.value.findLastIndex((line) => line.time <= player.progress + .15))

watch(() => player.currentTrack?.id, load, { immediate: true })
watch(activeIndex, async () => {
  await nextTick()
  panel.value?.querySelector('.lyric.active')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
})

async function load() {
  result.value = null; error.value = ''
  if (!player.currentTrack) return
  loading.value = true
  try { result.value = await findLyrics(player.currentTrack); if (!result.value) error.value = 'No lyrics found for this track.' }
  catch (e) { error.value = e.message }
  finally { loading.value = false }
}
</script>

<template>
  <aside class="lyrics-panel">
    <header><div><span class="kicker">NOW SINGING</span><h2>Lyrics</h2></div><button @click="emit('close')" aria-label="Close lyrics">×</button></header>
    <div ref="panel" class="lyrics-scroll">
      <div v-if="loading" class="lyrics-status"><span class="loader"/>Finding the words…</div>
      <div v-else-if="error" class="lyrics-status"><strong>Instrumental moment.</strong><span>{{ error }}</span></div>
      <template v-else-if="lines.length">
        <button v-for="(line, index) in lines" :key="`${line.time}-${index}`" class="lyric" :class="{ active: index === activeIndex, past: index < activeIndex }" @click="player.seekTo(line.time)">{{ line.text }}</button>
      </template>
      <p v-else class="plain-lyrics">{{ result?.plainLyrics }}</p>
    </div>
    <footer>Lyrics provided by <a href="https://lrclib.net" target="_blank" rel="noreferrer">LRCLIB ↗</a>, an open-source lyrics service.</footer>
  </aside>
</template>

<style scoped>
.lyrics-panel { position: fixed; z-index: 90; top: 12px; bottom: calc(var(--player-h) + 12px); right: 12px; width: min(420px, calc(100vw - 24px)); display: flex; flex-direction: column; border: 1px solid rgba(255,255,255,.09); border-radius: 18px; background: rgba(16,16,22,.96); backdrop-filter: blur(26px); box-shadow: 0 24px 80px rgba(0,0,0,.55); overflow: hidden; }
header { display:flex; justify-content:space-between; align-items:center; padding: 24px 26px 16px; }header button { width:34px;height:34px;border:1px solid var(--border-subtle);border-radius:50%;background:#202028;color:#aaa8b5;font-size:22px; }.kicker { color:var(--accent-soft);font-size:9px;font-weight:800;letter-spacing:.18em; }h2 { margin-top:5px;font-size:23px; }
.lyrics-scroll { flex:1; overflow:auto; padding: 25vh 26px; scroll-behavior:smooth; mask-image:linear-gradient(transparent,#000 12%,#000 88%,transparent); }.lyric { display:block;width:100%;padding:10px 0;border:0;background:none;text-align:left;color:#555460;font:600 23px/1.35 var(--font-display);transition:color .35s,transform .35s,opacity .35s; }.lyric:hover { color:#aaa8b5; }.lyric.past { color:#3e3d47; }.lyric.active { color:#f5f3ff;transform:translateX(6px);text-shadow:0 0 25px rgba(167,139,250,.35); }.plain-lyrics { white-space:pre-line;font:500 19px/1.8 var(--font-display);color:#d4d1dc; }.lyrics-status { min-height:100%;display:flex;flex-direction:column;justify-content:center;align-items:center;gap:10px;color:#696774;text-align:center;font-size:13px; }.lyrics-status strong { color:#ddd9e5;font-size:18px; }.loader { width:24px;height:24px;border:2px solid #33313d;border-top-color:var(--accent);border-radius:50%;animation:spin .7s linear infinite; }footer { padding:14px 26px;color:#565460;border-top:1px solid var(--border-subtle);font-size:10px; }footer a { color:#9b8aff; }@keyframes spin{to{transform:rotate(360deg)}}
</style>
