import { useEffect, useRef } from 'react'
import { gsap, reducedMotion, finePointer } from '../../lib/scroll'

// AWS service chips that float around the 3D cloud (wide screens only).
// depth = how strongly a chip moves with the mouse (bigger = feels closer).
const SERVICES = [
  { name: 'EC2', color: '#ff9900', left: '60%', top: '16%', depth: 28, delay: 0 },
  { name: 'S3', color: '#7aa116', left: '86%', top: '22%', depth: 18, delay: 1.2 },
  { name: 'Lambda', color: '#ff9900', left: '90%', top: '50%', depth: 34, delay: 2.1 },
  { name: 'IAM', color: '#dd344c', left: '64%', top: '70%', depth: 22, delay: 0.6 },
  { name: 'VPC', color: '#b58cff', left: '78%', top: '80%', depth: 30, delay: 1.7 },
  { name: 'DynamoDB', color: '#527fff', left: '70%', top: '10%', depth: 16, delay: 2.6 },
  { name: 'CloudFront', color: '#8c4fff', left: '58%', top: '46%', depth: 36, delay: 0.9 },
  { name: 'RDS', color: '#527fff', left: '92%', top: '74%', depth: 20, delay: 1.9 },
]

export default function FloatingServices({ ready }) {
  const root = useRef(null)

  // come in after the intro
  useEffect(() => {
    if (!ready || reducedMotion()) return
    const ctx = gsap.context(() => {
      gsap.from('[data-chip]', {
        scale: 0,
        opacity: 0,
        duration: 0.9,
        ease: 'back.out(2)',
        stagger: 0.12,
        delay: 1.4,
      })
    }, root)
    return () => ctx.revert()
  }, [ready])

  // mouse parallax: each chip drifts by its own depth
  useEffect(() => {
    const el = root.current
    if (!el || reducedMotion() || !finePointer()) return
    const chips = Array.from(el.querySelectorAll('[data-depth]'))
    const movers = chips.map((c) => ({
      depth: Number(c.dataset.depth),
      x: gsap.quickTo(c, 'x', { duration: 1.1, ease: 'power3.out' }),
      y: gsap.quickTo(c, 'y', { duration: 1.1, ease: 'power3.out' }),
    }))
    const move = (e) => {
      const nx = e.clientX / window.innerWidth - 0.5
      const ny = e.clientY / window.innerHeight - 0.5
      movers.forEach((m) => {
        m.x(-nx * m.depth * 2)
        m.y(-ny * m.depth * 2)
      })
    }
    window.addEventListener('pointermove', move, { passive: true })
    return () => {
      window.removeEventListener('pointermove', move)
      gsap.set(chips, { x: 0, y: 0 })
    }
  }, [])

  return (
    <div ref={root} aria-hidden="true" className="pointer-events-none absolute inset-0 z-[5] hidden xl:block">
      {SERVICES.map((s) => (
        <div key={s.name} data-depth={s.depth} className="absolute" style={{ left: s.left, top: s.top }}>
          <div data-chip>
            <div
              className="motion-safe:animate-float inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3.5 py-1.5 font-mono text-xs text-white/85 shadow-[0_0_30px_-8px_rgba(140,79,255,0.7)] backdrop-blur"
              style={{ animationDelay: `${s.delay}s`, animationDuration: `${8 + s.delay * 2}s` }}
            >
              <span className="h-2 w-2 rounded-full" style={{ background: s.color, boxShadow: `0 0 10px ${s.color}` }} />
              {s.name}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
