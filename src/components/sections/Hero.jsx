import { lazy, Suspense, useEffect, useRef } from 'react'
import { ArrowRight, MousePointer2, CalendarClock } from 'lucide-react'
import { gsap, scrollToId, reducedMotion } from '../../lib/scroll'
import { SplitText, Magnetic } from '../ui/motion'
import { HERO } from '../../data/site'
import { UPCOMING_EVENT } from '../../data/events'
import { btnPrimary, btnGhost } from '../../lib/ui'

// three.js is large, so it loads in its own chunk while the intro plays
const CloudScene = lazy(() => import('../three/CloudScene'))

export default function Hero({ ready }) {
  const root = useRef(null)
  const content = useRef(null)

  // hide the small pieces until the intro finishes, then bring them in
  useEffect(() => {
    if (reducedMotion()) return
    const ctx = gsap.context(() => {
      gsap.set('[data-in]', { opacity: 0, y: 28 })
      gsap.to(content.current, {
        yPercent: -14,
        opacity: 0.15,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true },
      })
    }, root)
    return () => ctx.revert()
  }, [])

  useEffect(() => {
    if (!ready || reducedMotion()) return
    const ctx = gsap.context(() => {
      gsap.to('[data-in]', {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'power3.out',
        stagger: 0.14,
        delay: 0.35,
      })
    }, root)
    return () => ctx.revert()
  }, [ready])

  const go = (id) => (e) => {
    e.preventDefault()
    scrollToId(id)
  }

  const nextDate = UPCOMING_EVENT.date
    ? new Date(UPCOMING_EVENT.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
    : ''

  return (
    <section id="home" ref={root} className="relative min-h-svh overflow-hidden">
      <Suspense fallback={null}>
        <CloudScene ready={ready} />
      </Suspense>

      <div className="relative z-10 mx-auto flex min-h-svh max-w-7xl flex-col justify-end px-5 pb-24 pt-32 md:justify-center md:px-8 md:pb-20">
        <div ref={content} className="max-w-2xl">
          <div data-in className="mb-6 inline-flex items-center gap-2 rounded-full border border-aws/30 bg-aws/10 px-4 py-1.5 font-mono text-xs text-aws-soft backdrop-blur">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-smile opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-smile" />
            </span>
            {HERO.badge}
          </div>

          <SplitText
            as="h1"
            text={HERO.title}
            highlight={HERO.highlight}
            mode="manual"
            play={ready}
            delay={0.25}
            className="font-display text-[clamp(2.5rem,6.4vw,5.6rem)] font-bold leading-[1.02] tracking-tight text-white"
          />

          <p data-in className="mt-6 max-w-xl text-base leading-relaxed text-white/65 md:text-lg">
            {HERO.subtitle}
          </p>

          <div data-in className="mt-9 flex flex-wrap items-center gap-4">
            <Magnetic>
              <a href="#join" onClick={go('join')} className={btnPrimary}>
                Join the Club
                <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
              </a>
            </Magnetic>
            <Magnetic>
              <a href="#events" onClick={go('events')} className={btnGhost}>
                See Our Events
              </a>
            </Magnetic>
          </div>

          {nextDate && (
            <a
              data-in
              href="#upcoming"
              onClick={go('upcoming')}
              className="mt-8 inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80 backdrop-blur transition-colors hover:border-aws/50"
            >
              <CalendarClock size={18} className="text-smile" />
              <span>
                <span className="text-white/50">Next event · </span>
                {UPCOMING_EVENT.title} · {nextDate}
              </span>
            </a>
          )}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-6 z-10 hidden justify-center md:flex">
        <div data-in className="flex flex-col items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-white/40">
          <MousePointer2 size={14} className="animate-bounce" />
          Scroll
        </div>
      </div>
    </section>
  )
}
