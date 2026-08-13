<script setup>
import { onMounted, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { usePlaylistsStore } from '@/stores/playlists'
import CreatePlaylistModal from './CreatePlaylistModal.vue'

const auth = useAuthStore()
const playlists = usePlaylistsStore()
const showCreateModal = ref(false)

onMounted(() => {
  playlists.fetchAll()
})
</script>

<template>
  <aside class="sidebar">
    <div class="brand">
      <span class="brand-mark">
        <span class="waveform"><span /><span /><span /><span /></span>
      </span>
      <span class="brand-name">iXMusic</span>
    </div>

    <nav class="nav-primary">
      <RouterLink to="/" class="nav-link" active-class="active">
        <svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M12 3l9 8h-3v9h-5v-6h-2v6H6v-9H3z"/></svg>
        Home
      </RouterLink>
      <RouterLink to="/search" class="nav-link" active-class="active">
        <svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M10 2a8 8 0 105.3 14L20 20.7 21.4 19.3 16.7 14.6A8 8 0 0010 2zm0 2a6 6 0 110 12 6 6 0 010-12z"/></svg>
        Search
      </RouterLink>
      <RouterLink to="/library" class="nav-link" active-class="active">
        <svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M12 21s-7.5-4.6-10-9.1C.4 8.5 2 5 5.6 5c2 0 3.4 1 4.4 2.4C11 6 12.4 5 14.4 5 18 5 19.6 8.5 22 11.9 19.5 16.4 12 21 12 21z"/></svg>
        Liked Songs
      </RouterLink>
      <RouterLink v-if="auth.isModerator" to="/admin" class="nav-link" active-class="active">
        <svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M12 2l8 3v6c0 5-3.4 8.7-8 11-4.6-2.3-8-6-8-11V5l8-3z"/></svg>
        Admin
      </RouterLink>
    </nav>

    <div class="playlists-header">
      <span>Your Playlists</span>
      <button class="icon-btn" title="Create playlist" @click="showCreateModal = true">+</button>
    </div>

    <div class="playlists-list">
      <RouterLink
        v-for="p in playlists.items"
        :key="p.id"
        :to="`/playlist/${p.id}`"
        class="playlist-link"
        active-class="active"
      >
        <span class="playlist-name">{{ p.name }}</span>
        <span class="playlist-count">{{ p.track_count }}</span>
      </RouterLink>
      <p v-if="!playlists.items.length" class="empty-hint">No playlists yet — create one above.</p>
    </div>

    <div class="user-card">
      <div class="user-avatar">{{ auth.user?.display_name?.[0]?.toUpperCase() }}</div>
      <div class="user-meta">
        <span class="user-name">{{ auth.user?.display_name }}</span>
        <span class="badge" :class="`badge-${auth.user?.role}`">{{ auth.user?.role }}</span>
      </div>
      <button class="icon-btn" title="Log out" @click="auth.logout()">
        <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M16 13v-2H7V8l-5 4 5 4v-3z"/><path fill="currentColor" d="M20 3h-9v2h9v14h-9v2h9a2 2 0 002-2V5a2 2 0 00-2-2z"/></svg>
      </button>
    </div>

    <CreatePlaylistModal v-if="showCreateModal" @close="showCreateModal = false" />
  </aside>
</template>

<style scoped>
.sidebar {
  grid-column: 1;
  grid-row: 1 / span 2;
  background: var(--bg-void);
  border-right: 1px solid var(--border-subtle);
  display: flex;
  flex-direction: column;
  padding: 20px 12px;
  min-height: 0;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 12px 22px;
}
.brand-mark {
  width: 30px;
  height: 30px;
  border-radius: var(--radius-sm);
  background: linear-gradient(145deg, #aa96ff, #755cff);
  display: flex;
  align-items: center;
  justify-content: center;
}
.brand-mark .waveform span { background:#0b0b10; }
.brand-name {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 17px;
  letter-spacing: -0.01em;
}

.nav-primary {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-bottom: 20px;
}
.nav-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  font-weight: 600;
  font-size: 14px;
}
.nav-link:hover { color: var(--text-primary); background: var(--bg-elevated); }
.nav-link.active { color: var(--text-primary); background: var(--bg-elevated); }
.nav-link svg { flex-shrink: 0; opacity: 0.85; }

.playlists-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 12px 8px;
  color: var(--text-tertiary);
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.icon-btn {
  background: transparent;
  border: none;
  color: var(--text-secondary);
  font-size: 16px;
  width: 24px;
  height: 24px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.icon-btn:hover { background: var(--bg-elevated); color: var(--text-primary); }

.playlists-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1px;
  padding-bottom: 12px;
}
.playlist-link {
  display: flex;
  justify-content: space-between;
  padding: 8px 12px;
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  font-size: 13.5px;
}
.playlist-link:hover, .playlist-link.active { color: var(--text-primary); background: var(--bg-elevated); }
.playlist-count { color: var(--text-tertiary); font-size: 12px; }
.empty-hint { padding: 8px 12px; color: var(--text-tertiary); font-size: 12.5px; }

.user-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border-top: 1px solid var(--border-subtle);
  margin-top: 8px;
}
.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--accent);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 13px;
  flex-shrink: 0;
}
.user-meta {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
  flex: 1;
}
.user-name {
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
