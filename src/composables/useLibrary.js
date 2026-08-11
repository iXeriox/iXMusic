import { computed, ref, watch } from 'vue'

const STORAGE_KEY = 'pulse-library-v1'

const seed = {
  playlists: [
    { id: 'liked', name: 'Liked Songs', description: 'Your saved favorites', trackIds: [1, 3] },
    { id: 'discoveries', name: 'Discoveries', description: 'New sounds worth keeping', trackIds: [2, 4] },
    { id: 'road-trip', name: 'Road Trip', description: 'Windows down, volume up', trackIds: [1, 5] },
    { id: 'sunday', name: 'Sunday Morning', description: 'A slow start', trackIds: [2, 3] },
    { id: 'workout', name: 'Workout Energy', description: 'Keep moving', trackIds: [4, 5] }
  ],
  users: [
    { id: 1, name: 'Alex Johnson', email: 'alex@pulse.music', role: 'Admin', active: true },
    { id: 2, name: 'Maya Chen', email: 'maya@example.com', role: 'Listener', active: true },
    { id: 3, name: 'Noah Williams', email: 'noah@example.com', role: 'Curator', active: true },
    { id: 4, name: 'Sofia Rossi', email: 'sofia@example.com', role: 'Listener', active: false }
  ]
}

function loadState() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? { ...seed, ...JSON.parse(stored) } : structuredClone(seed)
  } catch {
    return structuredClone(seed)
  }
}

export function useLibrary() {
  const state = ref(loadState())
  watch(state, value => localStorage.setItem(STORAGE_KEY, JSON.stringify(value)), { deep: true })

  const playlists = computed(() => state.value.playlists)
  const users = computed(() => state.value.users)

  function createPlaylist(name, description = '') {
    const cleanName = name.trim()
    if (!cleanName) return null
    const playlist = { id: `${Date.now()}`, name: cleanName, description: description.trim(), trackIds: [] }
    state.value.playlists.push(playlist)
    return playlist
  }

  function deletePlaylist(id) {
    state.value.playlists = state.value.playlists.filter(playlist => playlist.id !== id)
  }

  function toggleTrack(playlistId, trackId) {
    const playlist = state.value.playlists.find(item => item.id === playlistId)
    if (!playlist) return
    playlist.trackIds = playlist.trackIds.includes(trackId)
      ? playlist.trackIds.filter(id => id !== trackId)
      : [...playlist.trackIds, trackId]
  }

  function addUser(user) {
    state.value.users.push({ id: Date.now(), ...user, active: true })
  }

  function toggleUser(id) {
    const user = state.value.users.find(item => item.id === id)
    if (user) user.active = !user.active
  }

  function removeUser(id) {
    state.value.users = state.value.users.filter(user => user.id !== id)
  }

  return { playlists, users, createPlaylist, deletePlaylist, toggleTrack, addUser, toggleUser, removeUser }
}
