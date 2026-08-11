import { defineStore } from 'pinia'
import api from '@/services/api'
import { useToastStore } from './toast'

export const useLibraryStore = defineStore('library', {
  state: () => ({
    liked: [],
    history: [],
    loading: false,
  }),

  getters: {
    likedIds: (state) => new Set(state.liked.map((t) => t.id)),
    isLiked: (state) => (trackId) => state.liked.some((t) => t.id === trackId),
  },

  actions: {
    async fetchLiked() {
      this.loading = true
      try {
        const res = await api.get('/tracks.php?action=liked')
        this.liked = res.data.tracks
      } finally {
        this.loading = false
      }
    },

    async fetchHistory() {
      const res = await api.get('/tracks.php?action=history')
      this.history = res.data.tracks
    },

    async like(track) {
      await api.post('/tracks.php?action=like', {
        track_id: track.id,
        youtube_video_id: track.youtube_video_id,
        title: track.title,
        artist: track.artist,
        thumbnail_url: track.thumbnail_url,
      })
      if (!this.liked.some((t) => t.youtube_video_id === track.youtube_video_id)) {
        this.liked.unshift(track)
      }
      useToastStore().success('Added to Liked Songs')
    },

    async unlike(trackId) {
      await api.delete(`/tracks.php?action=unlike&track_id=${trackId}`)
      this.liked = this.liked.filter((t) => t.id !== trackId)
    },

    async toggleLike(track) {
      const existing = this.liked.find((t) => t.youtube_video_id === track.youtube_video_id)
      if (existing) {
        await this.unlike(existing.id)
      } else {
        await this.like(track)
      }
    },
  },
})
