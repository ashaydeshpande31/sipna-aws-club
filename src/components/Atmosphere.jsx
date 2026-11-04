import { useEffect, useRef } from 'react'
import { gsap, reducedMotion, finePointer } from '../lib/scroll'

/** Fixed page background: faint grid, drifting violet orbs, and a glow that follows the cursor. */
export default function Atmosphere() {
  const glow = useRef(null)

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

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
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
      <div className="absolute -left-40 top-[12%] h-[34rem] w-[34rem] animate-float rounded-full bg-aws/20 blur-[130px]" />
      <div className="absolute -right-40 top-[45%] h-[30rem] w-[30rem] animate-float-slow rounded-full bg-aws-deep/25 blur-[130px]" />
      <div className="absolute bottom-[-10%] left-[30%] h-[24rem] w-[24rem] animate-float rounded-full bg-smile/[0.06] blur-[120px]" />
      <div
        ref={glow}
        className="absolute left-0 top-0 hidden h-[26rem] w-[26rem] rounded-full opacity-0 mix-blend-screen md:block"
        style={{ background: 'radial-gradient(circle, rgba(140,79,255,0.22), transparent 65%)' }}
      />
    </div>
  )
}
