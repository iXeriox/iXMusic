import { computed, ref, watch } from 'vue'

const KEY = 'ixmusic-store-v2'

const defaults = {
  session: null,
  users: [],
  region: null,
  playlists: [],
  liked: [],
  recent: []
}

function readStore() {
  try {
    return { ...structuredClone(defaults), ...JSON.parse(localStorage.getItem(KEY) || '{}') }
  } catch {
    return structuredClone(defaults)
  }
}

export function useAppStore() {
  const state = ref(readStore())
  watch(state, value => localStorage.setItem(KEY, JSON.stringify(value)), { deep: true })

  const user = computed(() => state.value.users.find(item => item.id === state.value.session) || null)

  function register({ name, email, password }) {
    if (state.value.users.some(item => item.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('An account with this email already exists.')
    }
    const account = { id: crypto.randomUUID(), name: name.trim(), email: email.trim(), password }
    state.value.users.push(account)
    state.value.session = account.id
  }

  function login({ email, password }) {
    const account = state.value.users.find(item => item.email.toLowerCase() === email.trim().toLowerCase() && item.password === password)
    if (!account) throw new Error('Email or password is incorrect.')
    state.value.session = account.id
  }

  function loginWithDiscord(profile) {
    let account = state.value.users.find(item => item.discordId === profile.id)
    if (!account) {
      account = {
        id: `discord:${profile.id}`,
        discordId: profile.id,
        name: profile.global_name || profile.username,
        email: profile.email || `${profile.username}@discord`,
        avatar: profile.avatar
          ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png?size=128`
          : null
      }
      state.value.users.push(account)
    } else {
      account.name = profile.global_name || profile.username
      account.email = profile.email || account.email
    }
    state.value.session = account.id
  }

  function logout() { state.value.session = null }
  function setRegion(region) { state.value.region = region }

  function createPlaylist(name) {
    const clean = name.trim()
    if (!clean) return null
    const playlist = { id: crypto.randomUUID(), name: clean, trackIds: [], createdAt: Date.now() }
    state.value.playlists.push(playlist)
    return playlist
  }

  function deletePlaylist(id) {
    state.value.playlists = state.value.playlists.filter(item => item.id !== id)
  }

  function togglePlaylistTrack(playlistId, trackId) {
    const playlist = state.value.playlists.find(item => item.id === playlistId)
    if (!playlist) return
    playlist.trackIds = playlist.trackIds.includes(trackId)
      ? playlist.trackIds.filter(id => id !== trackId)
      : [...playlist.trackIds, trackId]
  }

  function toggleLike(trackId) {
    state.value.liked = state.value.liked.includes(trackId)
      ? state.value.liked.filter(id => id !== trackId)
      : [...state.value.liked, trackId]
  }

  function markPlayed(trackId) {
    state.value.recent = [trackId, ...state.value.recent.filter(id => id !== trackId)].slice(0, 20)
  }

  return { state, user, register, login, loginWithDiscord, logout, setRegion, createPlaylist, deletePlaylist, togglePlaylistTrack, toggleLike, markPlayed }
}
