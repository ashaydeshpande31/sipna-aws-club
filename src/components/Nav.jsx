import { useEffect, useRef, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { gsap, ScrollTrigger, scrollToId, reducedMotion } from '../lib/scroll'
import LogoMark from './ui/LogoMark'
import { SITE } from '../data/site'

// Same links on mobile and desktop (no hamburger menu).
// Each one scrolls to the section with that id.
const LINKS = [
  ['About', 'about'],
  ['Journey', 'journey'],
  ['Events', 'events'],
  ['Upcoming', 'upcoming'],
  ['Team', 'team'],
  ['Learn', 'learn'],
]

export default function Nav({ ready }) {
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive] = useState('')
  const root = useRef(null)
  const list = useRef(null)
  const bar = useRef(null)

  // entrance + scroll progress bar
  useEffect(() => {
    const el = root.current
    if (!el) return
    const ctx = gsap.context(() => {
      if (!reducedMotion()) gsap.set(el, { yPercent: -140, opacity: 0 })
      ScrollTrigger.create({
        start: 0,
        end: 'max',
        onUpdate: (self) => {
          if (bar.current) bar.current.style.transform = `scaleX(${self.progress})`
        },
      })
    })
    return () => ctx.revert()
  }, [])

  useEffect(() => {
    if (!ready || reducedMotion()) return
    const ctx = gsap.context(() => {
      gsap.to(root.current, { yPercent: 0, opacity: 1, duration: 1, ease: 'power3.out', delay: 0.4 })
    })
    return () => ctx.revert()
  }, [ready])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // highlight the section currently in view
  useEffect(() => {
    const ids = LINKS.map(([, id]) => id)
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id)
        })
      },
      { rootMargin: '-45% 0px -50% 0px' },
    )
    ids.forEach((id) => {
      const s = document.getElementById(id)
      if (s) io.observe(s)
    })
    return () => io.disconnect()
  }, [])

  // on phones the link row scrolls sideways: keep the active link in view
  useEffect(() => {
    const el = list.current?.querySelector('[data-active="true"]')
    if (el) el.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' })
  }, [active])

  const go = (id) => (e) => {
    e.preventDefault()
    scrollToId(id)
  }

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-[70] h-[3px] bg-transparent">
        <div
          ref={bar}
          className="h-full origin-left scale-x-0 bg-linear-to-r from-aws via-aws-soft to-smile"
        />
      </div>

      <header ref={root} className="fixed inset-x-0 top-3 z-[65] flex justify-center px-2.5 sm:top-4 sm:px-4">
        <nav
          aria-label="Main"
          className={`flex w-full max-w-4xl items-center justify-between gap-1 rounded-full border py-1.5 pl-2.5 pr-1.5 transition-all duration-500 sm:gap-3 sm:py-2 sm:pl-4 sm:pr-2 ${
            scrolled
              ? 'border-aws/30 bg-ink/80 shadow-[0_10px_40px_-10px_rgba(140,79,255,0.45)] backdrop-blur-xl'
              : 'border-white/10 bg-ink/40 backdrop-blur-md'
          }`}
        >
          {/* left: logo + name (name hides on very small phones) */}
          <a
            href="#home"
            onClick={go('home')}
            className="flex shrink-0 items-center gap-2.5"
            aria-label={`${SITE.name} home`}
          >
            <LogoMark className="h-7 w-7 sm:h-8 sm:w-8" />
            <span className="font-display hidden text-sm font-semibold tracking-tight text-white sm:inline">
              {SITE.name}
            </span>
          </a>

          {/* centre: always visible, a dot marks the active section */}
          <ul
            ref={list}
            className="flex min-w-0 flex-1 items-center justify-start overflow-x-auto [scrollbar-width:none] sm:justify-center sm:gap-1 [&::-webkit-scrollbar]:hidden"
          >
            {LINKS.map(([label, id]) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  onClick={go(id)}
                  data-active={active === id}
                  className={`relative block rounded-full px-2.5 py-2 text-[13px] transition-colors sm:px-3.5 sm:text-sm ${
                    active === id ? 'text-white' : 'text-white/55 hover:text-white'
                  }`}
                >
                  {label}
                  <span
                    className={`absolute bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-aws-soft transition-all duration-300 ${
                      active === id ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
                    }`}
                  />
                </a>
              </li>
            ))}
          </ul>

          {/* right: white pill button */}
          <a
            href="#join"
            onClick={go('join')}
            className="group flex shrink-0 items-center gap-1 rounded-full bg-white px-3 py-2 text-xs font-semibold text-ink transition-colors hover:bg-aws-soft sm:gap-1.5 sm:px-4 sm:text-sm"
          >
            Join<span className="hidden sm:inline">&nbsp;Club</span>
            <ArrowRight size={14} className="hidden transition-transform group-hover:translate-x-0.5 min-[400px]:block" />
          </a>
        </nav>
      </header>
    </>
  )
}