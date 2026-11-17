import { useEffect, useRef } from 'react'

// ------------------------------------------------------------
//  Night sky above the clouds, drawn on one canvas:
//   - three layers of soft clouds drifting sideways, moving at different speeds when you scroll
//     and leaning a little with the mouse (far layers move least)
//   - twinkling stars
//   - (optional, off by default) flashes of light inside clouds and shooting stars
//   - a click or tap sends a soft ring spreading across the sky
//  Everything is drawn once into small pictures and then only moved, so it stays light.
// ------------------------------------------------------------

// Calm settings. If you want more life, turn things up here.
const BRIGHTNESS = 0.6 // 1 = strong, 0.6 = calm, 0.4 = very faint
const SHOW_FLASHES = false // glow that pulses inside a cloud every so often
const SHOW_SHOOTING_STARS = false // a shooting star every few seconds
const TWINKLE = 0.18 // how much stars fade in and out (0 = steady)

const LAYERS = [
  // far: big, deep violet, slow
  { n: 5, w: [520, 780], color: [106, 43, 224], alpha: 0.2, speed: 2, scroll: 0.015, mouse: 3 },
  // middle
  { n: 5, w: [360, 540], color: [140, 79, 255], alpha: 0.22, speed: 4, scroll: 0.035, mouse: 6 },
  // near: smaller, lighter, quicker
  { n: 4, w: [260, 400], color: [181, 140, 255], alpha: 0.17, speed: 6, scroll: 0.06, mouse: 10 },
]

const rnd = (a, b) => a + Math.random() * (b - a)
const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`
const mod = (n, m) => ((n % m) + m) % m

// one cloud picture: soft overlapping puffs, taller in the middle, flat-ish underneath
function makeCloud(w, color, alpha) {
  const h = Math.round(w * 0.46)
  const s = document.createElement('canvas')
  s.width = w
  s.height = h
  const g = s.getContext('2d')
  const puffs = 9 + Math.floor(Math.random() * 5)
  for (let k = 0; k < puffs; k++) {
    const t = k / (puffs - 1)
    const bump = Math.sin(t * Math.PI)
    const x = w * (0.14 + 0.72 * t)
    const r = w * (0.09 + 0.1 * bump * Math.random() + 0.04 * Math.random())
    const y = h * (0.72 - 0.34 * bump * Math.random()) - r * 0.2
    const gr = g.createRadialGradient(x, y, 0, x, y, r)
    gr.addColorStop(0, rgba(color, alpha))
    gr.addColorStop(0.6, rgba(color, alpha * 0.5))
    gr.addColorStop(1, rgba(color, 0))
    g.fillStyle = gr
    g.beginPath()
    g.arc(x, y, r, 0, Math.PI * 2)
    g.fill()
  }
  return s
}

// round glow, drawn once
function makeGlow(color) {
  const s = document.createElement('canvas')
  s.width = s.height = 64
  const g = s.getContext('2d')
  const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32)
  gr.addColorStop(0, rgba(color, 1))
  gr.addColorStop(0.3, rgba(color, 0.45))
  gr.addColorStop(1, rgba(color, 0))
  g.fillStyle = gr
  g.fillRect(0, 0, 64, 64)
  return s
}

export default function CloudSky() {
  const ref = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const glows = { violet: makeGlow([181, 140, 255]), orange: makeGlow([255, 153, 0]), white: makeGlow([235, 225, 255]) }

    let W = 0
    let H = 0
    let small = false
    let clouds = []
    let stars = []
    let comets = []
    let rings = []
    let raf = 0
    let last = performance.now()
    let t = 0
    let nextFlash = 3
    let nextComet = 4
    // mouse (or a slow wander on phones) leans the layers
    let mx = 0
    let my = 0
    let lx = 0
    let ly = 0
    let pointerOn = false

    const build = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      W = window.innerWidth
      H = window.innerHeight
      small = W < 700
      canvas.width = Math.round(W * dpr)
      canvas.height = Math.round(H * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      const k = small ? 0.62 : 1
      clouds = []
      LAYERS.forEach((L, li) => {
        const n = Math.max(2, L.n - (small ? 1 : 0))
        for (let i = 0; i < n; i++) {
          const w = Math.round(rnd(L.w[0], L.w[1]) * k)
          clouds.push({
            li,
            sprite: makeCloud(w, L.color, L.alpha),
            w,
            h: Math.round(w * 0.46),
            x: rnd(-w, W),
            base: rnd(0, H + 500), // position in the layer's endless column
            flash: 0,
            warm: Math.random() < 0.3,
          })
        }
      })

      stars = Array.from({ length: small ? 55 : 120 }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        r: rnd(0.5, 1.5),
        ph: Math.random() * 6.28,
        sp: rnd(0.3, 0.9),
        warm: Math.random() < 0.08,
      }))
    }

    const frame = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      t += dt
      const scrollY = window.scrollY

      // lean with the pointer, or drift on its own when there is none
      const tx = pointerOn ? mx : Math.sin(t * 0.1) * 0.4
      const ty = pointerOn ? my : Math.cos(t * 0.13) * 0.3
      lx += (tx - lx) * Math.min(1, dt * 2.5)
      ly += (ty - ly) * Math.min(1, dt * 2.5)

      ctx.globalCompositeOperation = 'source-over'
      ctx.globalAlpha = 1
      ctx.clearRect(0, 0, W, H)

      // stars
      ctx.globalCompositeOperation = 'lighter'
      for (const s of stars) {
        const y = mod(s.y - scrollY * 0.03, H)
        const a = (0.3 + TWINKLE * (0.5 + 0.5 * Math.sin(t * s.sp + s.ph))) * BRIGHTNESS
        ctx.globalAlpha = a
        ctx.fillStyle = s.warm ? '#ffb84d' : '#e6dcff'
        ctx.beginPath()
        ctx.arc(s.x + lx * 3, y + ly * 3, s.r, 0, 6.283)
        ctx.fill()
      }

      // flash of light inside a middle or near cloud, every so often
      if (SHOW_FLASHES) nextFlash -= dt
      if (SHOW_FLASHES && nextFlash <= 0) {
        const pool = clouds.filter((c) => c.li > 0)
        const c = pool[Math.floor(Math.random() * pool.length)]
        if (c) c.flash = 1
        nextFlash = rnd(6, 13)
      }

      // clouds, far to near
      for (let li = 0; li < LAYERS.length; li++) {
        const L = LAYERS[li]
        for (const c of clouds) {
          if (c.li !== li) continue
          c.x += L.speed * dt
          if (c.x > W + 40) c.x = -c.w - 40
          const fieldH = H + 500
          const y = mod(c.base - scrollY * L.scroll, fieldH) - 250 - c.h / 2 + ly * L.mouse
          const x = c.x + lx * L.mouse
          ctx.globalCompositeOperation = 'source-over'
          ctx.globalAlpha = BRIGHTNESS
          ctx.drawImage(c.sprite, x, y)
          if (c.flash > 0) {
            c.flash -= dt * 1.1
            const f = Math.max(0, c.flash)
            ctx.globalCompositeOperation = 'lighter'
            ctx.globalAlpha = f * f * 0.55 * BRIGHTNESS
            const size = c.w * 1.1
            ctx.drawImage(c.warm ? glows.orange : glows.violet, x + c.w * 0.5 - size / 2, y + c.h * 0.55 - size / 2, size, size)
          }
        }
      }

      // shooting stars
      if (SHOW_SHOOTING_STARS) nextComet -= dt
      if (SHOW_SHOOTING_STARS && nextComet <= 0) {
        comets.push({
          x: rnd(W * 0.35, W * 1.05),
          y: rnd(-20, H * 0.4),
          vx: -rnd(650, 900),
          vy: rnd(230, 340),
          life: 0,
        })
        nextComet = rnd(5, 11)
      }
      ctx.globalCompositeOperation = 'lighter'
      for (let i = comets.length - 1; i >= 0; i--) {
        const c = comets[i]
        c.life += dt
        c.x += c.vx * dt
        c.y += c.vy * dt
        if (c.life > 1) {
          comets.splice(i, 1)
          continue
        }
        const fade = Math.sin((c.life / 1) * Math.PI)
        const tx2 = c.x - c.vx * 0.14
        const ty2 = c.y - c.vy * 0.14
        const g = ctx.createLinearGradient(tx2, ty2, c.x, c.y)
        g.addColorStop(0, 'rgba(181,140,255,0)')
        g.addColorStop(1, `rgba(255,214,150,${0.8 * fade})`)
        ctx.globalAlpha = BRIGHTNESS
        ctx.strokeStyle = g
        ctx.lineWidth = 1.6
        ctx.lineCap = 'round'
        ctx.beginPath()
        ctx.moveTo(tx2, ty2)
        ctx.lineTo(c.x, c.y)
        ctx.stroke()
        ctx.globalAlpha = fade * BRIGHTNESS
        ctx.drawImage(glows.white, c.x - 9, c.y - 9, 18, 18)
      }

      // click / tap rings
      for (let i = rings.length - 1; i >= 0; i--) {
        const r = rings[i]
        const e = (t - r.t0) / 1.1
        if (e >= 1) {
          rings.splice(i, 1)
          continue
        }
        ctx.globalAlpha = 0.5 * (1 - e) * BRIGHTNESS
        ctx.strokeStyle = r.warm ? '#ffb84d' : '#b58cff'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(r.x, r.y - (scrollY - r.scroll), 6 + e * 150, 0, 6.283)
        ctx.stroke()
      }

      ctx.globalCompositeOperation = 'source-over'
      ctx.globalAlpha = 1
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
    const onDown = (e) => {
      rings.push({ x: e.clientX, y: e.clientY, scroll: window.scrollY, t0: t, warm: Math.random() < 0.3 })
      if (rings.length > 6) rings.shift()
    }
    const onResize = () => {
      build()
      if (reduce) frame(performance.now())
    }

    build()
    window.addEventListener('resize', onResize)
    if (!reduce) {
      window.addEventListener('pointermove', onMove, { passive: true })
      window.addEventListener('pointerdown', onDown, { passive: true })
      document.addEventListener('pointerleave', onLeave)
    }
    raf = requestAnimationFrame(frame)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onDown)
      document.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  return <canvas ref={ref} className="absolute left-0 top-0 h-full w-full" aria-hidden="true" />
}
