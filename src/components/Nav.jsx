import { useEffect, useRef, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { gsap, ScrollTrigger, lockScroll, scrollToId, reducedMotion } from '../lib/scroll'
import LogoMark from './ui/LogoMark'
import { SITE } from '../data/site'

const LINKS = [
  ['About', 'about'],
  ['Journey', 'journey'],
  ['Events', 'events'],
  ['Upcoming', 'upcoming'],
  ['Team', 'team'],
  ['Learn', 'learn'],
]

export default function Nav({ ready }) {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive] = useState('')
  const root = useRef(null)
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

  // only lock while the mobile menu is open (never on first mount, the loader owns the lock then)
  useEffect(() => {
    if (!open) return
    lockScroll(true)
    return () => lockScroll(false)
  }, [open])

  const go = (id) => (e) => {
    e.preventDefault()
    setOpen(false)
    // wait a tick so the menu can unlock scrolling first
    setTimeout(() => scrollToId(id), 60)
  }

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-[70] h-[3px] bg-transparent">
        <div
          ref={bar}
          className="h-full origin-left scale-x-0 bg-linear-to-r from-aws via-aws-soft to-smile"
        />
      </div>

      <header ref={root} className="fixed inset-x-0 top-4 z-[65] flex justify-center px-4">
        <nav
          aria-label="Main"
          className={`flex w-full max-w-4xl items-center justify-between rounded-full border px-3 py-2 pl-4 transition-all duration-500 ${
            scrolled
              ? 'border-aws/30 bg-ink/80 shadow-[0_10px_40px_-10px_rgba(140,79,255,0.45)] backdrop-blur-xl'
              : 'border-white/10 bg-ink/40 backdrop-blur-md'
          }`}
        >
          <a href="#home" onClick={go('home')} className="flex items-center gap-2.5" aria-label={`${SITE.name} home`}>
            <LogoMark className="h-8 w-8" />
            <span className="font-display text-sm font-semibold tracking-tight text-white">
              {SITE.name}
            </span>
          </a>

          <ul className="hidden items-center gap-1 md:flex">
            {LINKS.map(([label, id]) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  onClick={go(id)}
                  className={`rounded-full px-3.5 py-2 text-sm transition-colors ${
                    active === id ? 'bg-aws/20 text-white' : 'text-white/60 hover:text-white'
                  }`}
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <a
              href="#join"
              onClick={go('join')}
              className="hidden rounded-full bg-aws px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-aws-soft hover:text-ink sm:inline-block"
            >
              Join Club
            </a>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-label={open ? 'Close menu' : 'Open menu'}
              className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/5 text-white md:hidden"
            >
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </nav>
      </header>

      {/* mobile menu */}
      <div
        className={`fixed inset-0 z-[64] flex flex-col justify-center gap-2 bg-ink/95 px-8 backdrop-blur-2xl transition-all duration-500 md:hidden ${
          open ? 'visible opacity-100' : 'invisible opacity-0'
        }`}
      >
        {[...LINKS, ['Join', 'join']].map(([label, id], i) => (
          <a
            key={id}
            href={`#${id}`}
            onClick={go(id)}
            style={{ transitionDelay: open ? `${i * 60}ms` : '0ms' }}
            className={`font-display text-4xl font-bold text-white transition-all duration-500 ${
              open ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
            }`}
          >
            <span className="mr-3 font-mono text-sm text-aws-soft">0{i + 1}</span>
            {label}
          </a>
        ))}
      </div>
    </>
  )
}
