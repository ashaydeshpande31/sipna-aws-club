import { useCallback, useEffect, useRef, useState } from 'react'
import { reducedMotion } from '../lib/scroll'
import { SITE } from '../data/site'

// ============================================================
//  INTRO  ("REGION CHECK": a map of India made of dots, AWS Mumbai lights up,
//  data travels to Sipna in Amravati, the club name appears, the site opens)
//
//  - No sound, no flashing: calm on purpose.
//  - Plays once per browser tab session. Add  ?intro  to the address to play it again.
//  - Skip button and the Esc key skip it.
//  Edit the timings in TIME, the labels in PLACES, the title text below.
// ============================================================

const TITLE = SITE.name.toUpperCase()
const TAG = 'AWS STUDENT BUILDER GROUP AT SIPNA'

// seconds after the intro starts
const TIME = {
  dots: 1.2, // the map fades in (a soft sweep from west to east)
  mumbai: 0.9, // AWS Mumbai region lights up
  hyd: 1.5, // arc to Hyderabad starts
  amr: 1.8, // arc to Amravati starts
  land: 2.8, // data lands at Amravati
  title: 3.1, // club name
  open: 4.3, // the site starts underneath, intro fades
  end: 5.0, // overlay removed
}

// longitude, latitude
const PLACES = {
  mumbai: { lon: 72.88, lat: 19.08, code: 'ap-south-1', city: 'MUMBAI' },
  hyd: { lon: 78.49, lat: 17.39, code: 'ap-south-2', city: 'HYDERABAD' },
  amr: { lon: 77.75, lat: 20.93, code: 'SIPNA COET', city: 'AMRAVATI' },
}

// outline of India (lon, lat), hand-drawn and simplified: it only has to look right made of dots
const INDIA = [
  [74.0, 37.0], [76.5, 36.9], [78.0, 35.6], [80.3, 35.5], [79.6, 34.0], [78.8, 32.6], [79.2, 31.5],
  [80.2, 30.5], [81.0, 30.1], [80.1, 28.9], [80.5, 28.6], [82.0, 27.8], [83.5, 27.4], [84.7, 27.0],
  [86.0, 26.6], [88.1, 26.4], [88.1, 27.9], [88.9, 26.9], [92.0, 26.8], [92.7, 28.2], [95.2, 29.2],
  [96.7, 28.4], [97.4, 28.1], [96.9, 27.0], [95.9, 26.1], [95.0, 25.4], [94.6, 24.0], [93.4, 23.0],
  [93.0, 22.0], [92.5, 22.0], [92.3, 23.3], [91.3, 23.0], [91.5, 24.2], [91.8, 25.2], [90.0, 25.2],
  [89.8, 26.0], [89.1, 26.2], [88.4, 26.0], [88.0, 25.2], [88.2, 24.8], [88.7, 24.2], [88.9, 23.4],
  [89.0, 21.9], [87.0, 21.5], [86.8, 20.7], [86.2, 19.9], [85.0, 19.3], [84.1, 18.2], [83.0, 17.5],
  [82.3, 16.6], [81.2, 16.0], [80.3, 15.5], [80.1, 13.5], [80.3, 12.0], [79.8, 10.4], [79.3, 10.3],
  [78.9, 9.3], [78.2, 8.9], [77.5, 8.1], [76.6, 8.9], [76.3, 9.9], [75.8, 11.3], [75.0, 12.6],
  [74.7, 13.5], [74.1, 15.0], [73.7, 16.0], [73.3, 17.5], [72.9, 19.0], [72.8, 20.0], [72.7, 21.0],
  [72.6, 22.2], [72.2, 21.2], [71.0, 20.8], [70.3, 20.9], [69.0, 22.3], [69.5, 22.7], [70.2, 22.9],
  [68.5, 23.5], [68.2, 23.7], [69.5, 24.3], [70.1, 25.0], [70.5, 26.0], [70.0, 27.0], [70.2, 27.8],
  [71.0, 28.0], [71.9, 27.9], [72.8, 29.0], [73.9, 29.9], [74.6, 31.0], [74.5, 31.7], [75.3, 32.2],
  [74.7, 32.8], [74.0, 33.8], [73.6, 34.8],
]

const LON0 = 67.5
const LAT1 = 37.5
const SPAN = 31 // degrees shown, both ways
const XSQUEEZE = 0.93 // a degree of longitude is a little narrower than a degree of latitude here

const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : x)
const smooth = (x) => {
  const t = clamp01(x)
  return t * t * (3 - 2 * t)
}
const easeOut = (x) => 1 - Math.pow(1 - clamp01(x), 3)

function inside(poly, x, y) {
  let c = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i]
    const [xj, yj] = poly[j]
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c
  }
  return c
}

// everything that depends on the screen size
function layout(canvas) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const W = window.innerWidth
  const H = window.innerHeight
  canvas.width = Math.round(W * dpr)
  canvas.height = Math.round(H * dpr)

  const mapH = Math.min(H * 0.66, (W * 0.94) / XSQUEEZE)
  const ky = mapH / SPAN
  const kx = ky * XSQUEEZE
  const mapW = SPAN * kx
  const ox = (W - mapW) / 2
  const oy = Math.max(H * 0.06, (H * 0.72 - mapH) / 2 + H * 0.02)
  const toX = (lon) => ox + (lon - LON0) * kx
  const toY = (lat) => oy + (LAT1 - lat) * ky

  // dots on a grid, only where the grid falls inside the outline
  const step = mapH / 47
  const dots = []
  for (let y = oy; y < oy + mapH; y += step) {
    const row = Math.round((y - oy) / step)
    for (let x = ox + (row % 2 ? step / 2 : 0); x < ox + mapW; x += step) {
      const lon = LON0 + (x - ox) / kx
      const lat = LAT1 - (y - oy) / ky
      if (inside(INDIA, lon, lat)) {
        dots.push({ x, y, d: ((x - ox) / mapW) * 0.85 + ((Math.sin(x * 12.9898 + y * 78.233) * 43758.5453) % 1 + 1) % 1 * 0.3 })
      }
    }
  }

  const pt = (p) => ({ x: toX(p.lon), y: toY(p.lat) })
  const mumbai = pt(PLACES.mumbai)
  const hyd = pt(PLACES.hyd)
  const amr = pt(PLACES.amr)
  const arc = (a, b, lift) => {
    const dist = Math.hypot(b.x - a.x, b.y - a.y)
    return { a, b, c: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 - dist * lift } }
  }
  return {
    dpr,
    W,
    H,
    key: W + 'x' + H,
    step,
    dots,
    mumbai,
    hyd,
    amr,
    arcs: { hyd: arc(mumbai, hyd, 0.28), amr: arc(mumbai, amr, 0.32) },
    font: Math.max(9, Math.min(12, W / 60)),
  }
}

function bez(arc, t) {
  const u = 1 - t
  return {
    x: u * u * arc.a.x + 2 * u * t * arc.c.x + t * t * arc.b.x,
    y: u * u * arc.a.y + 2 * u * t * arc.c.y + t * t * arc.b.y,
  }
}

function glow(c, x, y, r, rgb, a) {
  const g = c.createRadialGradient(x, y, 0, x, y, r)
  g.addColorStop(0, `rgba(${rgb},${a})`)
  g.addColorStop(1, `rgba(${rgb},0)`)
  c.fillStyle = g
  c.beginPath()
  c.arc(x, y, r, 0, 6.2832)
  c.fill()
}

const PURPLE = '181,140,255'
const ORANGE = '255,153,0'

function drawArc(c, L, arc, from, to, T, rgb, travel) {
  const p = easeOut((T - from) / (to - from))
  if (p <= 0) return
  const { dpr } = L
  c.strokeStyle = `rgba(${rgb},0.55)`
  c.lineWidth = 1.4 * dpr
  c.lineCap = 'round'
  c.beginPath()
  const n = 48
  for (let i = 0; i <= n * p; i++) {
    const q = bez(arc, i / n)
    if (i === 0) c.moveTo(q.x * dpr, q.y * dpr)
    else c.lineTo(q.x * dpr, q.y * dpr)
  }
  c.stroke()

  // head while it is travelling, then little packets keep flowing along the finished line
  if (p < 1) {
    const h = bez(arc, p)
    glow(c, h.x * dpr, h.y * dpr, 11 * dpr, rgb, 0.9)
  } else if (travel) {
    for (let k = 0; k < 2; k++) {
      const f = (T * 0.45 + k * 0.5) % 1
      for (let t = 0; t < 5; t++) {
        const q = bez(arc, Math.max(0, f - t * 0.012))
        c.fillStyle = `rgba(255,255,255,${0.85 * (1 - t * 0.2)})`
        c.beginPath()
        c.arc(q.x * dpr, q.y * dpr, (2.2 - t * 0.3) * dpr, 0, 6.2832)
        c.fill()
      }
    }
  }
}

function label(c, L, x, y, line1, line2, align, a, rgb) {
  if (a <= 0.01) return
  const { dpr, font } = L
  c.textAlign = align
  c.fillStyle = `rgba(${rgb},${a})`
  c.font = `600 ${font * dpr}px "JetBrains Mono",ui-monospace,Menlo,monospace`
  c.fillText(line1, x * dpr, y * dpr)
  c.fillStyle = `rgba(236,230,255,${a * 0.75})`
  c.font = `500 ${font * 0.85 * dpr}px "JetBrains Mono",ui-monospace,Menlo,monospace`
  c.fillText(line2, x * dpr, (y + font * 1.25) * dpr)
}

function draw(c, L, T) {
  const { dpr, W, H, dots, step } = L
  c.clearRect(0, 0, W * dpr, H * dpr)

  const dim = 1 - 0.45 * smooth((T - TIME.title) / 0.8) // the map sits back once the title arrives
  const mt = T - TIME.mumbai
  const at = T - TIME.land
  const rMum = mt * step * 15 // ripple radius from Mumbai, in px
  const rAmr = at * step * 12
  const band = step * 3.2

  // the dots
  for (const d of dots) {
    const a = easeOut((T - d.d) / 0.55)
    if (a <= 0) continue
    let alpha = (0.2 + 0.2 * a) * a * dim
    let r = step * 0.2
    let rgb = PURPLE
    if (mt > 0 && rMum < step * 40) {
      const dist = Math.hypot(d.x - L.mumbai.x, d.y - L.mumbai.y)
      const b = Math.exp(-(((dist - rMum) / band) ** 2)) * (1 - clamp01(rMum / (step * 40)))
      alpha += b * 0.42
      r += b * step * 0.05
    }
    if (at > 0 && rAmr < step * 34) {
      const dist = Math.hypot(d.x - L.amr.x, d.y - L.amr.y)
      const b = Math.exp(-(((dist - rAmr) / band) ** 2)) * (1 - clamp01(rAmr / (step * 34)))
      if (b > 0.05) {
        alpha += b * 0.5
        r += b * step * 0.06
        rgb = b > 0.3 ? ORANGE : PURPLE
      }
    }
    c.fillStyle = `rgba(${rgb},${Math.min(alpha, 0.95)})`
    c.beginPath()
    c.arc(d.x * dpr, d.y * dpr, r * dpr, 0, 6.2832)
    c.fill()
  }

  // arcs
  drawArc(c, L, L.arcs.hyd, TIME.hyd, TIME.hyd + 0.8, T, PURPLE, true)
  drawArc(c, L, L.arcs.amr, TIME.amr, TIME.land, T, ORANGE, true)

  // region markers
  const marker = (p, from, rgb, size) => {
    const t = T - from
    if (t <= 0) return
    const s = easeOut(t / 0.5)
    glow(c, p.x * dpr, p.y * dpr, size * 2.6 * dpr * s, rgb, 0.55)
    c.fillStyle = `rgba(255,255,255,${s})`
    c.beginPath()
    c.arc(p.x * dpr, p.y * dpr, size * 0.55 * dpr * s, 0, 6.2832)
    c.fill()
    // slow ring
    const k = (t * 0.7) % 1
    c.strokeStyle = `rgba(${rgb},${0.6 * (1 - k) * s})`
    c.lineWidth = 1.2 * dpr
    c.beginPath()
    c.arc(p.x * dpr, p.y * dpr, (size * 0.8 + k * size * 3) * dpr, 0, 6.2832)
    c.stroke()
  }
  const u = Math.max(5, step * 0.7)
  marker(L.mumbai, TIME.mumbai, PURPLE, u)
  marker(L.hyd, TIME.hyd + 0.75, PURPLE, u * 0.85)
  marker(L.amr, TIME.land, ORANGE, u * 1.2)

  // labels
  const f = L.font
  label(c, L, L.mumbai.x - u * 1.4, L.mumbai.y + f * 0.4, PLACES.mumbai.code, PLACES.mumbai.city, 'right', easeOut((T - TIME.mumbai - 0.2) / 0.6) * dim, PURPLE)
  label(c, L, L.hyd.x + u * 1.5, L.hyd.y + f * 0.8, PLACES.hyd.code, PLACES.hyd.city, 'left', easeOut((T - TIME.hyd - 0.9) / 0.6) * dim, PURPLE)
  label(c, L, L.amr.x + u * 1.6, L.amr.y - f * 0.4, PLACES.amr.code, PLACES.amr.city, 'left', easeOut((T - TIME.land - 0.15) / 0.6), ORANGE)
}

export default function Loader({ onDone }) {
  const [gone, setGone] = useState(false)
  const [out, setOut] = useState(false)
  const done = useRef(onDone)
  done.current = onDone
  const fired = useRef(false)
  const timers = useRef([])
  const cvs = useRef(null)
  const titleRef = useRef(null)
  const barRef = useRef(null)
  const startedAt = useRef(0)

  const finish = useCallback(() => {
    if (fired.current) return
    fired.current = true
    try {
      sessionStorage.setItem('aws-intro-seen', '1')
    } catch {
      /* private mode: it just plays again next time */
    }
    done.current()
  }, [])

  const skip = useCallback(() => {
    timers.current.forEach(clearTimeout)
    timers.current = []
    finish()
    setOut(true)
    timers.current.push(setTimeout(() => setGone(true), 500))
  }, [finish])

  // decide at the start: no intro for reduced motion, or if this tab already saw it (unless ?intro is in the address)
  const skipAll = useRef(null)
  if (skipAll.current === null) {
    let seen = false
    try {
      seen = sessionStorage.getItem('aws-intro-seen') === '1' && !/[?&]intro\b/.test(window.location.search)
    } catch {
      seen = false
    }
    skipAll.current = reducedMotion() || seen || !!navigator.webdriver // speed-test robots go straight to the site
  }
  useEffect(() => {
    if (skipAll.current) {
      finish()
      setGone(true)
    }
  }, [finish])

  // Esc skips
  useEffect(() => {
    if (skipAll.current) return
    const onKey = (e) => {
      if (e.key === 'Escape') skip()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [skip])

  // the animation clock
  useEffect(() => {
    if (skipAll.current) return
    const canvas = cvs.current
    if (!canvas) return
    const c = canvas.getContext('2d')
    let L = layout(canvas)
    let raf = 0
    let titled = false
    const frame = (now) => {
      if (!startedAt.current) {
        startedAt.current = now
        timers.current.push(setTimeout(finish, TIME.open * 1000))
        timers.current.push(setTimeout(() => setOut(true), TIME.open * 1000))
        timers.current.push(setTimeout(() => setGone(true), TIME.end * 1000))
      }
      const T = (now - startedAt.current) / 1000
      if (window.innerWidth + 'x' + window.innerHeight !== L.key) L = layout(canvas)
      draw(c, L, T)
      if (!titled && T >= TIME.title && titleRef.current) {
        titled = true
        titleRef.current.classList.add('show')
      }
      if (barRef.current) barRef.current.style.transform = `scaleX(${clamp01(T / TIME.open)})`
      if (T < TIME.end) raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => {
      cancelAnimationFrame(raf)
      timers.current.forEach(clearTimeout)
      timers.current = []
    }
  }, [finish])

  if (gone || skipAll.current) return null

  return (
    <div className={'ldr' + (out ? ' is-out' : '')} role="dialog" aria-modal="true" aria-label={`${SITE.name} intro`} data-modal data-loader>
      <style>{CSS}</style>
      <div className="ldr-glow" />
      <canvas ref={cvs} className="ldr-cv" />

      <div className="ldr-tag">REGION CHECK · AWS SBG · SIPNA COET</div>

      <div ref={titleRef} className="ldr-title" aria-hidden="true">
        <div className="ldr-name">
          {TITLE.split('').map((ch, i) => (
            <span key={i} className={'ldr-ch' + (ch === ' ' ? ' sp' : '')} style={{ '--i': i }}>
              {ch === ' ' ? ' ' : ch}
            </span>
          ))}
        </div>
        <svg className="ldr-smile" viewBox="0 0 200 16" aria-hidden="true">
          <path d="M8 4c62 12 122 12 184 0" fill="none" stroke="#FF9900" strokeWidth="4" strokeLinecap="round" pathLength="1" />
        </svg>
        <div className="ldr-sub">{TAG}</div>
      </div>

      <button type="button" className="ldr-skip" onClick={skip} aria-label="Skip the intro">
        <span>SKIP</span>
        <span className="ldr-skip-bar">
          <i ref={barRef} />
        </span>
      </button>
    </div>
  )
}

const CSS = `
.ldr{position:fixed;inset:0;z-index:100;overflow:hidden;background:#07050f;color:#ece6ff;touch-action:none;overscroll-behavior:none;
  font-family:"JetBrains Mono",ui-monospace,SFMono-Regular,Menlo,monospace;-webkit-tap-highlight-color:transparent;
  -webkit-user-select:none;user-select:none;transition:opacity .7s ease}
.ldr.is-out{opacity:0;pointer-events:none}
.ldr-glow{position:absolute;inset:0;pointer-events:none;
  background:radial-gradient(60% 50% at 50% 40%,rgba(140,79,255,.16),transparent 70%),radial-gradient(40% 30% at 50% 100%,rgba(255,153,0,.06),transparent 70%)}
.ldr-cv{position:absolute;inset:0;width:100%;height:100%}

.ldr-tag{position:absolute;top:calc(1rem + env(safe-area-inset-top));left:1.1rem;font-size:10px;letter-spacing:.22em;color:rgba(181,140,255,.7)}

.ldr-title{position:absolute;left:0;right:0;bottom:calc(11% + env(safe-area-inset-bottom));display:flex;flex-direction:column;align-items:center;gap:10px;
  padding:0 14px;text-align:center;opacity:0;pointer-events:none}
.ldr-title.show{opacity:1}
.ldr-name{display:flex;flex-wrap:wrap;justify-content:center;font-weight:800;letter-spacing:.14em;font-size:clamp(20px,5.6vw,46px);line-height:1.1;
  font-family:"Space Grotesk","Inter",ui-sans-serif,system-ui,sans-serif;color:#fff;text-shadow:0 0 28px rgba(140,79,255,.55)}
.ldr-ch{display:inline-block;opacity:0;transform:translateY(14px);filter:blur(6px)}
.ldr-ch.sp{width:.55em}
.show .ldr-ch{animation:ldr-ch .7s cubic-bezier(.2,.8,.2,1) calc(var(--i)*.04s) both}
@keyframes ldr-ch{to{opacity:1;transform:none;filter:none}}
.ldr-smile{width:min(46vw,210px);height:auto;overflow:visible}
.ldr-smile path{stroke-dasharray:1;stroke-dashoffset:1}
.show .ldr-smile path{animation:ldr-smile .8s ease-out .55s forwards}
@keyframes ldr-smile{to{stroke-dashoffset:0}}
.ldr-sub{font-size:clamp(9px,2.4vw,12px);letter-spacing:.3em;color:rgba(236,230,255,.65);opacity:0}
.show .ldr-sub{animation:ldr-fade .8s ease-out .9s forwards}
@keyframes ldr-fade{to{opacity:1}}

.ldr-skip{position:absolute;right:1.1rem;bottom:calc(1.1rem + env(safe-area-inset-bottom));pointer-events:auto;display:flex;flex-direction:column;gap:6px;
  min-width:64px;padding:10px 12px;background:transparent;border:0;cursor:pointer;font-size:11px;letter-spacing:.2em;color:rgba(236,230,255,.7);text-align:center}
.ldr-skip:hover{color:#fff}
.ldr-skip-bar{display:block;height:2px;background:rgba(255,255,255,.14);overflow:hidden;border-radius:2px}
.ldr-skip-bar i{display:block;height:100%;background:#FF9900;transform-origin:left;transform:scaleX(0)}
`
