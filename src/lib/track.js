// Privacy-friendly visitor counting for the admin page.
// Sends one tiny message per page view to /api/track. It stores NO name, IP address or cookie:
// only an anonymous random id kept in this browser, the page, device type and where the visit came from.
// Skipped for: the admin (when logged in), localhost, bots, and visitors who send "Do Not Track".

const VID = 'aws-vid'
const SID = 'aws-sid'
const LAST = 'aws-last'

const rand = () => Math.random().toString(36).slice(2, 12) + Date.now().toString(36)

function off() {
  try {
    if (sessionStorage.getItem('aws-admin-pw')) return true
  } catch {
    /* ignore */
  }
  const h = location.hostname
  return navigator.webdriver || navigator.doNotTrack === '1' || h === 'localhost' || h === '127.0.0.1' || /^192\.168\./.test(h)
}

function device() {
  const coarse = window.matchMedia && matchMedia('(pointer:coarse)').matches
  const short = Math.min(screen.width, screen.height)
  if (coarse && short < 600) return 'mobile'
  if (coarse && short < 1100) return 'tablet'
  return 'desktop'
}

function send(data) {
  const body = JSON.stringify(data)
  try {
    if (navigator.sendBeacon && navigator.sendBeacon('/api/track', new Blob([body], { type: 'application/json' }))) return
  } catch {
    /* fall through */
  }
  fetch('/api/track', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, keepalive: true }).catch(() => {})
}

function ids() {
  let vid = ''
  let nv = false
  let ns = false
  try {
    vid = localStorage.getItem(VID) || ''
    if (!vid) {
      vid = rand()
      localStorage.setItem(VID, vid)
      nv = true
    }
    if (!sessionStorage.getItem(SID)) {
      sessionStorage.setItem(SID, '1')
      ns = true
    }
  } catch {
    vid = vid || rand()
  }
  return { vid, nv, ns }
}

function source() {
  const q = new URLSearchParams(location.search)
  const tag = q.get('utm_source') || q.get('ref') || q.get('src')
  if (tag) return String(tag).slice(0, 30)
  try {
    const host = new URL(document.referrer).hostname
    if (host && host !== location.hostname) return host
  } catch {
    /* no referrer */
  }
  return ''
}

function view(path) {
  if (off()) return
  const { vid, nv, ns } = ids()
  let from = ''
  try {
    from = sessionStorage.getItem(LAST) || ''
    sessionStorage.setItem(LAST, path)
  } catch {
    /* ignore */
  }
  const data = { t: 'view', p: path, f: from, v: vid, dv: device(), nv, ns }
  if (ns) data.r = source()
  const run = () => send(data)
  // wait for a quiet moment so counting never slows the page down
  if (window.requestIdleCallback) window.requestIdleCallback(run, { timeout: 3000 })
  else setTimeout(run, 1500)
}

function event(name, extra = {}) {
  if (off()) return
  send({ t: 'event', e: name, v: ids().vid, dv: device(), ...extra })
}

let started = false
function start() {
  if (started) return
  started = true
  // clicks on links that leave the site (WhatsApp, Google Form, Instagram, LinkedIn...)
  document.addEventListener(
    'click',
    (e) => {
      const a = e.target && e.target.closest ? e.target.closest('a[href]') : null
      if (!a) return
      try {
        const u = new URL(a.href, location.href)
        if (/^https?:$/.test(u.protocol) && u.hostname !== location.hostname) event('out', { o: u.hostname.replace(/^www\./, '') })
      } catch {
        /* ignore */
      }
    },
    { capture: true, passive: true },
  )
  window.addEventListener('appinstalled', () => event('install'))
}

export const track = { view, event, start }
