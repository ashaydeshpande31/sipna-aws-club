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
  typeof window !== 'undefined' &&
  window.matchMedia('(pointer: fine)').matches

export function initSmoothScroll() {
  if (lenis || reducedMotion()) return

  lenis = new Lenis({
    lerp: 0.09,
    smoothWheel: true
  })

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

// Freeze / unfreeze page scrolling
export function lockScroll(locked) {
  if (locked) {
    if (lenis) lenis.stop()
    document.documentElement.style.overflow = 'hidden'
  } else {
    document.documentElement.style.overflow = ''
    if (lenis) lenis.start()
  }
}

// Scroll to the top of the page
export function scrollToTop(immediate = true) {
  if (lenis) {
    lenis.scrollTo(0, {
      immediate,
      force: true,
      duration: 1.1
    })
  } else {
    window.scrollTo({
      top: 0,
      behavior: immediate || reducedMotion() ? 'auto' : 'smooth'
    })
  }
}

const norm = (p) => p.replace(/\/+$/, '') || '/'

// Navigate between website pages
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

  const out = main.animate(
    [{ opacity: 1 }, { opacity: 0 }],
    {
      duration: 160,
      easing: 'ease-in',
      fill: 'forwards'
    }
  )

  out.onfinish = () => {
    swap()

    main.animate(
      [{ opacity: 0 }, { opacity: 1 }],
      {
        duration: 380,
        easing: 'ease-out'
      }
    )

    out.cancel()
  }
}

// Keep old function name for existing components
// It now navigates to the page containing that section
export function scrollToId(id) {
  navigate(pathForId(id))
}

export { gsap, ScrollTrigger }