<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useAppStore } from './composables/useAppStore'
import { createOAuthState } from './services/oauth'

const tracks = [
  { id: 1, title: 'Blinding Lights', artist: 'The Weeknd', region: ['US','CA','GB'], video: '4NRXx6U8ABQ', color: '#b72d38', cover: 'https://i.ytimg.com/vi/4NRXx6U8ABQ/hqdefault.jpg', duration: '4:21' },
  { id: 2, title: 'Espresso', artist: 'Sabrina Carpenter', region: ['US','GB','AU'], video: 'eVli-tstM5E', color: '#84abd0', cover: 'https://i.ytimg.com/vi/eVli-tstM5E/hqdefault.jpg', duration: '3:20' },
  { id: 3, title: 'Calm Down', artist: 'Rema & Selena Gomez', region: ['NG','GB','US'], video: 'WcIcVapfqXw', color: '#d99e44', cover: 'https://i.ytimg.com/vi/WcIcVapfqXw/hqdefault.jpg', duration: '4:00' },
  { id: 4, title: 'Beautiful Things', artist: 'Benson Boone', region: ['US','CA','AU'], video: 'Oa_RSwwpPaA', color: '#647e8f', cover: 'https://i.ytimg.com/vi/Oa_RSwwpPaA/hqdefault.jpg', duration: '3:13' },
  { id: 5, title: 'Water', artist: 'Tyla', region: ['ZA','NG','GB'], video: 'XoiOOiuH8iI', color: '#9a673f', cover: 'https://i.ytimg.com/vi/XoiOOiuH8iI/hqdefault.jpg', duration: '3:40' },
  { id: 6, title: 'Flowers', artist: 'Miley Cyrus', region: ['US','DE','FR'], video: 'G7KNmW9a75Y', color: '#b89967', cover: 'https://i.ytimg.com/vi/G7KNmW9a75Y/hqdefault.jpg', duration: '3:20' },
  { id: 7, title: 'As It Was', artist: 'Harry Styles', region: ['GB','DE','FR'], video: 'H5v3kku4y6Q', color: '#d45b4c', cover: 'https://i.ytimg.com/vi/H5v3kku4y6Q/hqdefault.jpg', duration: '2:47' },
  { id: 8, title: 'Rush', artist: 'Ayra Starr', region: ['NG','ZA','GB'], video: 'crtQSTYWtqE', color: '#683e80', cover: 'https://i.ytimg.com/vi/crtQSTYWtqE/hqdefault.jpg', duration: '3:05' }
]

const regions = { US: 'United States', GB: 'United Kingdom', CA: 'Canada', AU: 'Australia', DE: 'Germany', FR: 'France', NG: 'Nigeria', ZA: 'South Africa' }
const { state, user, initialize, completeDiscordLogin, logout, setRegion, createPlaylist, deletePlaylist, togglePlaylistTrack, toggleLike, markPlayed } = useAppStore()
const authError = ref('')
const activeView = ref('home')
const selectedPlaylist = ref(null)
const query = ref('')
const current = ref(null)
const playing = ref(false)
const volume = ref(70)
const playerHost = ref(null)
const showCreate = ref(false)
const playlistName = ref('')
const menuTrack = ref(null)
const locating = ref(false)
const progress = ref(0)
const duration = ref(0)
const showLyrics = ref(false)
const lyrics = ref([])
const lyricsLoading = ref(false)
let player = null
let apiPromise = null
let progressTimer = null

const initials = computed(() => user.value?.name.split(/\s+/).map(word => word[0]).join('').slice(0, 2).toUpperCase())
const regionalTracks = computed(() => {
  const region = state.value.region || 'US'
  const local = tracks.filter(track => track.region.includes(region))
  return [...local, ...tracks.filter(track => !local.includes(track))]
})
const playlist = computed(() => state.value.playlists.find(item => item.id === selectedPlaylist.value))
const libraryTracks = computed(() => {
  if (activeView.value === 'liked') return tracks.filter(track => state.value.liked.includes(track.video))
  if (activeView.value === 'recent') return state.value.recent.map(item => tracks.find(track => track.video === (item.video || item.youtube_video_id))).filter(Boolean)
  if (playlist.value) return playlist.value.trackIds.map(id => tracks.find(track => track.video === id)).filter(Boolean)
  return regionalTracks.value
})
const results = computed(() => {
  const source = activeView.value === 'search' ? tracks : libraryTracks.value
  const term = query.value.trim().toLowerCase()
  return term ? source.filter(track => `${track.title} ${track.artist}`.toLowerCase().includes(term)) : source
})

function loginWithDiscordRedirect() {
  authError.value = ''
  const clientId = import.meta.env.VITE_DISCORD_CLIENT_ID
  if (!clientId) return (authError.value = 'Add VITE_DISCORD_CLIENT_ID to your .env file to enable Discord login.')
  const redirect = import.meta.env.VITE_DISCORD_REDIRECT_URI || `${location.origin}${location.pathname}`
  let stateToken
  try {
    stateToken = createOAuthState()
  } catch (error) {
    authError.value = error.message
    return
  }
  sessionStorage.setItem('discord_state', stateToken)
  const query = new URLSearchParams({ client_id: clientId, redirect_uri: redirect, response_type: 'code', scope: 'identify email', state: stateToken })
  location.assign(`https://discord.com/oauth2/authorize?${query}`)
}

onMounted(async () => {
  const oauth = new URLSearchParams(location.search)
  const code = oauth.get('code')
  if (code) {
    history.replaceState(null, '', location.pathname)
    if (oauth.get('state') !== sessionStorage.getItem('discord_state')) return (authError.value = 'Discord login could not be verified. Please try again.')
    sessionStorage.removeItem('discord_state')
    try { await completeDiscordLogin(code) } catch (error) { authError.value = error.message || 'Discord login failed. Please try again.' }
  } else await initialize()
  if (user.value && !state.value.region) detectRegion()
})

function detectRegion() {
  locating.value = true
  const fallback = () => {
    const locale = navigator.language?.split('-')[1]
    setRegion(regions[locale] ? locale : 'US')
    locating.value = false
  }
  if (!navigator.geolocation) return fallback()
  navigator.geolocation.getCurrentPosition(async ({ coords }) => {
    try {
      const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${coords.latitude}&longitude=${coords.longitude}&localityLanguage=en`)
      const data = await response.json()
      setRegion(regions[data.countryCode] ? data.countryCode : 'US')
    } catch { fallback(); return }
    locating.value = false
  }, fallback, { timeout: 5000, maximumAge: 3600000 })
}

function loadYouTubeAPI() {
  if (window.YT?.Player) return Promise.resolve()
  if (apiPromise) return apiPromise
  apiPromise = new Promise(resolve => {
    window.onYouTubeIframeAPIReady = resolve
    const script = document.createElement('script')
    script.src = 'https://www.youtube.com/iframe_api'
    document.head.appendChild(script)
  })
  return apiPromise
}

async function playTrack(track) {
  current.value = track
  playing.value = true
  markPlayed(track).catch(() => {})
  await nextTick()
  await loadYouTubeAPI()
  if (!player) {
    player = new window.YT.Player(playerHost.value, {
      videoId: track.video,
      playerVars: { autoplay: 1, controls: 0, rel: 0, playsinline: 1 },
      events: { onReady: event => { event.target.setVolume(volume.value); duration.value = event.target.getDuration(); event.target.playVideo() }, onStateChange: event => { playing.value = event.data === 1; duration.value = event.target.getDuration() || duration.value } }
    })
  } else player.loadVideoById(track.video)
}
function seek() { player?.seekTo(Number(progress.value), true) }
function formatTime(value) { const seconds = Math.max(0, Math.floor(value || 0)); return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}` }
async function toggleLyrics() {
  showLyrics.value = !showLyrics.value
  if (!showLyrics.value || !current.value || lyrics.value.length) return
  lyricsLoading.value = true
  try {
    const params = new URLSearchParams({ track_name: current.value.title, artist_name: current.value.artist })
    const response = await fetch(`https://lrclib.net/api/get?${params}`, { headers: { 'Lrclib-Client': 'iXMusic v2.0' } })
    if (!response.ok) throw new Error()
    const data = await response.json()
    lyrics.value = (data.syncedLyrics || '').split('\n').map(line => { const m = line.match(/^\[(\d+):(\d+(?:\.\d+)?)\](.*)$/); return m ? { time: +m[1] * 60 + +m[2], text: m[3].trim() } : null }).filter(line => line?.text)
    if (!lyrics.value.length && data.plainLyrics) lyrics.value = data.plainLyrics.split('\n').filter(Boolean).map(text => ({ time: -1, text }))
  } catch { lyrics.value = [{ time: -1, text: 'Lyrics are not available for this track yet.' }] }
  finally { lyricsLoading.value = false }
}
const activeLyric = computed(() => lyrics.value.findLastIndex(line => line.time >= 0 && line.time <= progress.value + .2))
watch(() => current.value?.id, () => { lyrics.value = []; showLyrics.value = false; progress.value = 0 })
progressTimer = window.setInterval(() => { if (player?.getCurrentTime) { progress.value = player.getCurrentTime(); duration.value = player.getDuration() || duration.value } }, 250)

function togglePlayback() {
  if (!current.value) return playTrack(regionalTracks.value[0])
  if (!player) return playTrack(current.value)
  playing.value ? player.pauseVideo() : player.playVideo()
}
function changeVolume() { player?.setVolume(Number(volume.value)) }
function nextTrack(direction = 1) {
  const queue = results.value.length ? results.value : regionalTracks.value
  const index = Math.max(0, queue.findIndex(track => track.id === current.value?.id))
  playTrack(queue[(index + direction + queue.length) % queue.length])
}
function openView(view, id = null) { activeView.value = view; selectedPlaylist.value = id; query.value = '' }
async function savePlaylist() {
  const item = await createPlaylist(playlistName.value)
  if (item) { playlistName.value = ''; showCreate.value = false; openView('playlist', item.id) }
}
async function signOut() { player?.destroy(); player = null; current.value = null; await logout() }
onBeforeUnmount(() => { player?.destroy(); clearInterval(progressTimer) })
</script>

<template>
  <main v-if="!user" class="auth-page">
    <section class="auth-story"><a class="logo"><span>iX</span>Music</a><div class="story-content"><span class="kicker">Your sound. Everywhere.</span><h1>Music that<br><em>moves with you.</em></h1><p>Local hits, global discoveries, and every playlist you make—powered cleanly by YouTube.</p><div class="signal"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div></div><small>Listen freely · Built for discovery</small></section>
    <section class="auth-panel"><div class="auth-card"><span class="mobile-logo">iXMusic</span><span class="kicker">Members only</span><h2>Welcome to your sound.</h2><p>One click gets you back to the music, playlists, and discoveries waiting for you.</p><button class="discord-login" @click="loginWithDiscordRedirect"><svg viewBox="0 0 24 24"><path fill="currentColor" d="M19.5 5.3A16.3 16.3 0 0015.4 4l-.5 1.1a15 15 0 00-5.8 0L8.6 4a16.7 16.7 0 00-4.1 1.3C1.9 9.1 1.2 12.8 1.6 16.4a16.8 16.8 0 005 2.5l1.2-1.7c-.7-.3-1.3-.6-1.9-1 4.1 2 8.3 2 12.4 0-.6.4-1.2.7-1.9 1l1.2 1.7a16.7 16.7 0 005-2.5c.5-4.2-.8-7.8-3.1-11.1zM8.9 14.4c-1 0-1.9-1-1.9-2.2S7.8 10 8.9 10s1.9 1 1.9 2.2-.9 2.2-1.9 2.2zm6.2 0c-1 0-1.9-1-1.9-2.2s.8-2.2 1.9-2.2 1.9 1 1.9 2.2-.8 2.2-1.9 2.2z"/></svg><span>Continue with Discord</span><b>→</b></button><p v-if="authError" class="form-error">{{ authError }}</p><div class="auth-divider"><span>Secure authentication by Discord</span></div><p class="auth-note">We only request your basic profile and email. Your Discord password never touches iXMusic.</p></div></section>
  </main>

  <div v-else class="music-app">
    <aside class="sidebar">
      <button class="logo sidebar-logo" @click="openView('home')"><span>iX</span>Music</button>
      <nav class="primary-nav"><button :class="{active: activeView === 'home'}" @click="openView('home')"><span>⌂</span>Home</button><button :class="{active: activeView === 'search'}" @click="openView('search')"><span>⌕</span>Search</button><button :class="{active: activeView === 'liked'}" @click="openView('liked')"><span>♡</span>Liked songs</button><button :class="{active: activeView === 'recent'}" @click="openView('recent')"><span>↺</span>Recently played</button></nav>
      <div class="playlist-label"><span>Playlists</span><button aria-label="Create playlist" @click="showCreate = true">＋</button></div>
      <nav class="playlist-list"><button v-for="item in state.playlists" :key="item.id" :class="{active: selectedPlaylist === item.id}" @click="openView('playlist', item.id)"><span class="playlist-icon">♫</span><span><b>{{ item.name }}</b><small>{{ item.trackIds.length }} songs</small></span></button><p v-if="!state.playlists.length">Create your first playlist.</p></nav>
      <div class="account"><span class="avatar">{{ initials }}</span><div><b>{{ user.name }}</b><small>{{ user.email }}</small></div><button title="Sign out" @click="signOut">↗</button></div>
    </aside>

    <section class="main-view">
      <header class="topbar"><div class="mobile-brand logo"><span>iX</span>Music</div><label class="searchbox"><span>⌕</span><input v-model="query" placeholder="Search songs and artists" @focus="activeView = 'search'"></label><div class="location"><span>●</span><div><small>Popular near you</small><select :value="state.region || 'US'" @change="setRegion($event.target.value)"><option v-for="(name, code) in regions" :key="code" :value="code">{{ name }}</option></select></div><button title="Detect my location" @click="detectRegion">{{ locating ? '…' : '◎' }}</button></div><span class="top-avatar avatar">{{ initials }}</span></header>

      <div class="page-content">
        <template v-if="activeView === 'home'">
          <section class="hero"><div><span class="kicker">Top pick in {{ regions[state.region || 'US'] }}</span><h1>{{ regionalTracks[0].title }}</h1><p>{{ regionalTracks[0].artist }} · Trending in your area</p><div><button class="play-cta" @click="playTrack(regionalTracks[0])">▶ Play now</button><button class="like-cta" :class="{liked: state.liked.includes(regionalTracks[0].video)}" @click="toggleLike(regionalTracks[0])">♡</button></div></div><img :src="regionalTracks[0].cover" :alt="regionalTracks[0].title"></section>
          <div class="section-title"><div><span class="kicker">Your location</span><h2>Popular near you</h2></div><button @click="openView('search')">Explore all →</button></div>
          <div class="card-grid"><article v-for="track in regionalTracks.slice(0, 5)" :key="track.id" class="music-card" @click="playTrack(track)"><div><img :src="track.cover" :alt="track.title"><button>▶</button><span>#{{ regionalTracks.indexOf(track) + 1 }}</span></div><h3>{{ track.title }}</h3><p>{{ track.artist }}</p></article></div>
          <div class="section-title compact"><div><span class="kicker">Keep listening</span><h2>Made for {{ user.name.split(' ')[0] }}</h2></div></div>
        </template>

        <section class="track-section">
          <div v-if="activeView !== 'home'" class="library-heading"><div><span class="kicker">{{ activeView === 'search' ? 'Discover' : 'Your library' }}</span><h1>{{ activeView === 'search' ? 'Search' : activeView === 'liked' ? 'Liked songs' : activeView === 'recent' ? 'Recently played' : playlist?.name }}</h1><p>{{ results.length }} songs</p></div><button v-if="playlist" class="delete-button" @click="deletePlaylist(playlist.id); openView('home')">Delete playlist</button></div>
          <div class="track-table"><div class="track-head"><span>#</span><span>Title</span><span>Area</span><span>Time</span><span></span></div><div v-for="(track, index) in (activeView === 'home' ? regionalTracks.slice(0, 5) : results)" :key="track.id" class="track-row" :class="{playing: current?.id === track.id}" @dblclick="playTrack(track)"><span>{{ index + 1 }}</span><button class="track-name" @click="playTrack(track)"><img :src="track.cover" alt=""><span><b>{{ track.title }}</b><small>{{ track.artist }}</small></span></button><span class="area-tags"><i v-for="code in track.region.slice(0, 2)" :key="code">{{ code }}</i></span><span>{{ track.duration }}</span><button class="more" @click.stop="menuTrack = menuTrack === track.id ? null : track.id">•••<div v-if="menuTrack === track.id" class="track-menu"><strong>Add to playlist</strong><button v-for="item in state.playlists" :key="item.id" @click.stop="togglePlaylistTrack(item.id, track)">{{ item.trackIds.includes(track.video) ? '✓' : '+' }} {{ item.name }}</button><button @click.stop="toggleLike(track)">{{ state.liked.includes(track.video) ? '♥ Remove from liked' : '♡ Add to liked' }}</button></div></button></div><div v-if="!results.length && activeView !== 'home'" class="empty-state"><span>♫</span><h3>Nothing here yet</h3><p>Search for music or add songs to this playlist.</p></div></div>
        </section>
      </div>
    </section>

    <footer class="player" :class="{empty: !current}"><div class="now-playing"><div v-if="current" class="mini-video"><div ref="playerHost"></div></div><div v-else class="empty-cover">♫</div><div><b>{{ current?.title || 'Choose something to play' }}</b><small>{{ current?.artist || 'Your music will appear here' }}</small></div><button v-if="current" class="player-like" :class="{liked: state.liked.includes(current.video)}" @click="toggleLike(current)">♡</button></div><div class="transport"><div><button @click="nextTrack(-1)">↤</button><button class="main-play" @click="togglePlayback">{{ playing ? 'Ⅱ' : '▶' }}</button><button @click="nextTrack(1)">↦</button></div><div class="seek-row"><time>{{ formatTime(progress) }}</time><input v-model.number="progress" class="seek" type="range" min="0" :max="duration || 1" step="0.1" :style="{'--played': `${duration ? progress / duration * 100 : 0}%`}" @input="seek"><time>{{ formatTime(duration) }}</time></div></div><div class="volume"><button class="lyrics-button" :class="{active: showLyrics}" :disabled="!current" @click="toggleLyrics">Lyrics</button><span>▾</span><input v-model="volume" type="range" min="0" max="100" @input="changeVolume"></div></footer><aside v-if="showLyrics" class="lyrics-panel"><header><div><span class="kicker">Now singing</span><h2>Lyrics</h2></div><button @click="showLyrics = false">×</button></header><div class="lyrics-scroll"><p v-if="lyricsLoading">Finding the words…</p><button v-for="(line,index) in lyrics" v-else :key="index" :class="{active:index === activeLyric, past:index < activeLyric}" @click="line.time >= 0 && (progress = line.time, seek())">{{ line.text }}</button></div><small>Lyrics by <a href="https://lrclib.net" target="_blank">LRCLIB ↗</a> · open source</small></aside>

    <div v-if="showCreate" class="modal" @click.self="showCreate = false"><form @submit.prevent="savePlaylist"><button type="button" class="close" @click="showCreate = false">×</button><span class="kicker">Your library</span><h2>New playlist</h2><p>Start a collection for any moment.</p><label>Name<input v-model="playlistName" maxlength="40" placeholder="Playlist name" autofocus required></label><button class="play-cta" type="submit">Create playlist</button></form></div>
  </div>
</template>
