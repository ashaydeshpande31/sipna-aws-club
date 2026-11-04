import { useEffect, useRef } from 'react'
import { gsap, reducedMotion } from '../lib/scroll'

const NAME = 'SIPNA AWS CLUB'

/** Full-screen intro: logo draws itself, counter runs to 100, then the screen splits open. */
export default function Loader({ onDone }) {
  const root = useRef(null)
  const count = useRef(null)
  const bar = useRef(null)
  const done = useRef(onDone)
  done.current = onDone

  useEffect(() => {
    const el = root.current
    if (!el) return
    if (reducedMotion()) {
      el.style.display = 'none'
      done.current()
      return
    }

    const ctx = gsap.context(() => {
      const state = { n: 0 }
      const tl = gsap.timeline()
      tl.fromTo('[data-path]', { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.5, ease: 'power2.inOut' }, 0)
        .fromTo('[data-fill]', { opacity: 0 }, { opacity: 1, duration: 0.7 }, 1.1)
        .fromTo('[data-smile]', { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.6, ease: 'power2.out' }, 1.3)
        .fromTo(
          '[data-char]',
          { yPercent: 115 },
          { yPercent: 0, duration: 0.7, ease: 'power3.out', stagger: 0.035 },
          0.35,
        )
        .to(
          state,
          {
            n: 100,
            duration: 2,
            ease: 'power2.inOut',
            onUpdate: () => {
              if (count.current) count.current.textContent = String(Math.round(state.n)).padStart(3, '0')
              if (bar.current) bar.current.style.transform = `scaleX(${state.n / 100})`
            },
          },
          0,
        )
        .to('[data-content]', { opacity: 0, y: -24, duration: 0.5, ease: 'power2.in' }, '+=0.2')
        .add(() => done.current())
        .to('[data-panel="top"]', { yPercent: -100, duration: 1.1, ease: 'power4.inOut' }, '>-0.05')
        .to('[data-panel="bottom"]', { yPercent: 100, duration: 1.1, ease: 'power4.inOut' }, '<')
        .set(el, { display: 'none' })
    }, el)
    return () => ctx.revert()
  }, [])

  return (
    <div ref={root} className="fixed inset-0 z-[100]" role="status" aria-label="Loading Sipna AWS Club">
      <div data-panel="top" className="absolute inset-x-0 top-0 h-1/2 bg-ink" />
      <div data-panel="bottom" className="absolute inset-x-0 bottom-0 h-1/2 bg-ink" />

      <div
        data-content
        className="absolute inset-0 flex flex-col items-center justify-center gap-8 px-6"
      >
        <svg viewBox="0 0 64 64" className="h-24 w-24 drop-shadow-[0_0_30px_rgba(140,79,255,0.7)]" aria-hidden="true">
          <defs>
            <linearGradient id="loader-g" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#B58CFF" />
              <stop offset="1" stopColor="#6A2BE0" />
            </linearGradient>
          </defs>
          <path
            data-fill
            fill="url(#loader-g)"
            d="M20 44a9 9 0 0 1-1.4-17.9A12 12 0 0 1 41.8 23 10.5 10.5 0 0 1 44 44z"
          />
          <path
            data-path
            pathLength="1"
            strokeDasharray="1"
            fill="none"
            stroke="#d9c6ff"
            strokeWidth="1.4"
            strokeLinejoin="round"
            d="M20 44a9 9 0 0 1-1.4-17.9A12 12 0 0 1 41.8 23 10.5 10.5 0 0 1 44 44z"
          />
          <path
            data-smile
            pathLength="1"
            strokeDasharray="1"
            d="M22 50c7 3.5 17 3.5 24 0"
            fill="none"
            stroke="#FF9900"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>

        <div
          className="flex font-display text-2xl font-bold tracking-[0.35em] text-white sm:text-4xl"
          aria-hidden="true"
        >
          {NAME.split('').map((c, i) => (
            <span key={i} className="inline-block overflow-hidden pb-1">
              <span data-char className="inline-block">
                {c === ' ' ? ' ' : c}
              </span>
            </span>
          ))}
        </div>

        <div className="w-64 sm:w-80">
          <div className="mb-3 flex items-end justify-between font-mono text-xs text-white/50">
            <span>BOOTING CLOUD</span>
            <span ref={count} className="text-aws-soft">
              000
            </span>
          </div>
          <div className="h-px w-full bg-white/10">
            <div ref={bar} className="h-px origin-left scale-x-0 bg-linear-to-r from-aws to-smile" />
          </div>
        </div>
      </div>
    </div>
  )
}
