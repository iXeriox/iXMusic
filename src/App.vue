<script setup>
import { computed, h, ref } from 'vue'

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

const tracks = ref([
  { title: 'Midnight Drive', artist: 'Nova Waves', album: 'Neon Horizons', time: '3:42', source: 'youtube', color: '#2b204e', art: 'https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=200&auto=format&fit=crop' },
  { title: 'Golden Hour', artist: 'Jamie Lowell', album: 'Sunlit', time: '4:05', source: 'cloud', color: '#c98044', art: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=200&auto=format&fit=crop' },
  { title: 'Ocean Eyes', artist: 'Luna Bay', album: 'Tides', time: '3:18', source: 'youtube', color: '#468ba0', art: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=200&auto=format&fit=crop' },
  { title: 'Afterglow', artist: 'The Wanderers', album: 'City Lights', time: '3:55', source: 'cloud', color: '#b95b34', art: 'https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=200&auto=format&fit=crop' },
  { title: 'Slow Motion', artist: 'Atlas Lane', album: 'Still Frames', time: '4:21', source: 'youtube', color: '#9d603c', art: 'https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?w=200&auto=format&fit=crop' }
])

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
const visibleTracks = computed(() => tracks.value.filter(t => `${t.title} ${t.artist} ${t.album}`.toLowerCase().includes(query.value.toLowerCase())))
function playTrack(index) { current.value = index; playing.value = true }
</script>

<template>
  <div class="app-shell">
    <aside class="sidebar">
      <a class="brand" href="#"><span class="brand-mark"><i></i><i></i><i></i><i></i></span><span>pulse</span></a>
      <nav class="main-nav">
        <a class="active" href="#"><Icon name="home" />Home</a>
        <a href="#explore"><Icon name="compass" />Explore</a>
        <a href="#library"><Icon name="library" />Your Library</a>
      </nav>
      <div class="nav-label"><span>YOUR PLAYLISTS</span><button title="New playlist"><Icon name="plus" /></button></div>
      <nav class="playlist-nav">
        <a href="#">Liked Songs</a><a href="#">Discoveries</a><a href="#">Road Trip</a><a href="#">Sunday Morning</a><a href="#">Workout Energy</a>
      </nav>
      <button class="new-playlist"><span><Icon name="plus" /></span>New playlist</button>
      <div class="profile"><div class="avatar">AJ</div><div><strong>Alex Johnson</strong><small>View profile</small></div><Icon name="dots" /></div>
    </aside>

    <main class="content">
      <header>
        <label class="search"><Icon name="search" /><input v-model="query" placeholder="What do you want to listen to?" /></label>
        <div class="header-actions"><button class="upgrade">Upgrade</button><button class="notification" aria-label="Notifications"><span></span>♧</button><div class="mini-avatar">AJ</div></div>
      </header>

      <section class="hero">
        <div class="hero-copy"><span class="eyebrow"><Icon name="spark" />Made for your evening</span><h1>Slow down.<br><em>Press play.</em></h1><p>A handpicked mix of mellow sounds, warm acoustics, and late-night favorites.</p><div class="hero-buttons"><button class="primary" @click="playing = true"><Icon name="play" />Play mix</button><button class="round" aria-label="More"><Icon name="dots" /></button></div></div>
        <div class="hero-visual"><div class="sun"></div><div class="hill far"></div><div class="hill near"></div><div class="record"><div class="record-ring"></div><div class="record-label"><span>evening</span><b>PULSE</b><small>selection 01</small></div></div><div class="floating-note">♪</div></div>
      </section>

      <section class="section" id="explore">
        <div class="section-head"><div><h2>Your daily soundtrack</h2><p>Fresh picks, selected for you</p></div><a href="#">See all <Icon name="chevron" /></a></div>
        <div class="mix-grid">
          <article v-for="(mix, i) in mixes" :key="mix.title" class="mix-card" @click="playing = true">
            <div class="mix-image"><img :src="mix.image" :alt="mix.title"><span class="mix-number">0{{i + 1}}</span><button class="card-play"><Icon name="play" /></button></div><h3>{{mix.title}}</h3><p>{{mix.sub}}</p>
          </article>
        </div>
      </section>

      <section class="section recently" id="library">
        <div class="section-head"><div><h2>Recently played</h2><p>Pick up where you left off</p></div><div class="view-buttons"><button><Icon name="list" /></button><a href="#">See all <Icon name="chevron" /></a></div></div>
        <div class="track-header"><span>#</span><span>Title</span><span>Album</span><span>Source</span><span><Icon name="clock" /></span><span></span></div>
        <div class="track-row" v-for="(track, i) in visibleTracks" :key="track.title" :class="{ selected: current === i }" @dblclick="playTrack(i)">
          <span class="track-index">{{ i + 1 }}</span><div class="track-title"><img :src="track.art" :alt=""><div><strong>{{track.title}}</strong><small>{{track.artist}}</small></div></div><span class="album">{{track.album}}</span><span class="source" :class="track.source"><Icon :name="track.source" /></span><span class="time">{{track.time}}</span><button class="row-more"><Icon name="dots" /></button>
        </div>
        <p v-if="!visibleTracks.length" class="empty">No songs found. Try another search.</p>
      </section>
    </main>

    <footer class="player">
      <div class="now-playing"><img :src="tracks[current].art" alt="Current album art"><div><strong>{{tracks[current].title}}</strong><small>{{tracks[current].artist}}</small></div><button class="heart" :class="{ liked }" @click="liked = !liked">♡</button></div>
      <div class="controls"><div class="control-buttons"><button><Icon name="shuffle" /></button><button @click="current = (current - 1 + tracks.length) % tracks.length"><Icon name="prev" /></button><button class="play-main" @click="playing = !playing"><Icon :name="playing ? 'pause' : 'play'" /></button><button @click="current = (current + 1) % tracks.length"><Icon name="next" /></button><button><Icon name="repeat" /></button></div><div class="timeline"><span>1:18</span><input v-model="progress" type="range" min="0" max="100"><span>{{tracks[current].time}}</span></div></div>
      <div class="player-right"><button><Icon name="device" /></button><Icon name="volume" /><input type="range" min="0" max="100" value="62"><span class="source youtube"><Icon name="youtube" /></span></div>
    </footer>
  </div>
</template>
