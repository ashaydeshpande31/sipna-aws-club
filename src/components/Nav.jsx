import { useEffect, useRef, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { gsap, scrollToId } from '../lib/scroll'
import { useRoute } from '../lib/useRoute'
import { pathForId } from '../lib/routes'
import LogoMark from './ui/LogoMark'
import { SITE } from '../data/site'

// Same links on mobile and desktop (no hamburger menu).
// Each one opens its own page.
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
  const root = useRef(null)
  const list = useRef(null)
  const bar = useRef(null)
  const path = useRoute()
  const active = (LINKS.find(([, id]) => pathForId(id) === path) || [])[1] || ''
  const [dotX , setDotX] = useState(null)

 // entrance + scroll progress bar
useEffect(() => {
  const el = root.current
  if (!el) return

  const ctx = gsap.context(() => {
    // phones: bar sits at the bottom
    // laptops: bar sits at the top
    const fromBottom = window.matchMedia(
      '(max-width: 639px)'
    ).matches

    gsap.to(bar.current, {
      scaleX: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: el,
        start: 'top top',
        end: 'max',
        scrub: true,
        onUpdate: (self) => {
          if (bar.current) {
            bar.current.style.transform =
              `scaleX(${self.progress})`
          }
        },
      },
    })
  })

  return () => ctx.revert()
}, [])
// slide one dot under the active link
useEffect(() => {
  const place = () => {
    const el = list.current?.querySelector('[data-active="true"]')
    setDotX(el ? el.offsetLeft + el.offsetWidth / 2 : null)
  }
  place()
  window.addEventListener('resize', place)
  return () => window.removeEventListener('resize', place)
}, [active])

  // on phones the link row scrolls sideways: keep the active link in view
  useEffect(() => {
    const el = list.current?.querySelector('[data-active="true"]')
    if (el) el.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' })
  }, [active])

  const go = (id) => (e) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return // let "open in new tab" work
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

      <header
  ref={root}
  className="fixed inset-x-0 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-[65] flex justify-center px-2.5 sm:bottom-auto sm:top-4 sm:px-4"
>
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
            href="/"
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
  className="relative flex min-w-0 flex-1 items-center justify-start overflow-x-auto [scrollbar-width:none] sm:justify-center sm:gap-1 [&::-webkit-scrollbar]:hidden"
>
  {LINKS.map(([label, id]) => (
    <li key={id}>
      <a
        href={pathForId(id)}
        onClick={go(id)}
        data-active={active === id}
        className={`relative block rounded-full px-2.5 py-2 text-[13px] transition-colors sm:px-3.5 sm:text-sm ${
          active === id
            ? 'text-white [text-shadow:0_0_14px_rgba(196,167,255,0.9)]'
            : 'text-white/45 hover:text-white'
        }`}
      >
        {label}
      </a>
    </li>
  ))}
  {/* one dot that glides from link to link */}
  <li
    aria-hidden="true"
    className="pointer-events-none absolute bottom-0.5 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-white shadow-[0_0_8px_rgba(196,167,255,0.9)] transition-[left,opacity] duration-500 ease-out"
    style={{ left: dotX ?? 0, opacity: dotX == null ? 0 : 1 }}
  />
</ul>
          {/* right: white pill button */}
          <a
            href="/join"
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