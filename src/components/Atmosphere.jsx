import { useEffect, useRef } from 'react'
import { gsap, reducedMotion, finePointer } from '../lib/scroll'

// Background hue (0-360) at 0%, 35%, 65% and 100% of the page: purple, blue, violet, magenta.
const HUE_STOPS = [265, 228, 285, 345]
const hueAt = (p) => {
  const x = Math.min(0.9999, Math.max(0, p)) * (HUE_STOPS.length - 1)
  const i = Math.floor(x)
  return HUE_STOPS[i] + (HUE_STOPS[i + 1] - HUE_STOPS[i]) * (x - i)
}

/**
 * Fixed page background:
 *  - faint grid that lights up around the cursor
 *  - drifting glows, one of them slowly changes colour as you scroll down the page
 *  - thin streams of glowing dots rising like data through the cloud
 *  - a soft glow that follows the cursor
 */
export default function Atmosphere() {
  const root = useRef(null)
  const glow = useRef(null)
  const streams = useRef(null)

  // cursor glow + the grid that lights up near the pointer
  useEffect(() => {
    const el = glow.current
    const box = root.current
    if (!el || !box || reducedMotion() || !finePointer()) return
    gsap.set(el, { xPercent: -50, yPercent: -50, opacity: 0 })
    const xTo = gsap.quickTo(el, 'x', { duration: 0.8, ease: 'power3.out' })
    const yTo = gsap.quickTo(el, 'y', { duration: 0.8, ease: 'power3.out' })
    const move = (e) => {
      xTo(e.clientX)
      yTo(e.clientY)
      box.style.setProperty('--gx', `${e.clientX}px`)
      box.style.setProperty('--gy', `${e.clientY}px`)
      box.style.setProperty('--grid-lit', '1')
      gsap.to(el, { opacity: 1, duration: 0.6, overwrite: 'auto' })
    }
    window.addEventListener('pointermove', move, { passive: true })
    return () => window.removeEventListener('pointermove', move)
  }, [])

  // colour shift while scrolling
  useEffect(() => {
    const box = root.current
    if (!box || reducedMotion()) return
    let frame = 0
    const update = () => {
      frame = 0
      const max = document.documentElement.scrollHeight - window.innerHeight
      const p = max > 0 ? window.scrollY / max : 0
      box.style.setProperty('--bg-hue', hueAt(p).toFixed(1))
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  // rising data streams
  useEffect(() => {
    const canvas = streams.current
    if (!canvas || reducedMotion()) return
    const touchDevice = !finePointer()
    const ctx = canvas.getContext('2d')
    let w = 0
    let h = 0
    let cols = []
    let raf = 0

    const build = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const gap = touchDevice ? 110 : 64
      const count = Math.max(4, Math.floor(w / gap))
      cols = Array.from({ length: count }, (_, i) => ({
        x: ((i + 0.5) / count) * w + (Math.random() - 0.5) * 20,
        y: Math.random() * h,
        speed: 0.35 + Math.random() * 0.9,
        len: 5 + Math.floor(Math.random() * 6),
        warm: Math.random() < 0.08,
      }))
    }
    build()
    window.addEventListener('resize', build)

    const frame = () => {
      ctx.clearRect(0, 0, w, h)
      for (const c of cols) {
        c.y -= c.speed
        if (c.y < -c.len * 12) c.y = h + Math.random() * 120
        ctx.fillStyle = c.warm ? '#ff9900' : '#b58cff'
        for (let k = 0; k < c.len; k++) {
          // dots get fainter along the tail, and everything fades near the top and bottom
          const y = c.y + k * 12
          const edge = Math.min(1, Math.min(y, h - y) / 140)
          if (edge <= 0) continue
          ctx.globalAlpha = (1 - k / c.len) * 0.34 * edge
          ctx.beginPath()
          ctx.arc(c.x, y, k === 0 ? 1.7 : 1.1, 0, 6.283)
          ctx.fill()
        }
      }
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', build)
    }
  }, [])

  return (
    <div
      ref={root}
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      style={{ '--bg-hue': 265, '--gx': '50%', '--gy': '30%', '--grid-lit': 0 }}
      aria-hidden="true"
    >
      {/* base grid */}
      <div
        className="absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(140,79,255,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(140,79,255,0.07) 1px, transparent 1px)',
          backgroundSize: '56px 56px',
          maskImage: 'radial-gradient(ellipse at 50% 30%, #000 20%, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(ellipse at 50% 30%, #000 20%, transparent 75%)',
        }}
      />
      {/* brighter grid, only visible around the cursor */}
      <div
        className="absolute inset-0 transition-opacity duration-500"
        style={{
          opacity: 'var(--grid-lit)',
          backgroundImage:
            'linear-gradient(rgba(181,140,255,0.34) 1px, transparent 1px), linear-gradient(90deg, rgba(181,140,255,0.34) 1px, transparent 1px)',
          backgroundSize: '56px 56px',
          maskImage: 'radial-gradient(circle 230px at var(--gx) var(--gy), #000, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(circle 230px at var(--gx) var(--gy), #000, transparent 100%)',
        }}
      />

      <canvas ref={streams} className="absolute left-0 top-0" />

      <div className="absolute -left-40 top-[12%] h-[34rem] w-[34rem] animate-float rounded-full bg-aws/20 blur-[130px]" />
      <div className="absolute -right-40 top-[45%] h-[30rem] w-[30rem] animate-float-slow rounded-full bg-aws-deep/25 blur-[130px]" />
      <div className="absolute bottom-[-10%] left-[30%] h-[24rem] w-[24rem] animate-float rounded-full bg-smile/[0.06] blur-[120px]" />
      {/* this glow changes colour as you scroll down the page */}
      <div
        className="absolute left-1/2 top-[30%] h-[36rem] w-[36rem] -translate-x-1/2 animate-float-slow rounded-full blur-[140px]"
        style={{ background: 'hsl(var(--bg-hue) 90% 58% / 0.16)' }}
      />
      <div
        ref={glow}
        className="absolute left-0 top-0 hidden h-[26rem] w-[26rem] rounded-full opacity-0 mix-blend-screen md:block"
        style={{ background: 'radial-gradient(circle, rgba(140,79,255,0.22), transparent 65%)' }}
      />
    </div>
  )
}
