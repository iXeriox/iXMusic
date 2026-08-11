<script setup>
import { computed, h, ref, watch } from 'vue'
import { useLibrary } from './composables/useLibrary'

const icons = {
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
  home: '<path d="m3 10 9-7 9 7v10H6V10"/><path d="M9 20v-7h6v7"/>',
  compass: '<circle cx="12" cy="12" r="9"/><path d="m15 9-2 4-4 2 2-4 4-2Z"/>',
  library: '<path d="M4 4v16M9 4v16M14 6l5-2 3 15-5 1-3-14Z"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  dots: '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
  play: '<path fill="currentColor" stroke="none" d="m9 7 9 5-9 5Z"/>',
  pause: '<path fill="currentColor" stroke="none" d="M8 7h3v10H8zM13 7h3v10h-3z"/>',
  next: '<path d="m7 6 9 6-9 6V6ZM18 6v12"/>',
  prev: '<path d="m17 6-9 6 9 6V6ZM6 6v12"/>',
  shuffle: '<path d="M4 7h3c4 0 6 10 10 10h3M18 15l2 2-2 2M4 17h3c1.5 0 2.7-1.3 3.8-3M15 7h5M18 5l2 2-2 2"/>',
  repeat: '<path d="m17 2 3 3-3 3M20 5H7a4 4 0 0 0-4 4v1M7 22l-3-3 3-3M4 19h13a4 4 0 0 0 4-4v-1"/>',
  volume: '<path d="M5 10H2v4h3l5 4V6l-5 4Z"/><path d="M14 9c1.2 1.7 1.2 4.3 0 6M17 6c3.3 3.3 3.3 8.7 0 12"/>',
  device: '<rect x="4" y="3" width="16" height="12" rx="2"/><path d="M8 21h8M12 15v6"/>',
  chevron: '<path d="m9 18 6-6-6-6"/>',
  spark: '<path d="m12 3 1.2 4.3L17 9l-3.8 1.7L12 15l-1.2-4.3L7 9l3.8-1.7L12 3Z"/><path d="m19 15 .6 2.4L22 18l-2.4.6L19 21l-.6-2.4L16 18l2.4-.6L19 15Z"/>',
  youtube: '<path fill="currentColor" stroke="none" d="M21.5 7.2a2.5 2.5 0 0 0-1.8-1.8C18.1 5 12 5 12 5s-6.1 0-7.7.4a2.5 2.5 0 0 0-1.8 1.8A26 26 0 0 0 2.1 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.8 1.8c1.6.4 7.7.4 7.7.4s6.1 0 7.7-.4a2.5 2.5 0 0 0 1.8-1.8 26 26 0 0 0 .4-4.8 26 26 0 0 0-.4-4.8ZM10 15V9l5.2 3-5.2 3Z"/>',
  cloud: '<path fill="currentColor" stroke="none" d="M2 14h1v4H2zm2-3h1v7H4zm2-2h1v9H6zm2 1h1v8H8zm2-3h1v11h-1zm2 2.2A5 5 0 0 1 21.5 12 3 3 0 0 1 21 18h-9Z"/>'
}

const Icon = (props) => h('svg', {
  viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '1.8',
  'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'aria-hidden': 'true',
  innerHTML: icons[props.name]
})

const defaultTracks = [
  { id: 1, title: 'Midnight Drive', artist: 'Nova Waves', album: 'Neon Horizons', time: '3:42', source: 'youtube', videoId: '5qap5aO4i9A', art: 'https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=200&auto=format&fit=crop' },
  { id: 2, title: 'Golden Hour', artist: 'Jamie Lowell', album: 'Sunlit', time: '4:05', source: 'cloud', url: 'https://soundcloud.com/discover', art: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=200&auto=format&fit=crop' },
  { id: 3, title: 'Ocean Eyes', artist: 'Luna Bay', album: 'Tides', time: '3:18', source: 'youtube', videoId: 'DWcJFNfaw9c', art: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=200&auto=format&fit=crop' },
  { id: 4, title: 'Afterglow', artist: 'The Wanderers', album: 'City Lights', time: '3:55', source: 'cloud', url: 'https://soundcloud.com/discover', art: 'https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=200&auto=format&fit=crop' },
  { id: 5, title: 'Slow Motion', artist: 'Atlas Lane', album: 'Still Frames', time: '4:21', source: 'youtube', videoId: 'jfKfPfyJRdk', art: 'https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?w=200&auto=format&fit=crop' }
]
function loadTracks() {
  try { return JSON.parse(localStorage.getItem('pulse-tracks-v1')) || defaultTracks }
  catch { return defaultTracks }
}
const tracks = ref(loadTracks())
watch(tracks, value => localStorage.setItem('pulse-tracks-v1', JSON.stringify(value)), { deep: true })

const mixes = [
  { title: 'Evening Acoustic', sub: 'Soft strings for slow evenings', image: 'https://images.unsplash.com/photo-1524650359799-842906ca1c06?w=600&auto=format&fit=crop' },
  { title: 'Deep Focus', sub: 'Ambient sounds to help you focus', image: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=600&auto=format&fit=crop' },
  { title: 'Indie Discovery', sub: 'Fresh finds from rising artists', image: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=600&auto=format&fit=crop' },
  { title: 'Late Night Jazz', sub: 'Smooth jazz for after dark', image: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=600&auto=format&fit=crop' }
]

const current = ref(0)
const playing = ref(false)
const liked = ref(false)
const progress = ref(32)
const query = ref('')
const view = ref('home')
const activePlaylist = ref(null)
const showPlaylistForm = ref(false)
const showVideo = ref(false)
const showTrackMenu = ref(null)
const playlistName = ref('')
const playlistDescription = ref('')
const userForm = ref({ name: '', email: '', role: 'Listener' })
const { playlists, users, createPlaylist, deletePlaylist, toggleTrack, addUser, toggleUser, removeUser } = useLibrary()
const visibleTracks = computed(() => tracks.value.filter(t => `${t.title} ${t.artist} ${t.album}`.toLowerCase().includes(query.value.toLowerCase())))
const displayedTracks = computed(() => {
  if (!activePlaylist.value) return visibleTracks.value
  const playlist = playlists.value.find(item => item.id === activePlaylist.value)
  return visibleTracks.value.filter(track => playlist?.trackIds.includes(track.id))
})
const currentTrack = computed(() => tracks.value[current.value])
function playTrack(track) {
  current.value = tracks.value.indexOf(track)
  playing.value = true
}
function openPlaylist(id) { activePlaylist.value = id; view.value = 'library' }
function savePlaylist() {
  const playlist = createPlaylist(playlistName.value, playlistDescription.value)
  if (!playlist) return
  playlistName.value = ''; playlistDescription.value = ''; showPlaylistForm.value = false; openPlaylist(playlist.id)
}
function saveUser() {
  if (!userForm.value.name.trim() || !userForm.value.email.trim()) return
  addUser({ ...userForm.value }); userForm.value = { name: '', email: '', role: 'Listener' }
}
function openMedia() {
  if (currentTrack.value.source === 'youtube') showVideo.value = true
  else window.open(currentTrack.value.url, '_blank', 'noopener,noreferrer')
}
</script>

<template>
  <div class="app-shell">
    <aside class="sidebar">
      <a class="brand" href="#"><span class="brand-mark"><i></i><i></i><i></i><i></i></span><span>pulse</span></a>
      <nav class="main-nav">
        <button :class="{ active: view === 'home' }" @click="view = 'home'; activePlaylist = null"><Icon name="home" />Home</button>
        <button :class="{ active: view === 'explore' }" @click="view = 'explore'; activePlaylist = null"><Icon name="compass" />Explore</button>
        <button :class="{ active: view === 'library' }" @click="view = 'library'; activePlaylist = null"><Icon name="library" />Your Library</button>
        <button :class="{ active: view === 'manage' }" @click="view = 'manage'"><Icon name="list" />Management</button>
      </nav>
      <div class="nav-label"><span>YOUR PLAYLISTS</span><button title="New playlist" @click="showPlaylistForm = true"><Icon name="plus" /></button></div>
      <nav class="playlist-nav">
        <button v-for="playlist in playlists" :key="playlist.id" @click="openPlaylist(playlist.id)">{{ playlist.name }}</button>
      </nav>
      <button class="new-playlist" @click="showPlaylistForm = true"><span><Icon name="plus" /></span>New playlist</button>
      <div class="profile"><div class="avatar">AJ</div><div><strong>Alex Johnson</strong><small>View profile</small></div><Icon name="dots" /></div>
    </aside>

    <main class="content">
      <header>
        <label class="search"><Icon name="search" /><input v-model="query" placeholder="What do you want to listen to?" /></label>
        <div class="header-actions"><button class="upgrade">Upgrade</button><button class="notification" aria-label="Notifications"><span></span>♧</button><div class="mini-avatar">AJ</div></div>
      </header>

      <section v-if="view === 'home'" class="hero">
        <div class="hero-copy"><span class="eyebrow"><Icon name="spark" />Made for your evening</span><h1>Slow down.<br><em>Press play.</em></h1><p>A handpicked mix of mellow sounds, warm acoustics, and late-night favorites.</p><div class="hero-buttons"><button class="primary" @click="playing = true"><Icon name="play" />Play mix</button><button class="round" aria-label="More"><Icon name="dots" /></button></div></div>
        <div class="hero-visual"><div class="sun"></div><div class="hill far"></div><div class="hill near"></div><div class="record"><div class="record-ring"></div><div class="record-label"><span>evening</span><b>PULSE</b><small>selection 01</small></div></div><div class="floating-note">♪</div></div>
      </section>

      <section v-if="view === 'home' || view === 'explore'" class="section" id="explore">
        <div class="section-head"><div><h2>Your daily soundtrack</h2><p>Fresh picks, selected for you</p></div><a href="#">See all <Icon name="chevron" /></a></div>
        <div class="mix-grid">
          <article v-for="(mix, i) in mixes" :key="mix.title" class="mix-card" @click="playing = true">
            <div class="mix-image"><img :src="mix.image" :alt="mix.title"><span class="mix-number">0{{i + 1}}</span><button class="card-play"><Icon name="play" /></button></div><h3>{{mix.title}}</h3><p>{{mix.sub}}</p>
          </article>
        </div>
      </section>

      <section v-if="view !== 'manage'" class="section recently" id="library">
        <div class="section-head"><div><h2>{{ activePlaylist ? playlists.find(p => p.id === activePlaylist)?.name : 'Recently played' }}</h2><p>{{ activePlaylist ? playlists.find(p => p.id === activePlaylist)?.description || 'Your personal collection' : 'Pick up where you left off' }}</p></div><div class="view-buttons"><button aria-label="List view"><Icon name="list" /></button><button v-if="activePlaylist && activePlaylist !== 'liked'" class="text-action danger" @click="deletePlaylist(activePlaylist); activePlaylist = null">Delete playlist</button></div></div>
        <div class="track-header"><span>#</span><span>Title</span><span>Album</span><span>Source</span><span><Icon name="clock" /></span><span></span></div>
        <div class="track-row" v-for="(track, i) in displayedTracks" :key="track.id" :class="{ selected: tracks[current] === track }" @dblclick="playTrack(track)">
          <span class="track-index">{{ i + 1 }}</span><div class="track-title" @click="playTrack(track)"><img :src="track.art" :alt="`${track.album} cover`"><div><strong>{{track.title}}</strong><small>{{track.artist}}</small></div></div><span class="album">{{track.album}}</span><span class="source" :class="track.source"><Icon :name="track.source" /></span><span class="time">{{track.time}}</span><div class="row-more" role="button" tabindex="0" :aria-label="`Add ${track.title} to playlist`" @click.stop="showTrackMenu = showTrackMenu === track.id ? null : track.id"><Icon name="dots" /><span v-if="showTrackMenu === track.id" class="track-menu"><b>Add to playlist</b><button v-for="playlist in playlists" :key="playlist.id" @click.stop="toggleTrack(playlist.id, track.id)"><span>{{ playlist.trackIds.includes(track.id) ? '✓' : '+' }}</span>{{ playlist.name }}</button></span></div>
        </div>
        <p v-if="!displayedTracks.length" class="empty">No songs here yet. Add one from your recently played list.</p>
      </section>

      <section v-else class="management">
        <div class="management-title"><div><span class="eyebrow dark">Workspace</span><h1>User management</h1><p>Manage access, roles, and account status for your Pulse listeners.</p></div><span class="user-count">{{ users.filter(user => user.active).length }} active users</span></div>
        <form class="user-form" @submit.prevent="saveUser"><label>Name<input v-model="userForm.name" placeholder="Full name" required></label><label>Email<input v-model="userForm.email" type="email" placeholder="name@example.com" required></label><label>Role<select v-model="userForm.role"><option>Listener</option><option>Curator</option><option>Admin</option></select></label><button class="primary" type="submit"><Icon name="plus" />Add user</button></form>
        <div class="user-table"><div class="user-table-head"><span>User</span><span>Role</span><span>Status</span><span>Actions</span></div><div v-for="user in users" :key="user.id" class="user-row"><div class="user-identity"><span>{{ user.name.split(' ').map(n => n[0]).join('').slice(0, 2) }}</span><div><strong>{{ user.name }}</strong><small>{{ user.email }}</small></div></div><span class="role-pill">{{ user.role }}</span><button class="status-pill" :class="{ inactive: !user.active }" @click="toggleUser(user.id)">{{ user.active ? 'Active' : 'Suspended' }}</button><button class="remove-user" :disabled="user.role === 'Admin'" @click="removeUser(user.id)">Remove</button></div></div>
      </section>
    </main>

    <footer class="player">
      <div class="now-playing"><button class="art-button" :aria-label="`Open ${currentTrack.title} on ${currentTrack.source === 'youtube' ? 'YouTube' : 'SoundCloud'}`" @click="openMedia"><img :src="currentTrack.art" alt="Current album art"><span><Icon name="play" /></span></button><div><strong>{{currentTrack.title}}</strong><small>{{currentTrack.artist}}</small></div><button class="heart" :class="{ liked: playlists.find(p => p.id === 'liked')?.trackIds.includes(currentTrack.id) }" aria-label="Toggle liked song" @click="toggleTrack('liked', currentTrack.id)">♡</button></div>
      <div class="controls"><div class="control-buttons"><button><Icon name="shuffle" /></button><button @click="current = (current - 1 + tracks.length) % tracks.length"><Icon name="prev" /></button><button class="play-main" @click="playing = !playing"><Icon :name="playing ? 'pause' : 'play'" /></button><button @click="current = (current + 1) % tracks.length"><Icon name="next" /></button><button><Icon name="repeat" /></button></div><div class="timeline"><span>1:18</span><input v-model="progress" type="range" min="0" max="100"><span>{{tracks[current].time}}</span></div></div>
      <div class="player-right"><button><Icon name="device" /></button><Icon name="volume" /><input type="range" min="0" max="100" value="62"><span class="source youtube"><Icon name="youtube" /></span></div>
    </footer>

    <div v-if="showPlaylistForm" class="modal-backdrop" @click.self="showPlaylistForm = false"><form class="modal-card" @submit.prevent="savePlaylist"><button type="button" class="modal-close" @click="showPlaylistForm = false">×</button><span class="eyebrow dark">Your library</span><h2>Create a playlist</h2><p>Give your next collection a name and a mood.</p><label>Playlist name<input v-model="playlistName" maxlength="40" placeholder="e.g. Night bus" autofocus required></label><label>Description<textarea v-model="playlistDescription" maxlength="100" placeholder="What belongs in this playlist?"></textarea></label><button class="primary" type="submit">Create playlist</button></form></div>
    <div v-if="showVideo" class="modal-backdrop video-backdrop" @click.self="showVideo = false"><div class="video-modal"><button class="modal-close light" @click="showVideo = false">×</button><div class="video-frame"><iframe :src="`https://www.youtube-nocookie.com/embed/${currentTrack.videoId}?autoplay=1`" title="YouTube video player" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe></div><div class="video-meta"><img :src="currentTrack.art" alt=""><div><span>Now watching</span><h2>{{ currentTrack.title }}</h2><p>{{ currentTrack.artist }} · {{ currentTrack.album }}</p></div></div></div></div>
  </div>
</template>
