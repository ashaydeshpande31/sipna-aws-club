import { lazy, Suspense, useEffect, useRef, useState } from 'react'
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
import MobileDock from './components/MobileDock'
import AnnouncementBar from './components/AnnouncementBar'
import Footer from './components/Footer'
import FX from './components/FX'
import BackToTop from './components/BackToTop'

import Hero from './components/sections/Hero'
import Marquee from './components/sections/Marquee'
import Stats from './components/sections/Stats'
import NextUp from './components/sections/NextUp'
import { AboutPreview, JourneyPreview, LearnPreview } from './components/sections/HomePreviews'


// Every page except Home loads its own small chunk of code when it is first needed, so the first visit
// downloads less. After the intro, the other pages are fetched quietly in the background (see below),
// so clicking a link is still instant.
function Refresh() {
  useEffect(() => {
    const t = setTimeout(() => ScrollTrigger.refresh(), 150)
    return () => clearTimeout(t)
  }, [])
  return null
}
const LOADERS = {
  About: () => import('./components/sections/About'),
  Benefits: () => import('./components/sections/Benefits'),
  Journey: () => import('./components/sections/Journey'),
  EventsReel: () => import('./components/sections/EventsReel'),
  Winners: () => import('./components/sections/Winners'),
  Upcoming: () => import('./components/sections/Upcoming'),
  Team: () => import('./components/sections/Team'),
  Learn: () => import('./components/sections/Learn'),
  Faq: () => import('./components/sections/Faq'),
  Connect: () => import('./components/sections/Connect'),
  News: () => import('./components/sections/News'),
  Legal: () => import('./components/sections/Legal'),
  Join: () => import('./components/sections/Join'),
  EventModal: () => import('./components/EventModal'),
}
const lazyPage = (load) =>
  lazy(() =>
    load().then((m) => {
      const Page = m.default
      return {
        default: (props) => (
          <>
            <Page {...props} />
            <Refresh />
          </>
        ),
      }
    }),
  )
const About = lazyPage(LOADERS.About)
const Benefits = lazyPage(LOADERS.Benefits)
const Journey = lazyPage(LOADERS.Journey)
const EventsReel = lazyPage(LOADERS.EventsReel)
const Winners = lazyPage(LOADERS.Winners)
const Upcoming = lazyPage(LOADERS.Upcoming)
const Team = lazyPage(LOADERS.Team)
const Learn = lazyPage(LOADERS.Learn)
const Faq = lazyPage(LOADERS.Faq)
const Connect = lazyPage(LOADERS.Connect)
const News = lazyPage(LOADERS.News)
const Legal = lazyPage(LOADERS.Legal)
const Join = lazyPage(LOADERS.Join)
const EventModal = lazy(LOADERS.EventModal)
const Terminal = lazy(() => import('./components/Terminal'))

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

  // after the intro, quietly fetch the other pages so links open instantly (skipped on "data saver")
  useEffect(() => {
    if (!ready) return
    if (navigator.connection && navigator.connection.saveData) return
    const run = () => Object.values(LOADERS).forEach((load) => load().catch(() => {}))
    const idle = window.requestIdleCallback ? (f) => window.requestIdleCallback(f, { timeout: 4000 }) : (f) => setTimeout(f, 2000)
    const cancel = window.cancelIdleCallback || clearTimeout
    const id = idle(run)
    return () => cancel(id)
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
      <FX ready={ready} path={path} />
      <BackToTop />
      <Nav ready={ready} />
      <MobileDock />
      <AnnouncementBar ready={ready} />

      <main className="relative z-10">
        <Suspense fallback={<div className="min-h-[75svh]" />}>
        {path === '/' && (
          <div key={path}>
            <Hero ready={ready} />
            <NextUp />
            <Marquee />
            <Stats />
            <AboutPreview />
            <JourneyPreview />
            <LearnPreview />
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

        {path === '/connect' && (
          <div key={path} className="min-h-[75svh] pt-24 md:pt-28">
            <Connect />
          </div>
        )}

        {path === '/faq' && (
          <div key={path} className="min-h-[75svh] pt-24 md:pt-28">
            <Faq />
          </div>
        )}

        {path === '/news' && (
          <div key={path} className="min-h-[75svh] pt-24 md:pt-28">
            <News />
          </div>
        )}

        {['/privacy', '/terms', '/conduct'].includes(path) && (
          <div key={path} className="min-h-[75svh] pt-24 md:pt-28">
            <Legal doc={path.slice(1)} />
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
        </Suspense>
      </main>

      <Footer onTerminal={() => setTerminalOpen(true)} />

      <Suspense fallback={null}>
        {activeEvent && (
          <EventModal
            key={activeEvent.id}
            event={activeEvent}
            onClose={() => setActiveEvent(null)}
          />
        )}

        {terminalOpen && <Terminal onClose={() => setTerminalOpen(false)} />}
      </Suspense>
    </div>
  )
}