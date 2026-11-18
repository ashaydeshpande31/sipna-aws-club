import { useEffect, useRef } from 'react'
import { gsap, reducedMotion, finePointer } from '../lib/scroll'
import CloudSky from './CloudSky'
import FloatingDust from './FloatingDust'

// Pick the background:  'dust' = tiny dots drifting slowly upward
//                       'sky'  = drifting clouds and stars
//                       'none' = just the soft glows
const BACKGROUND = 'dust'

// Background hue (0-360) at 0%, 35%, 65% and 100% of the page: purple, blue, violet, magenta.
const HUE_STOPS = [265, 228, 285, 345]

/**
 * Fixed page background:
 *  - one of two calm backgrounds, chosen by BACKGROUND above:
 *      'dust' tiny dots drifting slowly upward (FloatingDust.jsx)
 *      'sky'  night sky with drifting clouds and stars (CloudSky.jsx)
 *  - drifting glows, one of them slowly changes colour as you scroll down the page
 *  - a soft glow that follows the cursor
 */
export default function Atmosphere() {
  const root = useRef(null)
  const glow = useRef(null)
  const layers = useRef([]).current

  // cursor glow
  useEffect(() => {
    const el = glow.current
    if (!el || reducedMotion() || !finePointer()) return
    gsap.set(el, { xPercent: -50, yPercent: -50, opacity: 0 })
    const xTo = gsap.quickTo(el, 'x', { duration: 0.8, ease: 'power3.out' })
    const yTo = gsap.quickTo(el, 'y', { duration: 0.8, ease: 'power3.out' })
    const move = (e) => {
      xTo(e.clientX)
      yTo(e.clientY)
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
      // cross-fade between the fixed-colour glows (opacity only, so no repainting while scrolling)
      const x = Math.min(0.9999, Math.max(0, p)) * (HUE_STOPS.length - 1)
      const i = Math.floor(x)
      const f = x - i
      layers.forEach((el, k) => {
        if (el) el.style.opacity = k === i ? 1 - f : k === i + 1 ? f : 0
      })
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

  return (
    <div
      ref={root}
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      aria-hidden="true"
    >
      {BACKGROUND === 'sky' && <CloudSky />}
      {BACKGROUND === 'dust' && <FloatingDust />}

      <div className="absolute -left-40 top-[12%] h-[34rem] w-[34rem] animate-float rounded-full glow-a" />
      <div className="absolute -right-40 top-[45%] h-[30rem] w-[30rem] animate-float-slow rounded-full glow-b" />
      <div className="absolute bottom-[-10%] left-[30%] h-[24rem] w-[24rem] animate-float rounded-full glow-c" />
      {/* this glow changes colour as you scroll down the page */}
      <div className="absolute left-1/2 top-[30%] h-[36rem] w-[36rem] -translate-x-1/2">
        {HUE_STOPS.map((h, k) => (
          <div
            key={h}
            ref={(el) => (layers[k] = el)}
            className="absolute inset-0 animate-float-slow rounded-full"
            style={{ background: `radial-gradient(circle, hsl(${h} 90% 58% / 0.2), transparent 68%)`, opacity: k === 0 ? 1 : 0, willChange: 'opacity' }}
          />
        ))}
      </div>
      <div
        ref={glow}
        className="absolute left-0 top-0 hidden h-[26rem] w-[26rem] rounded-full opacity-0 mix-blend-screen md:block"
        style={{ background: 'radial-gradient(circle, rgba(140,79,255,0.22), transparent 65%)' }}
      />
    </div>
  )
}
