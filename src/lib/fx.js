// Small visual effects used around the site: confetti and the hidden "party mode".
// Everything here switches itself off for visitors who prefer reduced motion.

const COLORS = ['#8c4fff', '#b58cff', '#ff9900', '#ffb84d', '#ffffff']

const calm = () =>
  typeof window === 'undefined' || window.matchMedia('(prefers-reduced-motion: reduce)').matches

// One shared canvas for all confetti bursts (instead of a new full-screen canvas per burst).
let cv = null
let cx = null
let pieces = []
let running = false

function ensureCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  if (!cv) {
    cv = document.createElement('canvas')
    cv.setAttribute('aria-hidden', 'true')
    cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:90'
    cx = cv.getContext('2d')
  }
  if (cv.width !== Math.round(window.innerWidth * dpr) || cv.height !== Math.round(window.innerHeight * dpr)) {
    cv.width = Math.round(window.innerWidth * dpr)
    cv.height = Math.round(window.innerHeight * dpr)
  }
  cx.setTransform(dpr, 0, 0, dpr, 0, 0)
  if (!cv.parentNode) document.body.appendChild(cv)
}

function tick() {
  cx.clearRect(0, 0, window.innerWidth, window.innerHeight)
  const next = []
  for (const p of pieces) {
    p.vy += 0.28
    p.vx *= 0.985
    p.vy *= 0.985
    p.x += p.vx
    p.y += p.vy
    p.r += p.vr
    p.life -= 0.011
    if (p.life <= 0 || p.y > window.innerHeight + 30) continue
    next.push(p)
    cx.save()
    cx.globalAlpha = Math.min(1, p.life * 1.6)
    cx.translate(p.x, p.y)
    cx.rotate(p.r)
    cx.fillStyle = p.c
    cx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
    cx.restore()
  }
  pieces = next
  if (pieces.length) requestAnimationFrame(tick)
  else {
    running = false
    cv.remove()
  }
}

/** Burst of confetti from a point on the screen (x, y in viewport pixels). */
export function confetti(x, y, { count = 90, spread = 1, haptic = false } = {}) {
  if (calm()) return
  // short buzz on phones that support it (Android; iPhones ignore this)
  if (haptic && navigator.vibrate) navigator.vibrate(25)
  ensureCanvas()
  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2
    const v = (4 + Math.random() * 9) * spread
    pieces.push({
      x,
      y,
      vx: Math.cos(a) * v,
      vy: Math.sin(a) * v - 5,
      w: 5 + Math.random() * 6,
      h: 3 + Math.random() * 4,
      r: Math.random() * 6.28,
      vr: (Math.random() - 0.5) * 0.4,
      c: COLORS[Math.floor(Math.random() * COLORS.length)],
      life: 1,
    })
  }
  if (!running) {
    running = true
    requestAnimationFrame(tick)
  }
}

function toast(message) {
  const t = document.createElement('div')
  t.textContent = message
  t.setAttribute('role', 'status')
  t.style.cssText =
    'position:fixed;left:50%;bottom:90px;transform:translateX(-50%);z-index:95;padding:10px 18px;border-radius:999px;background:rgba(21,13,41,.92);border:1px solid rgba(181,140,255,.5);color:#fff;font:500 13px "JetBrains Mono",monospace;letter-spacing:.08em;pointer-events:none;transition:opacity .4s'
  document.body.appendChild(t)
  setTimeout(() => (t.style.opacity = '0'), 2600)
  setTimeout(() => t.remove(), 3100)
}

let partyTimer = null

/** Hidden easter egg: the theme colours cycle and confetti keeps firing for 9 seconds. */
export function partyMode() {
  if (partyTimer || calm()) return
  toast('PARTY MODE ON')
  const root = document.documentElement
  let hue = 0
  const colors = setInterval(() => {
    hue = (hue + 12) % 360
    root.style.setProperty('--color-aws', `hsl(${(260 + hue) % 360} 100% 65%)`)
    root.style.setProperty('--color-aws-soft', `hsl(${(268 + hue) % 360} 100% 78%)`)
    root.style.setProperty('--color-aws-deep', `hsl(${(255 + hue) % 360} 75% 52%)`)
  }, 90)
  const bursts = setInterval(
    () => confetti(Math.random() * window.innerWidth, Math.random() * window.innerHeight * 0.6, { count: 70 }),
    420,
  )
  partyTimer = setTimeout(() => {
    clearInterval(colors)
    clearInterval(bursts)
    ;['--color-aws', '--color-aws-soft', '--color-aws-deep'].forEach((k) => root.style.removeProperty(k))
    partyTimer = null
  }, 9000)
}
