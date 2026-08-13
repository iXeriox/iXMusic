import { computed, ref } from 'vue'
import { api } from '../services/api'

const state = ref({ session: null, region: localStorage.getItem('ixmusic_region'), playlists: [], liked: [], recent: [] })
const user = computed(() => state.value.session ? { ...state.value.session, name: state.value.session.name || state.value.session.display_name } : null)

function normalizeTrack(track) {
  return { ...track, video: track.video || track.youtube_video_id, cover: track.cover || track.thumbnail_url, duration: track.duration || (track.duration_seconds ? `${Math.floor(track.duration_seconds / 60)}:${String(track.duration_seconds % 60).padStart(2, '0')}` : '') }
}
function trackPayload(track) {
  return { youtube_video_id: track.video || track.youtube_video_id, title: track.title, artist: track.artist, thumbnail_url: track.cover || track.thumbnail_url, duration_seconds: track.duration_seconds || null }
}
function normalizePlaylist(item) {
  return { ...item, trackIds: (item.tracks || []).map(track => track.youtube_video_id), tracks: (item.tracks || []).map(normalizeTrack) }
}

export function useAppStore() {
  async function initialize() {
    if (!localStorage.getItem('ixmusic_token')) return
    try {
      const [auth, playlistData, likedData, historyData] = await Promise.all([
        api('/auth.php?action=me'), api('/playlists.php'), api('/tracks.php?action=liked'), api('/tracks.php?action=history')
      ])
      state.value.session = auth.user
      state.value.playlists = await Promise.all(playlistData.playlists.map(async item => {
        try { return normalizePlaylist((await api(`/playlists.php?id=${item.id}`)).playlist) }
        catch { return normalizePlaylist(item) }
      }))
      state.value.liked = likedData.tracks.map(track => track.youtube_video_id)
      state.value.recent = historyData.tracks.map(normalizeTrack)
    } catch { localStorage.removeItem('ixmusic_token'); state.value.session = null }
  }

  async function completeDiscordLogin(code) {
    const data = await api('/auth.php?action=discord', { method: 'POST', body: { code } })
    localStorage.setItem('ixmusic_token', data.token)
    state.value.session = data.user
    await initialize()
  }
  async function logout() { try { await api('/auth.php?action=logout', { method: 'POST' }) } finally { localStorage.removeItem('ixmusic_token'); state.value.session = null } }
  function setRegion(region) { state.value.region = region; localStorage.setItem('ixmusic_region', region) }
  async function createPlaylist(name) { const data = await api('/playlists.php', { method: 'POST', body: { name } }); const item = normalizePlaylist(data.playlist); state.value.playlists.unshift(item); return item }
  async function deletePlaylist(id) { await api(`/playlists.php?id=${id}`, { method: 'DELETE' }); state.value.playlists = state.value.playlists.filter(item => item.id !== id) }
  async function togglePlaylistTrack(playlistId, track) {
    const playlist = state.value.playlists.find(item => item.id === playlistId); if (!playlist) return
    const videoId = track.video || track.youtube_video_id
    if (playlist.trackIds.includes(videoId)) {
      const stored = playlist.tracks.find(item => item.youtube_video_id === videoId)
      if (!stored?.id) return
      await api(`/playlists.php?id=${playlistId}&action=remove_track&track_id=${stored.id}`, { method: 'DELETE' })
    } else await api(`/playlists.php?id=${playlistId}&action=add_track`, { method: 'POST', body: trackPayload(track) })
    const data = await api(`/playlists.php?id=${playlistId}`); Object.assign(playlist, normalizePlaylist(data.playlist))
  }
  async function toggleLike(track) {
    const videoId = track.video || track.youtube_video_id
    if (state.value.liked.includes(videoId)) {
      const data = await api('/tracks.php?action=liked'); const stored = data.tracks.find(item => item.youtube_video_id === videoId)
      if (stored) await api(`/tracks.php?action=unlike&track_id=${stored.id}`, { method: 'DELETE' })
      state.value.liked = state.value.liked.filter(id => id !== videoId)
    } else { await api('/tracks.php?action=like', { method: 'POST', body: trackPayload(track) }); state.value.liked.push(videoId) }
  }
  async function markPlayed(track) { await api('/tracks.php?action=play', { method: 'POST', body: trackPayload(track) }); state.value.recent = [track, ...state.value.recent.filter(item => item.video !== track.video)].slice(0, 20) }
  return { state, user, initialize, completeDiscordLogin, logout, setRegion, createPlaylist, deletePlaylist, togglePlaylistTrack, toggleLike, markPlayed }
}
