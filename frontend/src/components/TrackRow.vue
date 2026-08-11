<script setup>
import { computed } from 'vue'
import { usePlayerStore } from '@/stores/player'
import { useLibraryStore } from '@/stores/library'

const props = defineProps({
  track: { type: Object, required: true },
  index: { type: Number, default: null },
  queue: { type: Array, default: () => [] },
  queueName: { type: String, default: '' },
  showRemove: { type: Boolean, default: false },
})
const emit = defineEmits(['add-to-playlist', 'remove'])

const player = usePlayerStore()
const library = useLibraryStore()

const isCurrent = computed(() => player.currentTrack?.youtube_video_id === props.track.youtube_video_id)

function playThis() {
  const list = props.queue.length ? props.queue : [props.track]
  const idx = list.findIndex((t) => t.youtube_video_id === props.track.youtube_video_id)
  player.playQueue(list, idx >= 0 ? idx : 0, props.queueName)
}

function formatDuration(sec) {
  if (!sec) return '--:--'
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}
</script>

<template>
  <div class="track-row" :class="{ current: isCurrent }" @dblclick="playThis">
    <div class="index-or-wave" @click="playThis">
      <span v-if="isCurrent && player.isPlaying" class="waveform"><span /><span /><span /><span /></span>
      <span v-else-if="index !== null">{{ index + 1 }}</span>
      <button v-else class="play-hover">▶</button>
    </div>

    <img :src="track.thumbnail_url" class="thumb" alt="" />

    <div class="meta">
      <span class="title" :class="{ accent: isCurrent }">{{ track.title }}</span>
      <span class="artist">{{ track.artist }}</span>
    </div>

    <button class="icon-btn like" :class="{ liked: library.isLiked(track.id) }" @click="library.toggleLike(track)" title="Save to Liked Songs">♥</button>
    <button class="icon-btn" @click="$emit('add-to-playlist', track)" title="Add to playlist">+</button>
    <span class="duration">{{ formatDuration(track.duration_seconds) }}</span>
    <button v-if="showRemove" class="icon-btn remove" @click="$emit('remove', track)" title="Remove">✕</button>
  </div>
</template>

<style scoped>
.track-row {
  display: grid;
  grid-template-columns: 28px 40px 1fr 28px 28px 48px 28px;
  align-items: center;
  gap: 12px;
  padding: 8px 10px;
  border-radius: var(--radius-sm);
}
.track-row:hover { background: var(--bg-elevated); }
.track-row.current .title { color: var(--accent-soft); }

.index-or-wave {
  color: var(--text-tertiary);
  font-size: 13px;
  text-align: center;
  cursor: pointer;
}
.play-hover { background: none; border: none; color: var(--text-primary); font-size: 11px; opacity: 0; }
.track-row:hover .play-hover { opacity: 1; }

.thumb { width: 40px; height: 40px; border-radius: 4px; object-fit: cover; }

.meta { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.title { font-size: 14px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.artist { font-size: 12.5px; color: var(--text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.icon-btn {
  background: transparent; border: none; color: var(--text-tertiary);
  font-size: 14px; width: 26px; height: 26px; border-radius: 6px;
  opacity: 0; transition: opacity 0.1s;
}
.track-row:hover .icon-btn, .icon-btn.liked { opacity: 1; }
.icon-btn:hover { color: var(--text-primary); background: var(--bg-elevated-hover); }
.icon-btn.liked { color: var(--accent-soft); }
.icon-btn.remove:hover { color: var(--danger); }

.duration { font-size: 12.5px; color: var(--text-tertiary); text-align: right; }
</style>
