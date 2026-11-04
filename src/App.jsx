import { useEffect, useState } from 'react'
import { ScrollTrigger, initSmoothScroll, destroySmoothScroll, lockScroll } from './lib/scroll'

import Loader from './components/Loader'
import Atmosphere from './components/Atmosphere'
import Nav from './components/Nav'
import Footer from './components/Footer'
import EventModal from './components/EventModal'
import Terminal from './components/Terminal'

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

export default function App() {
  const [ready, setReady] = useState(false)
  const [activeEvent, setActiveEvent] = useState(null)
  const [terminalOpen, setTerminalOpen] = useState(false)

  // smooth scrolling, frozen while the intro plays
  useEffect(() => {
    if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual'
    window.scrollTo(0, 0)
    initSmoothScroll()
    lockScroll(true)
    return () => {
      lockScroll(false)
      destroySmoothScroll()
    }
  }, [])

  // intro finished: unfreeze, then re-measure every scroll animation (fonts and images change heights)
  useEffect(() => {
    if (!ready) return
    lockScroll(false)
    const refresh = () => ScrollTrigger.refresh()
    const t = setTimeout(refresh, 400)
    window.addEventListener('load', refresh)
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(refresh)
    return () => {
      clearTimeout(t)
      window.removeEventListener('load', refresh)
    }
  }, [ready])

  // easter egg: typing "aws" anywhere opens the terminal
  useEffect(() => {
    let buffer = ''
    const onKey = (e) => {
      const t = e.target
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return
      if (e.metaKey || e.ctrlKey || e.altKey || !e.key || e.key.length !== 1) return
      if (document.querySelector('[data-modal]')) return
      buffer = (buffer + e.key.toLowerCase()).slice(-3)
      if (buffer === 'aws') {
        buffer = ''
        e.preventDefault() // stops the final "s" from landing in the terminal input
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
      <Nav ready={ready} />

      <main className="relative z-10">
        <Hero ready={ready} />
        <Marquee />
        <Stats />
        <About />
        <Benefits />
        <Journey onOpen={setActiveEvent} />
        <EventsReel onOpen={setActiveEvent} />
        <Winners />
        <Upcoming />
        <Team />
        <Learn />
        <Join />
      </main>

      <Footer onTerminal={() => setTerminalOpen(true)} />

      {activeEvent && <EventModal key={activeEvent.id} event={activeEvent} onClose={() => setActiveEvent(null)} />}
      {terminalOpen && <Terminal onClose={() => setTerminalOpen(false)} />}
    </div>
  )
}
