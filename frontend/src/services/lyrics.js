const LRCLIB_API = 'https://lrclib.net/api'

export async function findLyrics(track) {
  const params = new URLSearchParams({
    track_name: track.title || '',
    artist_name: track.artist || '',
  })
  if (track.duration_seconds) params.set('duration', Math.round(track.duration_seconds))
  const response = await fetch(`${LRCLIB_API}/get?${params}`, {
    headers: { 'Lrclib-Client': 'iXMusic v1.0 (https://github.com/iXeriox/iXMusic)' },
  })
  if (response.status === 404) return null
  if (!response.ok) throw new Error('Lyrics are unavailable right now.')
  return response.json()
}

export function parseSyncedLyrics(value = '') {
  return value.split('\n').map((line) => {
    const match = line.match(/^\[(\d+):(\d+(?:\.\d+)?)\](.*)$/)
    return match ? { time: Number(match[1]) * 60 + Number(match[2]), text: match[3].trim() } : null
  }).filter((line) => line?.text)
}
