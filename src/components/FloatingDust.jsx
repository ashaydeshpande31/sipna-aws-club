import { useEffect, useRef } from 'react'

// ------------------------------------------------------------
//  Calm background: tiny soft dots that drift slowly upward, like dust floating in light.
//   - three depths: far dots are small, faint and slow, near dots are a bit bigger and quicker
//   - each dot sways gently from side to side
//   - dots move a little when you scroll, and lean very slightly with the mouse
//   - mostly pale violet, a few AWS orange
//  No flashing, no lines, nothing that jumps.
// ------------------------------------------------------------

const BRIGHTNESS = 0.8 // 1 = strong, 0.8 = calm, 0.5 = very faint
const SPEED = 1 // 1 = normal, 0.5 = half as fast

// far to near
const DEPTHS = [
  { share: 0.5, r: [0.8, 1.4], rise: [4, 8], alpha: 0.35, scroll: 0.02, mouse: 3 },
  { share: 0.33, r: [1.4, 2.2], rise: [8, 14], alpha: 0.45, scroll: 0.05, mouse: 7 },
  { share: 0.17, r: [2.2, 3.4], rise: [14, 22], alpha: 0.5, scroll: 0.1, mouse: 14 },
]

const rnd = (a, b) => a + Math.random() * (b - a)
const mod = (n, m) => ((n % m) + m) % m

function makeGlow(rgb) {
  const s = document.createElement('canvas')
  s.width = s.height = 32
  const g = s.getContext('2d')
  const gr = g.createRadialGradient(16, 16, 0, 16, 16, 16)
  gr.addColorStop(0, `rgba(${rgb},1)`)
  gr.addColorStop(0.4, `rgba(${rgb},0.4)`)
  gr.addColorStop(1, `rgba(${rgb},0)`)
  g.fillStyle = gr
  g.fillRect(0, 0, 32, 32)
  return s
}

export default function FloatingDust() {
  const ref = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const sprites = { violet: makeGlow('200,175,255'), orange: makeGlow('255,170,60') }

    let W = 0
    let H = 0
    let dots = []
    let raf = 0
    let last = performance.now()
    let t = 0
    let mx = 0
    let my = 0
    let lx = 0
    let ly = 0
    let pointerOn = false

    const build = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      W = window.innerWidth
      H = window.innerHeight
      canvas.width = Math.round(W * dpr)
      canvas.height = Math.round(H * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const total = W < 700 ? 32 : 90
      dots = []
      DEPTHS.forEach((D, di) => {
        const n = Math.round(total * D.share)
        for (let i = 0; i < n; i++) {
          dots.push({
            di,
            x: Math.random() * W,
            y: Math.random() * (H + 200),
            r: rnd(D.r[0], D.r[1]),
            rise: rnd(D.rise[0], D.rise[1]),
            sway: rnd(6, 18),
            swaySpeed: rnd(0.15, 0.4),
            ph: rnd(0, 6.283),
            warm: Math.random() < 0.07,
          })
        }
      })
    }

    const frame = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      t += dt
      const scrollY = window.scrollY
      lx += ((pointerOn ? mx : 0) - lx) * Math.min(1, dt * 2)
      ly += ((pointerOn ? my : 0) - ly) * Math.min(1, dt * 2)

      ctx.clearRect(0, 0, W, H)
      ctx.globalCompositeOperation = 'lighter'
      const field = H + 200
      for (const d of dots) {
        const D = DEPTHS[d.di]
        d.y -= d.rise * SPEED * dt
        if (d.y < -100) {
          d.y = H + 100
          d.x = Math.random() * W
        }
        const y = mod(d.y - scrollY * D.scroll + 100, field) - 100 + ly * D.mouse
        const x = d.x + Math.sin(t * d.swaySpeed + d.ph) * d.sway + lx * D.mouse
        // fade near the top and bottom of the screen
        const edge = Math.max(0, Math.min(1, Math.min(y + 40, H - y + 40) / 160))
        ctx.globalAlpha = D.alpha * edge * BRIGHTNESS
        const size = d.r * 6
        ctx.drawImage(d.warm ? sprites.orange : sprites.violet, x - size / 2, y - size / 2, size, size)
      }
      ctx.globalAlpha = 1
      ctx.globalCompositeOperation = 'source-over'
      if (!reduce) raf = requestAnimationFrame(frame)
    }

    const onMove = (e) => {
      if (e.pointerType !== 'mouse') return
      mx = (e.clientX / W) * 2 - 1
      my = (e.clientY / H) * 2 - 1
      pointerOn = true
    }
    const onLeave = () => {
      pointerOn = false
    }
    const onResize = () => {
      build()
      if (reduce) frame(performance.now())
    }

    build()
    window.addEventListener('resize', onResize)
    if (!reduce) {
      window.addEventListener('pointermove', onMove, { passive: true })
      document.addEventListener('pointerleave', onLeave)
    }
    raf = requestAnimationFrame(frame)
    // stop drawing while the tab / app is in the background
    const onVis = () => {
      cancelAnimationFrame(raf)
      if (!document.hidden && !reduce) {
        last = performance.now()
        raf = requestAnimationFrame(frame)
      }
    }
    document.addEventListener('visibilitychange', onVis)
    return () => {
      cancelAnimationFrame(raf)
      document.removeEventListener('visibilitychange', onVis)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  return <canvas ref={ref} className="absolute left-0 top-0 h-full w-full" aria-hidden="true" />
}
