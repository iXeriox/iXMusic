<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { usePlaylistsStore } from '@/stores/playlists'
import { useToastStore } from '@/stores/toast'
import BaseModal from './BaseModal.vue'

const emit = defineEmits(['close'])
const playlists = usePlaylistsStore()
const router = useRouter()
const toast = useToastStore()

const name = ref('')
const description = ref('')
const isPublic = ref(false)
const saving = ref(false)

async function submit() {
  if (!name.value.trim()) return
  saving.value = true
  try {
    const playlist = await playlists.create({
      name: name.value.trim(),
      description: description.value.trim(),
      isPublic: isPublic.value,
    })
    emit('close')
    router.push(`/playlist/${playlist.id}`)
  } catch (e) {
    toast.error(e.message)
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <BaseModal title="Create playlist" @close="$emit('close')">
    <form @submit.prevent="submit" class="form">
      <label class="field">
        <span>Name</span>
        <input v-model="name" class="input" placeholder="My New Playlist" autofocus />
      </label>
      <label class="field">
        <span>Description (optional)</span>
        <textarea v-model="description" class="input" rows="2" placeholder="What's this playlist about?" />
      </label>
      <label class="check-field">
        <input type="checkbox" v-model="isPublic" />
        <span>Make this playlist public</span>
      </label>
      <button type="submit" class="btn btn-primary" :disabled="!name.trim() || saving">
        {{ saving ? 'Creating…' : 'Create playlist' }}
      </button>
    </form>
  </BaseModal>
</template>

<style scoped>
.form { display: flex; flex-direction: column; gap: 14px; }
.field { display: flex; flex-direction: column; gap: 6px; font-size: 13px; color: var(--text-secondary); }
.check-field { display: flex; align-items: center; gap: 8px; font-size: 13.5px; color: var(--text-secondary); }
textarea.input { resize: vertical; }
</style>
