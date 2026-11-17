import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { pathForId } from './routes'

gsap.registerPlugin(ScrollTrigger)

let lenis = null
let tick = null

export const reducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

export const finePointer = () =>
  typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches

export function initSmoothScroll() {
  if (lenis || reducedMotion()) return
  lenis = new Lenis({ lerp: 0.09, smoothWheel: true })
  lenis.on('scroll', ScrollTrigger.update)
  tick = (time) => lenis && lenis.raf(time * 1000)
  gsap.ticker.add(tick)
  gsap.ticker.lagSmoothing(0)
}

export function destroySmoothScroll() {
  if (tick) gsap.ticker.remove(tick)
  if (lenis) lenis.destroy()
  lenis = null
  tick = null
}

// Freeze / unfreeze page scrolling (loader, modal, terminal, mobile menu)
export function lockScroll(locked) {
  if (locked) {
    if (lenis) lenis.stop()
    document.documentElement.style.overflow = 'hidden'
  } else {
    document.documentElement.style.overflow = ''
    if (lenis) lenis.start()
  }
}

export function scrollToTop(immediate = true) {
  if (lenis) lenis.scrollTo(0, { immediate, force: true, duration: 1.1 })
  else window.scrollTo({ top: 0, behavior: immediate ? 'auto' : 'smooth' })
}

const norm = (p) => p.replace(/\/+$/, '') || '/'

// Opens another page of the site (no full reload): the page quickly fades out, the address changes,
// the new page fades in. Reduced motion: no fade. The pages themselves are chosen in App.jsx.
export function navigate(path) {
  if (typeof window === 'undefined') return
  if (norm(window.location.pathname) === norm(path)) {
    scrollToTop(false)
    return
  }
  const swap = () => {
    window.history.pushState({}, '', path)
    window.dispatchEvent(new Event('aws:route'))
  }
  const main = document.querySelector('main')
  if (reducedMotion() || !main || !main.animate) {
    swap()
    return
  }
  const out = main.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 160, easing: 'ease-in', fill: 'forwards' })
  out.onfinish = () => {
    swap()
    main.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 380, easing: 'ease-out' })
    out.cancel()
  }
}

// Old name kept so every existing button keeps working: it now opens the page that holds that section.
export function scrollToId(id) {
  navigate(pathForId(id))
}

export { gsap, ScrollTrigger }
