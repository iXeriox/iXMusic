<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { usePlaylistsStore } from '@/stores/playlists'
import { useLibraryStore } from '@/stores/library'
import { usePlayerStore } from '@/stores/player'

const auth = useAuthStore()
const playlists = usePlaylistsStore()
const library = useLibraryStore()
const player = usePlayerStore()

onMounted(() => {
  playlists.fetchAll()
  library.fetchHistory()
})

function playHistoryTrack(track, idx) {
  player.playQueue(library.history, idx, 'Recently played')
}

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}
</script>

<template>
  <div class="home">
    <h1>{{ greeting() }}, {{ auth.user?.display_name }}</h1>

    <section class="section">
      <h2>Your Playlists</h2>
      <div class="grid">
        <RouterLink
          v-for="p in playlists.items"
          :key="p.id"
          :to="`/playlist/${p.id}`"
          class="playlist-card card"
        >
          <div class="cover">🎵</div>
          <span class="name">{{ p.name }}</span>
          <span class="sub">{{ p.track_count }} tracks</span>
        </RouterLink>
        <RouterLink to="/search" class="playlist-card card create-hint">
          <div class="cover">＋</div>
          <span class="name">Find something to play</span>
          <span class="sub">Search YouTube</span>
        </RouterLink>
      </div>
    </section>

    <section class="section" v-if="library.history.length">
      <h2>Recently Played</h2>
      <div class="grid">
        <button
          v-for="(t, idx) in library.history.slice(0, 8)"
          :key="t.id"
          class="track-card card"
          @click="playHistoryTrack(t, idx)"
        >
          <img :src="t.thumbnail_url" alt="" />
          <span class="name">{{ t.title }}</span>
          <span class="sub">{{ t.artist }}</span>
        </button>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home { display: flex; flex-direction: column; gap: 36px; }
h1 { font-size: 26px; margin-bottom: 4px; }
.section h2 { font-size: 18px; margin-bottom: 14px; }

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 16px;
}

.playlist-card, .track-card {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 14px;
  text-align: left;
  border: 1px solid var(--border-subtle);
  background: var(--bg-surface);
}
.playlist-card:hover, .track-card:hover { background: var(--bg-elevated); border-color: var(--accent-dim); }

.cover {
  width: 100%;
  aspect-ratio: 1;
  border-radius: var(--radius-sm);
  background: linear-gradient(135deg, var(--accent-dim), var(--bg-elevated-hover));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  margin-bottom: 6px;
}
.track-card img {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: var(--radius-sm);
  margin-bottom: 6px;
}
.create-hint .cover { opacity: 0.7; }

.name { font-size: 14px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.sub { font-size: 12.5px; color: var(--text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
</style>
