<script setup>
import { computed } from 'vue'
import { usePlayerStore } from '@/stores/player'
import { useLibraryStore } from '@/stores/library'

const player = usePlayerStore()
const library = useLibraryStore()

const progressPct = computed(() =>
  player.duration ? (player.progress / player.duration) * 100 : 0
)

function formatTime(seconds) {
  if (!seconds || Number.isNaN(seconds)) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

function onSeek(e) {
  const pct = Number(e.target.value)
  player.seekTo((pct / 100) * player.duration)
}

function onVolume(e) {
  player.setVolume(Number(e.target.value))
}

async function toggleLikeCurrent() {
  if (player.currentTrack) await library.toggleLike(player.currentTrack)
}
</script>

<template>
  <footer class="player-bar">
    <div class="now-playing">
      <template v-if="player.currentTrack">
        <img :src="player.currentTrack.thumbnail_url" class="art" alt="" />
        <div class="meta">
          <span class="title">{{ player.currentTrack.title }}</span>
          <span class="artist">{{ player.currentTrack.artist }}</span>
        </div>
        <button class="icon-btn like-btn" :class="{ liked: library.isLiked(player.currentTrack.id) }" @click="toggleLikeCurrent" title="Save to Liked Songs">
          ♥
        </button>
      </template>
      <span v-else class="idle-hint">Nothing playing — pick a track to get started</span>
    </div>

    <div class="controls">
      <div class="transport">
        <button class="icon-btn" :class="{ on: player.shuffle }" @click="player.toggleShuffle()" title="Shuffle">⤨</button>
        <button class="icon-btn" :disabled="!player.hasPrev" @click="player.prev()" title="Previous">⏮</button>
        <button class="play-btn" :disabled="!player.currentTrack" @click="player.toggle()" :title="player.isPlaying ? 'Pause' : 'Play'">
          <span v-if="player.isPlaying">❚❚</span>
          <span v-else>▶</span>
        </button>
        <button class="icon-btn" :disabled="!player.hasNext" @click="player.next()" title="Next">⏭</button>
        <button class="icon-btn" :class="{ on: player.repeatMode !== 'off' }" @click="player.cycleRepeat()" :title="`Repeat: ${player.repeatMode}`">
          {{ player.repeatMode === 'one' ? '🔂' : '🔁' }}
        </button>
      </div>
      <div class="scrubber">
        <span class="time">{{ formatTime(player.progress) }}</span>
        <input
          type="range"
          min="0"
          max="100"
          :value="progressPct"
          @input="onSeek"
          class="seek"
          :disabled="!player.currentTrack"
        />
        <span class="time">{{ formatTime(player.duration) }}</span>
      </div>
    </div>

    <div class="volume">
      <span class="waveform" :class="{ paused: !player.isPlaying }"><span /><span /><span /><span /></span>
      <input type="range" min="0" max="100" :value="player.volume" @input="onVolume" class="seek volume-slider" />
    </div>
  </footer>
</template>

<style scoped>
.player-bar {
  grid-column: 2;
  grid-row: 2;
  background: var(--bg-surface);
  border-top: 1px solid var(--border-subtle);
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  align-items: center;
  padding: 0 20px;
  gap: 16px;
}

.now-playing { display: flex; align-items: center; gap: 12px; min-width: 0; }
.art { width: 52px; height: 52px; border-radius: 6px; object-fit: cover; flex-shrink: 0; }
.meta { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.title { font-size: 13.5px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.artist { font-size: 12px; color: var(--text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.idle-hint { font-size: 13px; color: var(--text-tertiary); }
.like-btn { color: var(--text-tertiary); font-size: 16px; margin-left: 4px; }
.like-btn.liked { color: var(--accent-soft); }

.controls { display: flex; flex-direction: column; align-items: center; gap: 6px; }
.transport { display: flex; align-items: center; gap: 16px; }
.icon-btn {
  background: transparent; border: none; color: var(--text-secondary);
  font-size: 15px; display: flex; align-items: center; justify-content: center;
  width: 28px; height: 28px; border-radius: 6px;
}
.icon-btn:hover:not(:disabled) { color: var(--text-primary); }
.icon-btn:disabled { opacity: 0.35; }
.icon-btn.on { color: var(--accent-soft); }
.play-btn {
  width: 34px; height: 34px; border-radius: 50%; background: var(--text-primary);
  color: var(--bg-void); border: none; display: flex; align-items: center; justify-content: center;
  font-size: 12px;
}
.play-btn:hover:not(:disabled) { transform: scale(1.05); }
.play-btn:disabled { opacity: 0.4; }

.scrubber { display: flex; align-items: center; gap: 8px; width: 100%; max-width: 520px; }
.time { font-size: 11px; color: var(--text-tertiary); width: 32px; text-align: center; flex-shrink: 0; }

.seek {
  -webkit-appearance: none; appearance: none; width: 100%; height: 4px;
  border-radius: 2px; background: var(--bg-elevated-hover); cursor: pointer;
}
.seek::-webkit-slider-thumb {
  -webkit-appearance: none; width: 12px; height: 12px; border-radius: 50%;
  background: var(--text-primary); opacity: 0; transition: opacity 0.15s;
}
.seek:hover::-webkit-slider-thumb { opacity: 1; }

.volume { display: flex; align-items: center; gap: 10px; justify-content: flex-end; }
.volume-slider { width: 90px; }
</style>
