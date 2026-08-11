<script setup>
import { onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { usePlaylistsStore } from '@/stores/playlists'
import { useSearchStore } from '@/stores/search'
import { useAuthStore } from '@/stores/auth'
import { usePlayerStore } from '@/stores/player'
import { useToastStore } from '@/stores/toast'
import TrackRow from '@/components/TrackRow.vue'

const props = defineProps({ id: { type: [String, Number], required: true } })
const playlists = usePlaylistsStore()
const search = useSearchStore()
const auth = useAuthStore()
const player = usePlayerStore()
const toast = useToastStore()
const router = useRouter()

const addQuery = ref('')
const showAddPanel = ref(false)
const editingName = ref(false)
const nameDraft = ref('')
let debounceTimer = null

async function load() {
  await playlists.fetchOne(props.id)
  nameDraft.value = playlists.active?.name || ''
}

onMounted(load)
watch(() => props.id, load)

function canEdit() {
  const p = playlists.active
  if (!p) return false
  return p.owner_username === auth.user?.username || auth.isModerator
}

function onAddInput() {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => search.run(addQuery.value), 400)
}

async function addTrack(track) {
  try {
    await playlists.addTrack(props.id, track)
  } catch (e) {
    toast.error(e.message)
  }
}

async function removeTrack(track) {
  await playlists.removeTrack(props.id, track.id)
}

function playAll(startIndex = 0) {
  if (!playlists.active?.tracks?.length) return
  player.playQueue(playlists.active.tracks, startIndex, playlists.active.name)
}

async function saveName() {
  if (!nameDraft.value.trim()) return
  await playlists.update(props.id, { name: nameDraft.value.trim() })
  editingName.value = false
}

async function togglePublic() {
  await playlists.update(props.id, { is_public: !playlists.active.is_public })
}

async function deletePlaylist() {
  if (!confirm(`Delete "${playlists.active.name}"? This can't be undone.`)) return
  await playlists.remove(props.id)
  router.push('/')
}
</script>

<template>
  <div v-if="playlists.active" class="playlist-view">
    <div class="header">
      <div class="cover">🎵</div>
      <div class="header-meta">
        <span class="eyebrow">{{ playlists.active.is_public ? 'Public playlist' : 'Private playlist' }}</span>
        <div v-if="editingName" class="name-edit">
          <input v-model="nameDraft" class="input" @keyup.enter="saveName" />
          <button class="btn btn-primary" @click="saveName">Save</button>
        </div>
        <h1 v-else @dblclick="canEdit() && (editingName = true)">{{ playlists.active.name }}</h1>
        <p v-if="playlists.active.description" class="description">{{ playlists.active.description }}</p>
        <span class="sub">By {{ playlists.active.owner_username }} · {{ playlists.active.tracks.length }} songs</span>
      </div>
    </div>

    <div class="actions">
      <button class="play-all-btn" :disabled="!playlists.active.tracks.length" @click="playAll()">▶ Play</button>
      <button class="btn btn-ghost" @click="showAddPanel = !showAddPanel">{{ showAddPanel ? 'Close' : '+ Add tracks' }}</button>
      <template v-if="canEdit()">
        <button class="btn btn-text" @click="togglePublic">
          Make {{ playlists.active.is_public ? 'private' : 'public' }}
        </button>
        <button class="btn btn-danger" @click="deletePlaylist">Delete</button>
      </template>
    </div>

    <div v-if="showAddPanel" class="add-panel card">
      <input v-model="addQuery" @input="onAddInput" class="input" placeholder="Search YouTube to add a track…" autofocus />
      <div v-if="search.loading" class="hint">Searching…</div>
      <div v-else class="add-results">
        <div v-for="t in search.results" :key="t.youtube_video_id" class="add-result-row">
          <img :src="t.thumbnail_url" alt="" />
          <div class="meta">
            <span class="title">{{ t.title }}</span>
            <span class="artist">{{ t.artist }}</span>
          </div>
          <button class="btn btn-text" @click="addTrack(t)">+ Add</button>
        </div>
      </div>
    </div>

    <div v-if="playlists.active.tracks.length" class="results">
      <TrackRow
        v-for="(t, idx) in playlists.active.tracks"
        :key="t.id"
        :track="t"
        :index="idx"
        :queue="playlists.active.tracks"
        :queue-name="playlists.active.name"
        :show-remove="canEdit()"
        @add-to-playlist="() => {}"
        @remove="removeTrack"
      />
    </div>
    <div v-else class="empty-state">
      <h3>This playlist is empty</h3>
      <p>Use "Add tracks" above to search YouTube and start building it.</p>
    </div>
  </div>
</template>

<style scoped>
.playlist-view { display: flex; flex-direction: column; gap: 20px; }
.header { display: flex; align-items: flex-end; gap: 20px; }
.cover {
  width: 140px; height: 140px; border-radius: var(--radius-md);
  background: linear-gradient(135deg, var(--accent-dim), var(--bg-elevated-hover));
  display: flex; align-items: center; justify-content: center; font-size: 48px;
  flex-shrink: 0;
}
.header-meta { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.eyebrow { font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-secondary); }
h1 { font-size: 32px; margin: 2px 0; cursor: text; }
.description { color: var(--text-secondary); font-size: 13.5px; }
.sub { font-size: 13px; color: var(--text-secondary); }
.name-edit { display: flex; gap: 8px; align-items: center; margin: 4px 0; }
.name-edit .input { font-size: 20px; padding: 8px 10px; max-width: 320px; }

.actions { display: flex; align-items: center; gap: 10px; }
.play-all-btn {
  width: 46px; height: 46px; border-radius: 50%; background: var(--accent);
  color: white; border: none; font-size: 14px;
}
.play-all-btn:hover:not(:disabled) { background: var(--accent-soft); }
.play-all-btn:disabled { opacity: 0.4; }

.add-panel { padding: 16px; display: flex; flex-direction: column; gap: 12px; }
.add-results { display: flex; flex-direction: column; gap: 2px; max-height: 280px; overflow-y: auto; }
.add-result-row { display: flex; align-items: center; gap: 10px; padding: 6px; border-radius: var(--radius-sm); }
.add-result-row:hover { background: var(--bg-elevated-hover); }
.add-result-row img { width: 36px; height: 36px; border-radius: 4px; object-fit: cover; }
.add-result-row .meta { flex: 1; display: flex; flex-direction: column; min-width: 0; }
.add-result-row .title { font-size: 13.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.add-result-row .artist { font-size: 12px; color: var(--text-secondary); }
.hint { color: var(--text-secondary); font-size: 13px; }

.results { display: flex; flex-direction: column; }
</style>
