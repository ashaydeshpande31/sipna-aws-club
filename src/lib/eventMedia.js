// Automatically finds event photos and videos.
//
//   src/assets/events/<event-id>/1.jpg
//   src/assets/events/<event-id>/2.jpg
//   src/assets/events/<event-id>/video.mp4     (optional)
//
// <event-id> must match the `id` of the event in src/data/events.js.
// Photos are shown in filename order (1, 2, 3 ... 10).

const photoFiles = import.meta.glob(
  '../assets/events/*/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}',
  { eager: true, query: '?url', import: 'default' },
)
const videoFiles = import.meta.glob('../assets/events/*/*.{mp4,webm,MP4,WEBM}', {
  eager: true,
  query: '?url',
  import: 'default',
})

function groupByFolder(files) {
  const out = {}
  for (const [path, url] of Object.entries(files)) {
    const parts = path.split('/')
    const folder = parts[parts.length - 2]
    const name = parts[parts.length - 1]
    ;(out[folder] ||= []).push({ name, url })
  }
  for (const key of Object.keys(out)) {
    out[key].sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))
  }
  return out
}

const photosByEvent = groupByFolder(photoFiles)
const videosByEvent = groupByFolder(videoFiles)

export function getEventMedia(id) {
  return {
    photos: (photosByEvent[id] || []).map((f) => f.url),
    video: (videosByEvent[id] || [])[0]?.url || '',
  }
}

// Accepts a full YouTube link or a bare video id and returns the id (or '').
export function youtubeId(input) {
  if (!input) return ''
  const s = String(input).trim()
  if (/^[\w-]{11}$/.test(s)) return s
  const m = s.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/)
  return m ? m[1] : ''
}
