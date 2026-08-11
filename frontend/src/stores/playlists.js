import { defineStore } from 'pinia'
import api from '@/services/api'
import { useToastStore } from './toast'

export const usePlaylistsStore = defineStore('playlists', {
  state: () => ({
    items: [],
    active: null, // full playlist detail, including tracks, currently open
    loading: false,
  }),

  actions: {
    async fetchAll() {
      this.loading = true
      try {
        const res = await api.get('/playlists.php')
        this.items = res.data.playlists
      } finally {
        this.loading = false
      }
    },

    async fetchOne(id) {
      const res = await api.get(`/playlists.php?id=${id}`)
      this.active = res.data.playlist
      return this.active
    },

    async create({ name, description = '', isPublic = false }) {
      const res = await api.post('/playlists.php', { name, description, is_public: isPublic })
      this.items.unshift(res.data.playlist)
      useToastStore().success(`Created "${name}"`)
      return res.data.playlist
    },

    async update(id, changes) {
      const res = await api.put(`/playlists.php?id=${id}`, changes)
      this._syncListEntry(res.data.playlist)
      if (this.active?.id === id) this.active = res.data.playlist
      useToastStore().success('Playlist updated')
      return res.data.playlist
    },

    async remove(id) {
      await api.delete(`/playlists.php?id=${id}`)
      this.items = this.items.filter((p) => p.id !== id)
      if (this.active?.id === id) this.active = null
      useToastStore().success('Playlist deleted')
    },

    async addTrack(playlistId, track) {
      const res = await api.post(`/playlists.php?id=${playlistId}&action=add_track`, {
        youtube_video_id: track.youtube_video_id,
        title: track.title,
        artist: track.artist,
        thumbnail_url: track.thumbnail_url,
        duration_seconds: track.duration_seconds ?? null,
      })
      if (this.active?.id === playlistId) this.active.tracks = res.data.tracks
      useToastStore().success(`Added to playlist`)
      return res.data.tracks
    },

    async removeTrack(playlistId, trackId) {
      const res = await api.delete(
        `/playlists.php?id=${playlistId}&action=remove_track&track_id=${trackId}`
      )
      if (this.active?.id === playlistId) this.active.tracks = res.data.tracks
    },

    async reorder(playlistId, trackIds) {
      const res = await api.put(`/playlists.php?id=${playlistId}&action=reorder`, {
        track_ids: trackIds,
      })
      if (this.active?.id === playlistId) this.active.tracks = res.data.tracks
    },

    _syncListEntry(playlist) {
      const idx = this.items.findIndex((p) => p.id === playlist.id)
      if (idx >= 0) this.items[idx] = { ...this.items[idx], ...playlist }
    },
  },
})
