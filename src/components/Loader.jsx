import { useCallback, useEffect, useRef, useState } from 'react'
import { reducedMotion } from '../lib/scroll'
import { CUE, PIN_STEP, LOG_STEP, createIntroAudio } from '../lib/introAudio'
import { SITE } from '../data/site'

// ============================================================
//  INTRO  ("POWER ON" screen, then a chip boots up with sound, then the site opens)
//  Sound lives in src/lib/introAudio.js. Both files use the same timings (CUE).
//  Edit the boot-log lines and the title text here.
// ============================================================

const TITLE = SITE.name.toUpperCase()
const TAG = 'AWS STUDENT BUILDER GROUP AT SIPNA'
const LOG = [
  '> boot aws-sbg kernel v1.0',
  '> mount s3://sipna-aws-club',
  '> launch ec2 · lambda · dynamo',
  '> route vpc 10.0.0.0/16',
  '> load team + events',
  '> sync hall of fame',
  '> open cloud gateway',
  '> status: ONLINE',
]

// chip pins in a 160x160 drawing, clockwise from the top-left: 5 on each side
const SIDE = [50.7, 65.3, 80, 94.7, 109.3]
const PINS = [
  ...SIDE.map((x) => ({ x, y: 22, dir: [0, -1] })),
  ...SIDE.map((y) => ({ x: 138, y, dir: [1, 0] })),
  ...[...SIDE].reverse().map((x) => ({ x, y: 138, dir: [0, 1] })),
  ...[...SIDE].reverse().map((y) => ({ x: 22, y, dir: [-1, 0] })),
]

// ---------- circuit traces drawn on a canvas ----------
const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : x)
const smooth = (x) => {
  const t = clamp01(x)
  return t * t * (3 - 2 * t)
}
function rng(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function buildTraces(pins, w, h, unit) {
  const rand = rng(11)
  const k = Math.SQRT1_2
  return pins.map((p, i) => {
    const [dx, dy] = p.dir
    const side = rand() < 0.5 ? -1 : 1
    const px = -dy * side
    const py = dx * side
    const L1 = (26 + rand() * 80) * unit
    const L2 = (40 + rand() * 120) * unit
    const pts = [[p.x, p.y]]
    let x = p.x + dx * L1
    let y = p.y + dy * L1
    pts.push([x, y])
    x += (dx + px) * k * L2
    y += (dy + py) * k * L2
    pts.push([x, y])
    const pad = rand() < 0.3
    let run
    if (pad) run = (50 + rand() * 140) * unit
    else {
      const edge = dx > 0 ? (w - x) / dx : dx < 0 ? -x / -dx : dy > 0 ? (h - y) / dy : -y / -dy
      run = Math.max(30 * unit, edge + 20)
    }
    x += dx * run
    y += dy * run
    pts.push([x, y])
    const cum = [0]
    for (let j = 1; j < pts.length; j++) cum.push(cum[j - 1] + Math.hypot(pts[j][0] - pts[j - 1][0], pts[j][1] - pts[j - 1][1]))
    return {
      pts,
      cum,
      total: cum[cum.length - 1],
      pad,
      start: CUE.chip + 0.35 + i * 0.05,
      speed: (380 + rand() * 360) * unit,
      pspeed: (240 + rand() * 200) * unit,
      poff: rand() * 400 * unit,
    }
  })
}

function pointAt(tr, d) {
  const { pts, cum } = tr
  for (let j = 1; j < pts.length; j++) {
    if (d <= cum[j]) {
      const f = (d - cum[j - 1]) / (cum[j] - cum[j - 1] || 1)
      return [pts[j - 1][0] + (pts[j][0] - pts[j - 1][0]) * f, pts[j - 1][1] + (pts[j][1] - pts[j - 1][1]) * f]
    }
  }
  return pts[pts.length - 1]
}

function layoutCanvas(canvas, chipEl) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const w = window.innerWidth
  const h = window.innerHeight
  canvas.width = Math.round(w * dpr)
  canvas.height = Math.round(h * dpr)
  const r = chipEl.getBoundingClientRect()
  const k = r.width / 160
  const pins = PINS.map((p) => ({ x: (r.left + p.x * k) * dpr, y: (r.top + p.y * k) * dpr, dir: p.dir }))
  const unit = Math.max(0.55, Math.min(w, h) / 650) * dpr
  return { w: canvas.width, h: canvas.height, dpr, key: w + 'x' + h, traces: buildTraces(pins, canvas.width, canvas.height, unit) }
}

function drawTraces(c, L, T) {
  const { w, h, dpr, traces } = L
  c.clearRect(0, 0, w, h)
  c.globalCompositeOperation = 'lighter'
  c.lineCap = 'round'
  c.lineJoin = 'round'
  const heat = clamp01((T - CUE.riser) / (CUE.drop - CUE.riser))
  const after = T >= CUE.drop
  const flash = after ? clamp01(1 - (T - CUE.drop) / 0.5) : 0
  const alpha = after ? 0.16 + 0.55 * flash : 0.22 + 0.3 * heat
  const mix = Math.max(heat * 0.55, flash)
  const col = `${Math.round(140 + 100 * mix)},${Math.round(79 + 151 * mix)},255`
  const lw = (1.2 + 1.4 * heat + 2 * flash) * dpr * 0.85

  for (const tr of traces) {
    const head = (T - tr.start) * tr.speed
    if (head <= 0) continue
    const len = Math.min(head, tr.total)

    // the trace itself, up to the growing head
    c.strokeStyle = `rgba(${col},${alpha})`
    c.lineWidth = lw
    c.beginPath()
    c.moveTo(tr.pts[0][0], tr.pts[0][1])
    for (let j = 1; j < tr.pts.length && tr.cum[j - 1] < len; j++) {
      const [x, y] = pointAt(tr, Math.min(len, tr.cum[j]))
      c.lineTo(x, y)
    }
    c.stroke()

    // solder points at the bends
    c.lineWidth = dpr
    for (let j = 1; j < tr.pts.length - 1; j++) {
      if (len >= tr.cum[j]) {
        c.beginPath()
        c.arc(tr.pts[j][0], tr.pts[j][1], 2.6 * dpr, 0, 6.2832)
        c.stroke()
      }
    }
    if (tr.pad && head >= tr.total) {
      const e = tr.pts[tr.pts.length - 1]
      c.beginPath()
      c.arc(e[0], e[1], 5 * dpr, 0, 6.2832)
      c.stroke()
    }

    // glowing head while it grows
    if (head < tr.total) {
      const [hx, hy] = pointAt(tr, len)
      const gr = c.createRadialGradient(hx, hy, 0, hx, hy, 9 * dpr)
      gr.addColorStop(0, 'rgba(255,255,255,0.95)')
      gr.addColorStop(1, 'rgba(140,79,255,0)')
      c.fillStyle = gr
      c.beginPath()
      c.arc(hx, hy, 9 * dpr, 0, 6.2832)
      c.fill()
    }

    // data packets running along it
    if (len > 40 * dpr) {
      const sp = tr.pspeed * (1 + 2 * heat)
      for (let q = 0; q < 2; q++) {
        const d = (T * sp + tr.poff + q * len * 0.5) % len
        for (let t = 0; t < 4; t++) {
          const [x, y] = pointAt(tr, Math.max(0, d - t * 6 * dpr))
          c.fillStyle = `rgba(255,255,255,${(after ? 0.5 : 0.95) * (1 - t * 0.25)})`
          c.beginPath()
          c.arc(x, y, (2.3 - t * 0.35) * dpr, 0, 6.2832)
          c.fill()
        }
      }
    }
  }
}

// ---------- small icons ----------
const PowerIcon = () => (
  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 3v9" />
    <path d="M6.4 6.6a8 8 0 1 0 11.2 0" />
  </svg>
)
const SpeakerIcon = ({ off, size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M11 5 6 9H3v6h3l5 4V5z" />
    {off ? (
      <path d="m16 9 5 6M21 9l-5 6" />
    ) : (
      <>
        <path d="M15.5 8.5a5 5 0 0 1 0 7" />
        <path d="M18.5 5.5a9 9 0 0 1 0 13" />
      </>
    )}
  </svg>
)

function Chip() {
  return (
    <svg className="ldr-chip" viewBox="0 0 160 160" aria-hidden="true">
      <defs>
        <linearGradient id="ldr-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#B58CFF" />
          <stop offset="1" stopColor="#6A2BE0" />
        </linearGradient>
      </defs>
      {PINS.map((p, k) => {
        const vertical = p.dir[1] !== 0
        const x = vertical ? p.x - 3 : p.dir[0] < 0 ? 22 : 124
        const y = vertical ? (p.dir[1] < 0 ? 22 : 124) : p.y - 3
        return <rect key={k} className="ldr-pin" style={{ '--k': k }} x={x} y={y} width={vertical ? 6 : 14} height={vertical ? 14 : 6} rx="1.5" />
      })}
      <rect className="ldr-body" x="36" y="36" width="88" height="88" rx="7" pathLength="1" fill="rgba(140,79,255,0.08)" stroke="url(#ldr-g)" strokeWidth="3" />
      <rect className="ldr-core" x="62" y="62" width="36" height="36" rx="5" fill="url(#ldr-g)" />
      <text className="ldr-aws" x="80" y="85" textAnchor="middle">
        AWS
      </text>
      <circle cx="47" cy="47" r="2" fill="#B58CFF" opacity="0.7" />
    </svg>
  )
}

export default function Loader({ onDone }) {
  const [phase, setPhase] = useState('gate') // gate -> run -> gone   (or skip -> gone)
  const [ran, setRan] = useState(false)
  const [hasAudio, setHasAudio] = useState(false)
  const [muted, setMuted] = useState(false)

  const done = useRef(onDone)
  done.current = onDone
  const fired = useRef(false)
  const audio = useRef(null)
  const timers = useRef([])
  const t0 = useRef(0)
  const rootRef = useRef(null)
  const cvs = useRef(null)
  const chipBox = useRef(null)
  const numRef = useRef(null)
  const meterRef = useRef(null)
  const skipBar = useRef(null)

  const finish = useCallback(() => {
    if (fired.current) return
    fired.current = true
    done.current()
  }, [])

  // reduced motion: no intro at all
  useEffect(() => {
    if (reducedMotion()) {
      finish()
      setPhase('gone')
    }
    return () => {
      timers.current.forEach(clearTimeout)
      timers.current = []
      if (audio.current) audio.current.close()
    }
  }, [finish])

  const power = () => {
    if (phase !== 'gate') return
    let a = null
    try {
      a = createIntroAudio() // must happen inside this tap, or the browser keeps the sound blocked
    } catch {
      a = null
    }
    audio.current = a
    setHasAudio(!!a)
    setRan(true)
    setPhase('run')
  }

  const skip = () => {
    if (phase === 'gone' || phase === 'skip') return
    timers.current.forEach(clearTimeout)
    timers.current = []
    if (audio.current) audio.current.skip()
    finish()
    setPhase('skip')
    timers.current.push(setTimeout(() => setPhase('gone'), 900))
  }

  const toggleMute = () => {
    const m = !muted
    setMuted(m)
    if (audio.current) audio.current.setMuted(m)
  }

  // Esc skips
  const skipRef = useRef(skip)
  skipRef.current = skip
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') skipRef.current()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // the canvas, the counter and the skip-button progress run on one clock
  useEffect(() => {
    if (phase !== 'run') return
    const canvas = cvs.current
    const chip = chipBox.current
    if (!canvas || !chip) return
    const c = canvas.getContext('2d')
    let L = layoutCanvas(canvas, chip)
    let raf = 0
    let started = false
    const frame = (now) => {
      if (!started) {
        // The first frame is time zero for everything: the sound starts, every CSS animation is pinned to this
        // moment, and the timers are set. A slow first paint can then never put picture and sound out of step.
        started = true
        t0.current = now
        if (audio.current) audio.current.begin()
        try {
          if (rootRef.current) rootRef.current.getAnimations({ subtree: true }).forEach((a) => { a.startTime = now })
        } catch {
          /* older browsers: animations keep their own start */
        }
        timers.current.push(setTimeout(finish, CUE.open * 1000 + 60))
        timers.current.push(setTimeout(() => setPhase('gone'), CUE.end * 1000))
      }
      const T = (now - t0.current) / 1000
      if (window.innerWidth + 'x' + window.innerHeight !== L.key) L = layoutCanvas(canvas, chip)
      drawTraces(c, L, T)
      const p = smooth((T - 0.35) / (CUE.drop - 0.15 - 0.35))
      if (numRef.current) numRef.current.textContent = String(Math.round(p * 100)).padStart(3, '0')
      if (meterRef.current) meterRef.current.style.transform = `scaleX(${p})`
      if (skipBar.current) skipBar.current.style.transform = `scaleX(${clamp01(T / CUE.open)})`
      if (T < CUE.end) raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [phase, finish])

  // intro over: release the audio engine
  useEffect(() => {
    if (phase === 'gone' && audio.current) audio.current.close()
  }, [phase])

  if (phase === 'gone') return null

  const cls = ['ldr', ran && 'is-run', phase === 'skip' && 'is-skip'].filter(Boolean).join(' ')
  const vars = {
    '--crt': CUE.crt + 's',
    '--log': CUE.log + 's',
    '--chip': CUE.chip + 's',
    '--riser': CUE.riser + 's',
    '--drop': CUE.drop + 's',
    '--open': CUE.open + 's',
  }

  return (
    <div ref={rootRef} className={cls} style={vars} role="dialog" aria-modal="true" aria-label={`${SITE.name} intro`} data-modal data-loader>
      <style>{CSS}</style>

      {/* the screen is made of 6 shutters that slide apart at the end */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="ldr-sh" style={{ '--i': i, '--dir': i % 2 ? '101%' : '-101%' }} />
      ))}

      <div className="ldr-layer">
        <div className="ldr-stage">
          <div className="ldr-grid" />
          <div className="ldr-glow" />
          <canvas ref={cvs} className="ldr-cv" />
          <div className="ldr-bar" />
          <div className="ldr-scan" />
          <div className="ldr-vig" />

          <div ref={chipBox} className="ldr-chipwrap">
            <span className="ldr-halo" />
            <Chip />
            {[0, 0.14, 0.3].map((w, i) => (
              <span key={i} className="ldr-wave" style={{ '--w': w + 's' }} />
            ))}
          </div>

          <div className="ldr-lower">
            {/* before power on */}
            <div className="ldr-gateui">
              <button type="button" className="ldr-power" onClick={power} autoFocus aria-label="Power on: play the intro with sound">
                <PowerIcon />
              </button>
              <div className="ldr-plabel">
                PRESS TO POWER ON<span className="ldr-us">_</span>
              </div>
              <div className="ldr-psub">
                <SpeakerIcon size={13} />
                SOUND ON · BEST WITH HEADPHONES
              </div>
            </div>

            {/* boot log + counter */}
            {ran && (
              <div className="ldr-hud" aria-hidden="true">
                <div>
                  {LOG.map((t, i) => (
                    <div key={t} className={'ldr-row' + (i === LOG.length - 1 ? ' is-last' : '')} style={{ '--r': i, '--step': LOG_STEP + 's' }}>
                      <span className="ldr-typed" style={{ '--n': t.length }}>
                        {t}
                      </span>
                      <b className="ldr-ok">[ OK ]</b>
                    </div>
                  ))}
                </div>
                <div className="ldr-count">
                  <span>BOOTING CLOUD</span>
                  <span ref={numRef} className="ldr-num">
                    000
                  </span>
                </div>
                <div className="ldr-meter">
                  <i ref={meterRef} />
                </div>
              </div>
            )}

            {/* after the drop */}
            {ran && (
              <div className="ldr-title" aria-hidden="true">
                <div className="ldr-name">
                  {TITLE.split('').map((ch, i) => (
                    <span key={i} className={'ldr-ch' + (ch === ' ' ? ' sp' : '')} style={{ '--i': i }}>
                      {ch === ' ' ? ' ' : ch}
                    </span>
                  ))}
                </div>
                <svg className="ldr-smile" viewBox="0 0 200 16" aria-hidden="true">
                  <path d="M8 4c62 12 122 12 184 0" fill="none" stroke="#FF9900" strokeWidth="4" strokeLinecap="round" pathLength="1" />
                </svg>
                <div className="ldr-sub">{TAG}</div>
              </div>
            )}
          </div>
        </div>

        <i className="ldr-cn tl" />
        <i className="ldr-cn tr" />
        <i className="ldr-cn bl" />
        <i className="ldr-cn br" />
        <div className="ldr-tag">AWS SBG · SIPNA COET</div>
        <div className="ldr-flash" />
        <div className="ldr-line" />
      </div>

      {/* buttons stay above everything */}
      {ran && hasAudio && (
        <button type="button" className="ldr-mute ldr-fadeui" onClick={toggleMute} aria-label={muted ? 'Turn sound on' : 'Turn sound off'} aria-pressed={muted}>
          <SpeakerIcon off={muted} />
        </button>
      )}
      <div className="ldr-skipwrap ldr-fadeui">
        <button type="button" className="ldr-skip" onClick={skip} aria-label="Skip the intro">
          <span className="ldr-skip-ring" aria-hidden="true" />
          <span className="ldr-skip-in">
            <span className="ldr-glitch" data-t="SKIP INTRO">
              SKIP INTRO
            </span>
            <span className="ldr-chev" aria-hidden="true">
              <i style={{ '--k': 0 }} />
              <i style={{ '--k': 1 }} />
              <i style={{ '--k': 2 }} />
            </span>
            <span ref={skipBar} className="ldr-skip-bar" />
          </span>
        </button>
      </div>
    </div>
  )
}

const CSS = `
@property --ldr-a{syntax:"<angle>";initial-value:0deg;inherits:false}
.ldr{position:fixed;inset:0;z-index:100;overflow:hidden;touch-action:none;overscroll-behavior:none;color:#ece6ff;
  font-family:"JetBrains Mono",ui-monospace,SFMono-Regular,Menlo,monospace;-webkit-tap-highlight-color:transparent;
  -webkit-user-select:none;user-select:none}
.ldr button{font:inherit;color:inherit}

/* shutters (the dark background) */
.ldr-sh{position:absolute;top:0;bottom:0;left:calc(var(--i)*100%/6);width:calc(100%/6 + 1px);background:#05030b}
.ldr-sh::after{content:"";position:absolute;top:0;bottom:0;right:0;width:1px;background:linear-gradient(transparent,rgba(181,140,255,.55),transparent)}
.is-run .ldr-sh{animation:ldr-sh .85s cubic-bezier(.76,0,.24,1) calc(var(--open) + var(--i)*.06s) both}
.is-skip .ldr-sh{animation:ldr-sh-skip .6s cubic-bezier(.76,0,.24,1) calc(.1s + var(--i)*.035s) both}
@keyframes ldr-sh{to{transform:translateY(var(--dir))}}
@keyframes ldr-sh-skip{to{transform:translateY(var(--dir))}}

.ldr-layer{position:absolute;inset:0;pointer-events:none}
.is-run .ldr-layer{animation:ldr-fly .45s ease-in var(--open) both}
.is-skip .ldr-layer{animation:ldr-fly-skip .25s ease-in both}
@keyframes ldr-fly{to{opacity:0;transform:scale(1.12)}}
@keyframes ldr-fly-skip{to{opacity:0;transform:scale(1.05)}}

.ldr-stage{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;padding:0 16px 84px}
.is-run .ldr-stage{animation:
  ldr-crt .6s cubic-bezier(.2,.9,.2,1) var(--crt) both,
  ldr-tremble2 .06s linear calc(var(--drop) - .85s) 14 alternate,
  ldr-shake .6s ease-out var(--drop)}
@keyframes ldr-crt{
  0%{clip-path:inset(49.6% 0 49.6% 0)}
  30%{clip-path:inset(49.6% 0 49.6% 0)}
  100%{clip-path:inset(0 0 0 0)}}
@keyframes ldr-tremble2{from{transform:translate(-2.2px,1.2px)}to{transform:translate(2.2px,-1.2px)}}
@keyframes ldr-tremble{from{transform:translate(-1px,.6px)}to{transform:translate(1px,-.6px)}}
@keyframes ldr-shake{
  0%{transform:translate(0,0)}8%{transform:translate(-12px,6px)}16%{transform:translate(11px,-7px)}
  26%{transform:translate(-8px,5px)}38%{transform:translate(6px,-4px)}52%{transform:translate(-3px,2px)}
  70%{transform:translate(2px,-1px)}100%{transform:translate(0,0)}}

/* background */
.ldr-grid{position:absolute;inset:-48px 0;background-image:linear-gradient(rgba(140,79,255,.11) 1px,transparent 1px),linear-gradient(90deg,rgba(140,79,255,.11) 1px,transparent 1px);
  background-size:48px 48px;-webkit-mask-image:radial-gradient(ellipse at 50% 42%,#000 0,transparent 72%);mask-image:radial-gradient(ellipse at 50% 42%,#000 0,transparent 72%);
  animation:ldr-grid 3s linear infinite}
@keyframes ldr-grid{to{transform:translateY(48px)}}
.ldr-glow{position:absolute;left:50%;top:40%;width:120vmin;height:120vmin;transform:translate(-50%,-50%);border-radius:50%;
  background:radial-gradient(circle,rgba(140,79,255,.26),transparent 62%)}
.ldr-cv{position:absolute;inset:0;width:100%;height:100%}
.ldr-bar{position:absolute;left:0;right:0;top:-130px;height:130px;background:linear-gradient(180deg,transparent,rgba(181,140,255,.1),transparent);animation:ldr-bar 3.2s linear infinite}
@keyframes ldr-bar{to{transform:translateY(calc(100vh + 260px))}}
.ldr-scan{position:absolute;inset:0;opacity:.55;background:repeating-linear-gradient(0deg,rgba(0,0,0,.25) 0 1px,transparent 1px 3px)}
.ldr-vig{position:absolute;inset:0;background:radial-gradient(ellipse at 50% 45%,transparent 45%,rgba(0,0,0,.7))}

/* chip */
.ldr-chipwrap{position:relative;flex:none;width:clamp(120px,min(52vw,30vh),220px);aspect-ratio:1}
.is-run .ldr-chipwrap{animation:
  ldr-tremble .06s linear var(--riser) 28 alternate,
  ldr-pop .6s cubic-bezier(.2,1.5,.3,1) var(--drop)}
@keyframes ldr-pop{0%{transform:scale(1)}30%{transform:scale(1.22)}100%{transform:scale(1)}}
.ldr-chip{position:relative;display:block;width:100%;height:100%;overflow:visible;filter:drop-shadow(0 0 10px rgba(140,79,255,.55))}
.ldr-halo{position:absolute;inset:-40%;border-radius:50%;opacity:0;background:radial-gradient(circle,rgba(214,190,255,.95) 0,rgba(140,79,255,.42) 34%,transparent 64%)}
.is-run .ldr-halo{animation:
  ldr-halo 1.7s ease-in var(--riser) both,
  ldr-halo2 1s ease-out var(--drop) forwards}
@keyframes ldr-halo{from{opacity:0;transform:scale(.7)}to{opacity:.85;transform:scale(1)}}
@keyframes ldr-halo2{from{opacity:1;transform:scale(1.7)}to{opacity:.3;transform:scale(1)}}
.ldr-body{stroke-dasharray:1;stroke-dashoffset:0;opacity:.4}
.is-run .ldr-body{animation:ldr-draw 1.1s ease-in-out var(--chip) both}
@keyframes ldr-draw{from{stroke-dashoffset:1;opacity:1}to{stroke-dashoffset:0;opacity:1}}
.ldr-pin{fill:#b58cff;opacity:.22}
.is-run .ldr-pin{animation:ldr-pin .4s ease-out calc(var(--chip) + var(--k)*${PIN_STEP}s) both}
@keyframes ldr-pin{from{opacity:0;fill:#fff}50%{opacity:1;fill:#fff}to{opacity:1;fill:#b58cff}}
.ldr-core{opacity:.25;transform-box:fill-box;transform-origin:center}
.is-run .ldr-core{animation:
  ldr-corein .5s ease-out calc(var(--chip) + 1.2s) both,
  ldr-beat .5s ease-in-out calc(var(--chip) + 1.8s) infinite alternate}
@keyframes ldr-corein{from{opacity:0;transform:scale(.4)}to{opacity:1;transform:scale(1)}}
@keyframes ldr-beat{from{transform:scale(1)}to{transform:scale(1.08)}}
.ldr-aws{font:800 13px "Sora Variable","Inter Variable",sans-serif;letter-spacing:.04em;fill:#fff;opacity:0}
.is-run .ldr-aws{animation:ldr-in .3s ease-out calc(var(--chip) + 1.5s) both}
@keyframes ldr-in{to{opacity:1}}
.ldr-wave{position:absolute;inset:0;border-radius:50%;border:2px solid #b58cff;opacity:0}
.is-run .ldr-wave{animation:ldr-wave 1.2s cubic-bezier(.1,.7,.2,1) calc(var(--drop) + var(--w)) forwards}
@keyframes ldr-wave{from{opacity:.9;transform:scale(.4)}to{opacity:0;transform:scale(7)}}

/* lower block: power button, then boot log, then the title */
.ldr-lower{position:relative;flex:none;width:min(88vw,360px);height:196px}
.ldr-gateui{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;gap:12px;padding-top:8px;pointer-events:auto}
.is-run .ldr-gateui{pointer-events:none;animation:ldr-gateout .2s ease-in both}
@keyframes ldr-gateout{to{opacity:0;transform:scale(.9)}}
.ldr-power{position:relative;display:grid;place-items:center;width:84px;height:84px;border-radius:50%;cursor:pointer;color:#e6d9ff;
  background:radial-gradient(circle at 50% 35%,rgba(140,79,255,.4),rgba(20,10,40,.92) 70%);border:1.5px solid rgba(181,140,255,.75);
  box-shadow:0 0 28px rgba(140,79,255,.6),inset 0 0 18px rgba(140,79,255,.35);transition:transform .15s,box-shadow .2s;touch-action:manipulation}
.ldr-power:hover{transform:scale(1.07);box-shadow:0 0 44px rgba(160,110,255,.85),inset 0 0 22px rgba(140,79,255,.5)}
.ldr-power:active{transform:scale(.93)}
.ldr-power:focus-visible{outline:2px solid #b58cff;outline-offset:11px}
.ldr-power::before{content:"";position:absolute;inset:-9px;border-radius:50%;border:1.5px dashed rgba(181,140,255,.55);animation:ldr-spin 9s linear infinite}
.ldr-power::after{content:"";position:absolute;inset:0;border-radius:50%;border:1.5px solid #8c4fff;animation:ldr-pulse 2.2s ease-out infinite}
.ldr-power svg{filter:drop-shadow(0 0 7px #b58cff);animation:ldr-flick 3.4s steps(1) infinite}
@keyframes ldr-spin{to{transform:rotate(360deg)}}
@keyframes ldr-pulse{from{transform:scale(1);opacity:.8}to{transform:scale(1.9);opacity:0}}
@keyframes ldr-flick{0%,88%,92%,100%{opacity:1}90%{opacity:.35}94%{opacity:.6}}
.ldr-plabel{margin-top:8px;font-size:11px;letter-spacing:.4em;text-indent:.4em;color:#fff;text-align:center;white-space:nowrap}
.ldr-us{animation:ldr-blink 1.2s steps(1) infinite}
@keyframes ldr-blink{50%{opacity:0}}
.ldr-psub{display:flex;align-items:center;gap:6px;font-size:9.5px;letter-spacing:.2em;color:rgba(217,198,255,.58);text-align:center}

.ldr-hud{position:absolute;inset:0;isolation:isolate}
.ldr-hud::before{content:"";position:absolute;inset:-6px -10px;z-index:-1;border-radius:12px;background:rgba(5,3,11,.6);box-shadow:0 0 18px 12px rgba(5,3,11,.6)}
.is-run .ldr-hud{animation:ldr-hudout .3s ease-in var(--drop) both}
@keyframes ldr-hudout{to{opacity:0;transform:translateY(-8px)}}
.ldr-row{display:flex;align-items:center;font-size:10.5px;line-height:17px;color:rgba(217,198,255,.8);white-space:nowrap}
.ldr-row.is-last{color:#ff9900}
.ldr-typed{display:block;overflow:hidden;width:calc(var(--n)*1ch)}
.is-run .ldr-typed{animation:ldr-type .24s steps(var(--n)) calc(var(--log) + var(--r)*var(--step)) both}
@keyframes ldr-type{from{width:0}}
.ldr-ok{margin-left:auto;font-weight:700;color:#b58cff;opacity:0}
.is-last .ldr-ok{color:#ff9900}
.is-run .ldr-ok{animation:ldr-in .01s steps(1) calc(var(--log) + var(--r)*var(--step) + .22s) both}
.ldr-count{display:flex;justify-content:space-between;align-items:baseline;margin-top:8px;padding-top:8px;border-top:1px solid rgba(181,140,255,.25);
  font-size:10px;letter-spacing:.26em;color:rgba(217,198,255,.62)}
.ldr-num{font-size:26px;letter-spacing:.02em;color:#fff;font-variant-numeric:tabular-nums;text-shadow:0 0 14px rgba(140,79,255,.9)}
.ldr-meter{height:2px;margin-top:6px;background:rgba(255,255,255,.09)}
.ldr-meter i{display:block;height:100%;transform-origin:left;transform:scaleX(0);background:linear-gradient(90deg,#8c4fff,#ff9900)}

.ldr-title{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;text-align:center}
.ldr-name{display:flex;white-space:nowrap;font-family:"Sora Variable","Inter Variable",ui-sans-serif,sans-serif;font-weight:800;
  font-size:clamp(1.3rem,6.2vw,3.4rem);letter-spacing:.12em;color:#fff;text-shadow:0 0 22px rgba(140,79,255,.95)}
.is-run .ldr-name{animation:ldr-rgb .5s steps(1) calc(var(--drop) + .8s) 3}
@keyframes ldr-rgb{
  0%{text-shadow:-3px 0 #ff2d95,3px 0 #22e3ff,0 0 22px rgba(140,79,255,.95)}
  34%{text-shadow:3px 0 #ff2d95,-3px 0 #22e3ff,0 0 22px rgba(140,79,255,.95)}
  67%{text-shadow:-2px 1px #ff2d95,2px -1px #22e3ff,0 0 22px rgba(140,79,255,.95)}
  100%{text-shadow:0 0 22px rgba(140,79,255,.95)}}
.ldr-ch{display:inline-block;opacity:0}
.ldr-ch.sp{width:.45em}
.is-run .ldr-ch{animation:ldr-slam .55s cubic-bezier(.2,1.3,.3,1) calc(var(--drop) + .05s + var(--i)*.045s) both}
@keyframes ldr-slam{
  from{opacity:0;transform:translateY(34px) scale(2.5) skewX(-18deg);filter:blur(14px)}
  55%{opacity:1;filter:blur(0)}
  to{opacity:1;transform:none;filter:blur(0)}}
.ldr-smile{width:min(46%,200px);overflow:visible}
.ldr-smile path{stroke-dasharray:1;stroke-dashoffset:1}
.is-run .ldr-smile path{animation:ldr-draw2 .5s ease-out calc(var(--drop) + .8s) forwards}
@keyframes ldr-draw2{to{stroke-dashoffset:0}}
.ldr-sub{max-width:300px;font-size:10px;letter-spacing:.28em;line-height:1.7;color:#b58cff;text-wrap:balance;opacity:0}
.is-run .ldr-sub{animation:ldr-rise .6s ease-out calc(var(--drop) + .9s) both}
@keyframes ldr-rise{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}

/* frame, flash, crt line */
.ldr-cn{position:absolute;width:22px;height:22px;border:2px solid rgba(181,140,255,.55);opacity:.8}
.ldr-cn.tl{top:max(10px,env(safe-area-inset-top));left:10px;border-right:0;border-bottom:0}
.ldr-cn.tr{top:max(10px,env(safe-area-inset-top));right:10px;border-left:0;border-bottom:0}
.ldr-cn.bl{bottom:10px;left:10px;border-right:0;border-top:0}
.ldr-cn.br{bottom:10px;right:10px;border-left:0;border-top:0}
.ldr-tag{position:absolute;top:max(22px,calc(env(safe-area-inset-top) + 14px));left:0;right:0;text-align:center;font-size:9px;letter-spacing:.34em;color:rgba(181,140,255,.6)}
.ldr-flash{position:absolute;inset:0;opacity:0;background:radial-gradient(circle at 50% 40%,#fff 0,#eadfff 28%,#8c4fff 75%)}
.is-run .ldr-flash{animation:ldr-flash 1s ease-out var(--drop) forwards}
@keyframes ldr-flash{from{opacity:1}to{opacity:0}}
.ldr-line{position:absolute;left:0;right:0;top:calc(50% - 1px);height:2px;opacity:0;background:linear-gradient(90deg,transparent,#fff 15%,#fff 85%,transparent);box-shadow:0 0 22px 4px rgba(181,140,255,.9)}
.is-run .ldr-line{animation:ldr-lineflash .5s ease-out var(--crt) both}
@keyframes ldr-lineflash{0%{opacity:1;transform:scaleX(0)}30%{opacity:1;transform:scaleX(1)}100%{opacity:0;transform:scaleX(1) scaleY(.2)}}

/* buttons: skip + mute */
.ldr-skipwrap,.ldr-mute{position:absolute;z-index:5}
.ldr-skipwrap{left:50%;bottom:max(18px,calc(env(safe-area-inset-bottom) + 12px));transform:translateX(-50%)}
.ldr-skip{position:relative;display:block;padding:1.5px;border:0;border-radius:999px;background:transparent;cursor:pointer;touch-action:manipulation;transition:transform .15s}
.ldr-skip:hover{transform:scale(1.05)}
.ldr-skip:active{transform:scale(.93)}
.ldr-skip:focus-visible{outline:2px solid #fff;outline-offset:4px}
.ldr-skip-ring{position:absolute;inset:0;border-radius:999px;animation:ldr-ring 3.4s linear infinite;
  background:conic-gradient(from var(--ldr-a),transparent 0 42%,#8c4fff 66%,#ff9900 88%,transparent)}
@keyframes ldr-ring{to{--ldr-a:360deg}}
.ldr-skip-in{position:relative;display:flex;align-items:center;gap:12px;height:48px;padding:0 20px 0 24px;border-radius:999px;overflow:hidden;
  background:rgba(10,6,20,.92);box-shadow:0 0 24px rgba(140,79,255,.35)}
.ldr-glitch{position:relative;font-size:12px;font-weight:700;letter-spacing:.32em;color:#fff;white-space:nowrap}
.ldr-glitch::before,.ldr-glitch::after{content:attr(data-t);position:absolute;left:0;top:0;width:100%;overflow:hidden;clip-path:inset(0 0 100% 0)}
.ldr-glitch::before{color:#ff2d95;animation:ldr-g1 2.6s steps(1) infinite}
.ldr-glitch::after{color:#22e3ff;animation:ldr-g2 2.6s steps(1) infinite .12s}
@keyframes ldr-g1{0%,90%,100%{clip-path:inset(0 0 100% 0);transform:none}91%{clip-path:inset(8% 0 52% 0);transform:translateX(-3px)}95%{clip-path:inset(58% 0 6% 0);transform:translateX(3px)}}
@keyframes ldr-g2{0%,90%,100%{clip-path:inset(0 0 100% 0);transform:none}92%{clip-path:inset(40% 0 20% 0);transform:translateX(3px)}96%{clip-path:inset(5% 0 70% 0);transform:translateX(-3px)}}
.ldr-chev{display:flex;align-items:center}
.ldr-chev i{display:block;width:8px;height:8px;margin-left:-3px;border-top:2px solid #b58cff;border-right:2px solid #b58cff;transform:rotate(45deg);
  animation:ldr-chev 1s ease-in-out infinite;animation-delay:calc(var(--k)*.14s)}
@keyframes ldr-chev{0%,100%{opacity:.18;transform:rotate(45deg) translate(-2px,2px)}50%{opacity:1;transform:rotate(45deg) translate(2px,-2px)}}
.ldr-skip-bar{position:absolute;left:0;right:0;bottom:0;height:2px;transform-origin:left;transform:scaleX(0);background:linear-gradient(90deg,#8c4fff,#ff9900)}
.ldr-mute{top:max(36px,calc(env(safe-area-inset-top) + 30px));right:22px;display:grid;place-items:center;width:44px;height:44px;border-radius:50%;cursor:pointer;
  color:#d9c6ff;background:rgba(10,6,20,.75);border:1px solid rgba(181,140,255,.45);touch-action:manipulation;opacity:0;transition:transform .15s,background .2s}
.ldr-mute:hover{background:rgba(140,79,255,.3)}
.ldr-mute:active{transform:scale(.9)}
.ldr-mute:focus-visible{outline:2px solid #fff;outline-offset:3px}
.is-run .ldr-mute{animation:ldr-in .3s ease-out calc(var(--crt) + .5s) both}
.is-run .ldr-fadeui{animation:ldr-uiout .3s ease-in var(--open) both}
.is-run .ldr-mute.ldr-fadeui{animation:ldr-in .3s ease-out calc(var(--crt) + .5s) both,ldr-uiout .3s ease-in var(--open) both}
.is-skip .ldr-fadeui{animation:ldr-uiout-skip .2s ease-in both !important;pointer-events:none}
@keyframes ldr-uiout{to{opacity:0;pointer-events:none}}
@keyframes ldr-uiout-skip{to{opacity:0}}

@media (min-width:768px){
  .ldr-lower{height:216px}
  .ldr-row{font-size:12px;line-height:20px}
  .ldr-skipwrap{left:auto;right:36px;bottom:32px;transform:none}
  .ldr-mute{top:34px;right:36px}
  .ldr-sub{font-size:11px;letter-spacing:.34em;max-width:420px}
  .ldr-psub{font-size:10.5px}
}
@media (max-height:520px){
  .ldr-tag{display:none}
  .ldr-stage{gap:8px;padding-bottom:64px}
  .ldr-chipwrap{width:clamp(80px,26vh,150px)}
  .ldr-lower{height:150px}
  .ldr-row{font-size:9px;line-height:13px}
  .ldr-num{font-size:18px}
}
@media (prefers-reduced-motion:reduce){.ldr *{animation-duration:.001s !important;animation-delay:0s !important}}
`
