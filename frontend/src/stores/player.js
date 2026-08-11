import { defineStore } from 'pinia'
import { markRaw } from 'vue'
import api from '@/services/api'

let ytPlayer = null
let progressTimer = null
let apiReadyPromise = null

/** Lazily injects the YouTube IFrame API script once per app session. */
function loadYouTubeApi() {
  if (apiReadyPromise) return apiReadyPromise

  apiReadyPromise = new Promise((resolve) => {
    if (window.YT && window.YT.Player) {
      resolve(window.YT)
      return
    }
    window.onYouTubeIframeAPIReady = () => resolve(window.YT)
    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    document.head.appendChild(tag)
  })

  return apiReadyPromise
}

export const usePlayerStore = defineStore('player', {
  state: () => ({
    queue: [],
    currentIndex: -1,
    isReady: false,
    isPlaying: false,
    isBuffering: false,
    progress: 0,
    duration: 0,
    volume: 70,
    shuffle: false,
    repeatMode: 'off', // off | all | one
    queueSourceName: '',
  }),

  getters: {
    currentTrack: (state) => (state.currentIndex >= 0 ? state.queue[state.currentIndex] : null),
    hasNext: (state) => state.repeatMode !== 'off' || state.currentIndex < state.queue.length - 1,
    hasPrev: (state) => state.currentIndex > 0,
  },

  actions: {
    /** Mounts the (hidden) YouTube player onto the given DOM element id. */
    async mount(elementId) {
      if (ytPlayer) return
      const YT = await loadYouTubeApi()

      ytPlayer = markRaw(
        new YT.Player(elementId, {
          height: '0',
          width: '0',
          playerVars: { playsinline: 1, controls: 0, disablekb: 1 },
          events: {
            onReady: () => {
              this.isReady = true
              ytPlayer.setVolume(this.volume)
            },
            onStateChange: (event) => this._handleStateChange(event),
          },
        })
      )
    },

    _handleStateChange(event) {
      const YT = window.YT
      this.isBuffering = event.data === YT.PlayerState.BUFFERING

      if (event.data === YT.PlayerState.PLAYING) {
        this.isPlaying = true
        this.duration = ytPlayer.getDuration()
        this._startProgressTimer()
        this._logPlay()
      } else if (event.data === YT.PlayerState.PAUSED) {
        this.isPlaying = false
        this._stopProgressTimer()
      } else if (event.data === YT.PlayerState.ENDED) {
        this._stopProgressTimer()
        this._onTrackEnded()
      }
    },

    _startProgressTimer() {
      this._stopProgressTimer()
      progressTimer = setInterval(() => {
        if (ytPlayer && ytPlayer.getCurrentTime) {
          this.progress = ytPlayer.getCurrentTime()
        }
      }, 500)
    },

    _stopProgressTimer() {
      if (progressTimer) clearInterval(progressTimer)
      progressTimer = null
    },

    async _logPlay() {
      const track = this.currentTrack
      if (!track) return
      try {
        await api.post('/tracks.php?action=play', {
          track_id: track.id,
          youtube_video_id: track.youtube_video_id,
          title: track.title,
          artist: track.artist,
          thumbnail_url: track.thumbnail_url,
        })
      } catch {
        /* non-critical */
      }
    },

    _onTrackEnded() {
      if (this.repeatMode === 'one') {
        this.seekTo(0)
        this.resume()
        return
      }
      if (this.hasNext) {
        this.next()
      } else {
        this.isPlaying = false
      }
    },

    /** Replaces the queue and starts playback at startIndex. */
    playQueue(tracks, startIndex = 0, sourceName = '') {
      this.queue = tracks
      this.queueSourceName = sourceName
      this.currentIndex = startIndex
      this._loadCurrent(true)
    },

    /** Adds a single track to the end of the queue without interrupting playback. */
    enqueue(track) {
      this.queue.push(track)
    },

    playTrackNow(track) {
      const idx = this.queue.findIndex((t) => t.youtube_video_id === track.youtube_video_id)
      if (idx >= 0) {
        this.currentIndex = idx
      } else {
        this.queue.push(track)
        this.currentIndex = this.queue.length - 1
      }
      this._loadCurrent(true)
    },

    _loadCurrent(autoplay) {
      const track = this.currentTrack
      if (!track || !ytPlayer) return
      this.progress = 0
      if (autoplay) {
        ytPlayer.loadVideoById(track.youtube_video_id)
      } else {
        ytPlayer.cueVideoById(track.youtube_video_id)
      }
    },

    toggle() {
      if (!ytPlayer) return
      this.isPlaying ? this.pause() : this.resume()
    },

    resume() {
      ytPlayer?.playVideo()
    },

    pause() {
      ytPlayer?.pauseVideo()
    },

    next() {
      if (this.queue.length === 0) return
      if (this.shuffle) {
        this.currentIndex = Math.floor(Math.random() * this.queue.length)
      } else if (this.currentIndex < this.queue.length - 1) {
        this.currentIndex += 1
      } else if (this.repeatMode === 'all') {
        this.currentIndex = 0
      } else {
        return
      }
      this._loadCurrent(true)
    },

    prev() {
      if (this.progress > 3) {
        this.seekTo(0)
        return
      }
      if (this.currentIndex > 0) {
        this.currentIndex -= 1
        this._loadCurrent(true)
      }
    },

    seekTo(seconds) {
      ytPlayer?.seekTo(seconds, true)
      this.progress = seconds
    },

    setVolume(value) {
      this.volume = value
      ytPlayer?.setVolume(value)
    },

    toggleShuffle() {
      this.shuffle = !this.shuffle
    },

    cycleRepeat() {
      const order = ['off', 'all', 'one']
      this.repeatMode = order[(order.indexOf(this.repeatMode) + 1) % order.length]
    },
  },
})
