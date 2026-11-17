import { useEffect, useRef, useState } from 'react'
import {
  ScrollTrigger,
  initSmoothScroll,
  destroySmoothScroll,
  lockScroll,
  scrollToTop,
  navigate,
} from './lib/scroll'
import { useRoute } from './lib/useRoute'
import { pageFor } from './lib/routes'
import { SITE } from './data/site'

import Loader from './components/Loader'
import Atmosphere from './components/Atmosphere'
import Nav from './components/Nav'
import Footer from './components/Footer'
import EventModal from './components/EventModal'
import Terminal from './components/Terminal'
import FX from './components/FX'
import BackToTop from './components/BackToTop'

import Hero from './components/sections/Hero'
import Marquee from './components/sections/Marquee'
import Stats from './components/sections/Stats'
import About from './components/sections/About'
import Benefits from './components/sections/Benefits'
import Journey from './components/sections/Journey'
import EventsReel from './components/sections/EventsReel'
import Winners from './components/sections/Winners'
import Upcoming from './components/sections/Upcoming'
import Team from './components/sections/Team'
import Learn from './components/sections/Learn'
import Join from './components/sections/Join'
import Explore from './components/sections/Explore'

export default function App() {
  const [ready, setReady] = useState(false)
  const [activeEvent, setActiveEvent] = useState(null)
  const [terminalOpen, setTerminalOpen] = useState(false)

  const path = useRoute()
  const baseTitle = useRef('')

  // Initialize smooth scrolling
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }

    window.scrollTo(0, 0)
    initSmoothScroll()
    lockScroll(true)

    return () => {
      lockScroll(false)
      destroySmoothScroll()
    }
  }, [])

  // Unlock scrolling after intro animation
  useEffect(() => {
    if (!ready) return

    lockScroll(false)

    const refresh = () => ScrollTrigger.refresh()
    const t = setTimeout(refresh, 400)

    window.addEventListener('load', refresh)

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(refresh)
    }

    return () => {
      clearTimeout(t)
      window.removeEventListener('load', refresh)
    }
  }, [ready])

  // Handle page navigation
  useEffect(() => {
    if (!baseTitle.current) {
      baseTitle.current = document.title
    }

    const page = pageFor(path)

    document.title = !page
      ? `Page not found | ${SITE.name}`
      : path === '/'
        ? baseTitle.current
        : `${page.label} | ${SITE.name}`

    scrollToTop(true)
    setActiveEvent(null)

    const t1 = setTimeout(() => ScrollTrigger.refresh(), 80)
    const t2 = setTimeout(() => ScrollTrigger.refresh(), 700)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [path])

  // Easter egg: typing "aws" opens the terminal
  useEffect(() => {
    let buffer = ''

    const onKey = (e) => {
      const t = e.target

      if (
        t &&
        (t.tagName === 'INPUT' ||
          t.tagName === 'TEXTAREA' ||
          t.isContentEditable)
      ) return

      if (e.metaKey || e.ctrlKey || e.altKey || !e.key || e.key.length !== 1) {
        return
      }

      if (document.querySelector('[data-modal]')) return

      buffer = (buffer + e.key.toLowerCase()).slice(-3)

      if (buffer === 'aws') {
        buffer = ''
        e.preventDefault()
        setTerminalOpen(true)
      }
    }

    window.addEventListener('keydown', onKey)

    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="grain relative">
      <Loader onDone={() => setReady(true)} />
      <Atmosphere />
      <FX ready={ready} />
      <BackToTop />
      <Nav ready={ready} />

      <main className="relative z-10">
        {path === '/' && (
          <div key={path}>
            <Hero ready={ready} />
            <Marquee />
            <Stats />
            <Explore />
          </div>
        )}

        {path === '/about' && (
          <div key={path} className="min-h-[75svh]">
            <About />
            <Benefits />
          </div>
        )}

        {path === '/journey' && (
          <div key={path} className="min-h-[75svh]">
            <Journey onOpen={setActiveEvent} />
          </div>
        )}

        {path === '/events' && (
          <div key={path}>
            <EventsReel onOpen={setActiveEvent} />
            <Winners />
          </div>
        )}

        {path === '/upcoming' && (
          <div key={path} className="min-h-[75svh]">
            <Upcoming />
          </div>
        )}

        {path === '/team' && (
          <div key={path} className="min-h-[75svh]">
            <Team />
          </div>
        )}

        {path === '/learn' && (
          <div key={path} className="min-h-[75svh] pt-24 md:pt-28">
            <Learn />
          </div>
        )}

        {path === '/join' && (
          <div key={path} className="min-h-[75svh] pt-24 md:pt-28">
            <Join />
          </div>
        )}

        {!pageFor(path) && (
          <div
            key={path}
            className="mx-auto flex min-h-[75svh] max-w-xl flex-col items-center justify-center px-5 text-center"
          >
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-aws-soft">
              404
            </p>

            <h1 className="mt-4 font-display text-4xl font-bold text-white">
              This page does not exist
            </h1>

            <button
              type="button"
              onClick={() => navigate('/')}
              className="mt-8 rounded-full bg-white px-6 py-3 text-sm font-semibold text-ink hover:bg-aws-soft"
            >
              Back to home
            </button>
          </div>
        )}
      </main>

      <Footer onTerminal={() => setTerminalOpen(true)} />

      {activeEvent && (
        <EventModal
          key={activeEvent.id}
          event={activeEvent}
          onClose={() => setActiveEvent(null)}
        />
      )}

      {terminalOpen && <Terminal onClose={() => setTerminalOpen(false)} />}
    </div>
  )
}