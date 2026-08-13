<script setup>
import { onMounted, ref } from 'vue'
import { useLibraryStore } from '@/stores/library'
import TrackRow from '@/components/TrackRow.vue'
import AddToPlaylistModal from '@/components/AddToPlaylistModal.vue'

const library = useLibraryStore()
const trackForModal = ref(null)

onMounted(() => {
  library.fetchLiked()
})
</script>

<template>
  <div class="library-view">
    <div class="header">
      <div class="cover">♥</div>
      <div>
        <span class="eyebrow">Playlist</span>
        <h1>Liked Songs</h1>
        <span class="sub">{{ library.liked.length }} songs</span>
      </div>
    </div>

    <div v-if="library.loading" class="empty-state"><p>Loading…</p></div>

    <div v-else-if="library.liked.length" class="results">
      <TrackRow
        v-for="(t, idx) in library.liked"
        :key="t.id"
        :track="t"
        :index="idx"
        :queue="library.liked"
        queue-name="Liked Songs"
        @add-to-playlist="trackForModal = $event"
      />
    </div>

    <div v-else class="empty-state">
      <h3>Songs you like will show up here</h3>
      <p>Tap the heart on any track to save it to your library.</p>
    </div>

    <AddToPlaylistModal v-if="trackForModal" :track="trackForModal" @close="trackForModal = null" />
  </div>
</template>

<style scoped>
.library-view { display: flex; flex-direction: column; gap: 24px; }
.header { display: flex; align-items: flex-end; gap: 20px; }
.cover {
  width: 120px; height: 120px; border-radius: var(--radius-md);
  background: linear-gradient(135deg, var(--accent), var(--accent-dim));
  display: flex; align-items: center; justify-content: center; font-size: 44px; color: white;
  flex-shrink: 0;
}
.eyebrow { font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-secondary); }
h1 { font-size: 34px; margin: 4px 0; }
.sub { font-size: 13px; color: var(--text-secondary); }
.results { display: flex; flex-direction: column; }
</style>
