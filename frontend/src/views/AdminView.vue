<script setup>
import { onMounted, ref } from 'vue'
import { useAdminStore } from '@/stores/admin'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'

const admin = useAdminStore()
const auth = useAuthStore()
const toast = useToastStore()
const query = ref('')
let debounceTimer = null

onMounted(() => admin.fetchUsers())

function onSearch() {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => admin.fetchUsers(query.value), 350)
}

async function changeRole(user, role) {
  try {
    await admin.setRole(user.id, role)
  } catch (e) {
    toast.error(e.message)
  }
}

async function toggleStatus(user) {
  try {
    await admin.setStatus(user.id, user.status === 'active' ? 'suspended' : 'active')
  } catch (e) {
    toast.error(e.message)
  }
}

async function removeUser(user) {
  if (!confirm(`Permanently remove ${user.username}? This can't be undone.`)) return
  try {
    await admin.removeUser(user.id)
  } catch (e) {
    toast.error(e.message)
  }
}

function formatDate(str) {
  if (!str) return '—'
  return new Date(str.replace(' ', 'T')).toLocaleDateString()
}
</script>

<template>
  <div class="admin-view">
    <div class="header">
      <h1>Member Control</h1>
      <p class="sub">Manage accounts, roles, and access. Only visible to moderators and admins.</p>
    </div>

    <input v-model="query" @input="onSearch" class="input search" placeholder="Search by username, email, or name…" />

    <div class="table card">
      <div class="row row-head">
        <span>Member</span>
        <span>Role</span>
        <span>Status</span>
        <span>Joined</span>
        <span>Last login</span>
        <span></span>
      </div>

      <div v-if="admin.loading" class="empty-state"><p>Loading members…</p></div>

      <div v-for="u in admin.users" :key="u.id" class="row" v-else>
        <div class="member-cell">
          <div class="avatar">{{ u.display_name?.[0]?.toUpperCase() }}</div>
          <div class="member-meta">
            <span class="name">{{ u.display_name }}</span>
            <span class="handle">@{{ u.username }} · {{ u.email }}</span>
          </div>
        </div>

        <select
          v-if="auth.isAdmin"
          class="role-select"
          :value="u.role"
          @change="changeRole(u, $event.target.value)"
          :disabled="u.id === auth.user.id"
        >
          <option value="user">User</option>
          <option value="moderator">Moderator</option>
          <option value="admin">Admin</option>
        </select>
        <span v-else class="badge" :class="`badge-${u.role}`">{{ u.role }}</span>

        <span class="badge" :class="`badge-${u.status}`">{{ u.status }}</span>

        <span class="date">{{ formatDate(u.created_at) }}</span>
        <span class="date">{{ formatDate(u.last_login_at) }}</span>

        <div class="row-actions" v-if="auth.isAdmin">
          <button
            class="btn btn-text"
            :disabled="u.id === auth.user.id"
            @click="toggleStatus(u)"
          >
            {{ u.status === 'active' ? 'Suspend' : 'Reactivate' }}
          </button>
          <button class="btn btn-danger" :disabled="u.id === auth.user.id" @click="removeUser(u)">Remove</button>
        </div>
      </div>

      <div v-if="!admin.loading && !admin.users.length" class="empty-state">
        <h3>No members found</h3>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-view { display: flex; flex-direction: column; gap: 20px; }
.header h1 { font-size: 26px; }
.header .sub { color: var(--text-secondary); font-size: 13.5px; margin-top: 4px; }
.search { max-width: 380px; }

.table { overflow: hidden; }
.row {
  display: grid;
  grid-template-columns: 2.2fr 1fr 0.9fr 1fr 1fr 1.4fr;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-subtle);
}
.row:last-child { border-bottom: none; }
.row-head {
  color: var(--text-tertiary);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 700;
}

.member-cell { display: flex; align-items: center; gap: 10px; min-width: 0; }
.avatar {
  width: 34px; height: 34px; border-radius: 50%; background: var(--accent);
  display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 13px; flex-shrink: 0;
}
.member-meta { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.name { font-size: 14px; font-weight: 600; }
.handle { font-size: 12px; color: var(--text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.role-select {
  background: var(--bg-elevated);
  color: var(--text-primary);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  padding: 6px 8px;
  font-size: 13px;
}
.role-select:disabled { opacity: 0.5; }

.date { font-size: 12.5px; color: var(--text-secondary); }
.row-actions { display: flex; gap: 6px; justify-content: flex-end; }
</style>
