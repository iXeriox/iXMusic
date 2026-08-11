<script setup>
import { onMounted } from 'vue'
import { usePlaylistsStore } from '@/stores/playlists'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import BaseModal from './BaseModal.vue'

const props = defineProps({ track: { type: Object, required: true } })
const emit = defineEmits(['close'])

const playlists = usePlaylistsStore()
const auth = useAuthStore()
const toast = useToastStore()

onMounted(() => {
  if (!playlists.items.length) playlists.fetchAll()
})

async function addTo(playlist) {
  try {
    await playlists.addTrack(playlist.id, props.track)
    emit('close')
  } catch (e) {
    toast.error(e.message)
  }
}

const ownPlaylists = () => playlists.items.filter((p) => p.owner_username === auth.user?.username)
</script>

<template>
  <BaseModal :title="`Add “${track.title}” to playlist`" @close="$emit('close')">
    <div class="list">
      <button
        v-for="p in ownPlaylists()"
        :key="p.id"
        class="playlist-option"
        @click="addTo(p)"
      >
        <span>{{ p.name }}</span>
        <span class="count">{{ p.track_count }} tracks</span>
      </button>
      <p v-if="!ownPlaylists().length" class="empty-hint">
        You don't have any playlists yet. Create one from the sidebar first.
      </p>
    </div>
  </BaseModal>
</template>

<style scoped>
.list { display: flex; flex-direction: column; gap: 4px; max-height: 320px; overflow-y: auto; }
.playlist-option {
  display: flex;
  justify-content: space-between;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  background: transparent;
  border: none;
  color: var(--text-primary);
  font-size: 14px;
  text-align: left;
}
.playlist-option:hover { background: var(--bg-elevated-hover); }
.count { color: var(--text-tertiary); font-size: 12px; }
.empty-hint { color: var(--text-secondary); font-size: 13.5px; }
</style>
