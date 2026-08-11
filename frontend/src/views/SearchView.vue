<script setup>
import { ref } from 'vue'
import { useSearchStore } from '@/stores/search'
import { usePlayerStore } from '@/stores/player'
import TrackRow from '@/components/TrackRow.vue'
import AddToPlaylistModal from '@/components/AddToPlaylistModal.vue'

const search = useSearchStore()
const player = usePlayerStore()
const query = ref('')
const trackForModal = ref(null)
let debounceTimer = null

function onInput() {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => search.run(query.value), 400)
}

// Search results don't have a stable numeric `id` yet (not persisted until
// they're actually added/liked/played) — use the video id as a stand-in key.
function withKey(track) {
  return { ...track, id: track.id ?? track.youtube_video_id }
}
</script>

<template>
  <div class="search-view">
    <div class="search-box">
      <input
        v-model="query"
        @input="onInput"
        class="input search-input"
        placeholder="Search for songs, artists…"
        autofocus
      />
    </div>

    <p v-if="search.error" class="error-msg">{{ search.error }}</p>

    <div v-if="search.loading" class="empty-state">
      <p>Searching YouTube…</p>
    </div>

    <div v-else-if="search.results.length" class="results">
      <TrackRow
        v-for="t in search.results"
        :key="t.youtube_video_id"
        :track="withKey(t)"
        :queue="search.results.map(withKey)"
        queue-name="Search results"
        @add-to-playlist="trackForModal = $event"
      />
    </div>

    <div v-else-if="search.query" class="empty-state">
      <h3>No results</h3>
      <p>Try a different search term.</p>
    </div>

    <div v-else class="empty-state">
      <h3>Search YouTube for anything</h3>
      <p>Every result plays right in the app — add it to a playlist or your Liked Songs.</p>
    </div>

    <AddToPlaylistModal v-if="trackForModal" :track="trackForModal" @close="trackForModal = null" />
  </div>
</template>

<style scoped>
.search-view { display: flex; flex-direction: column; gap: 20px; }
.search-input { max-width: 420px; }
.results { display: flex; flex-direction: column; }
.error-msg { color: var(--danger); font-size: 13.5px; }
</style>
