const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api'

export async function api(path, options = {}) {
  const headers = { Accept: 'application/json', ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...options.headers }
  const token = localStorage.getItem('ixmusic_token')
  if (token) headers.Authorization = `Bearer ${token}`
  const response = await fetch(`${API_BASE}${path}`, { ...options, headers, body: options.body ? JSON.stringify(options.body) : undefined })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok || payload.ok === false) {
    if (response.status === 401) localStorage.removeItem('ixmusic_token')
    throw new Error(payload.message || `Request failed (${response.status})`)
  }
  return payload.data || payload
}
