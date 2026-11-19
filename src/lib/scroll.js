import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { pathForId } from './routes'

gsap.registerPlugin(ScrollTrigger)

// Phones: the address bar sliding in/out changes the window height while you scroll. Without this,
// every one of those tiny changes makes ScrollTrigger recalculate the whole page (a big source of jank).
ScrollTrigger.config({ ignoreMobileResize: true })

let lenis = null
let tick = null
let starting = false

export const reducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

export const finePointer = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(pointer: fine)').matches

export function initSmoothScroll() {
  // On phones the browser's own scrolling is already smooth and runs off the main thread;
  // adding a JS smooth-scroller on top only costs battery and frames. Desktop keeps it.
  if (lenis || starting || reducedMotion() || !finePointer()) return
  starting = true

  // the smooth-scroll library is only downloaded on desktop, so phones never pay for it
  import('lenis').then(({ default: Lenis }) => {
    if (!starting) return // destroyed while loading
    starting = false
    lenis = new Lenis({
      lerp: 0.09,
      smoothWheel: true
    })

    lenis.on('scroll', ScrollTrigger.update)

    tick = (time) => lenis && lenis.raf(time * 1000)

    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)
  })
}

export function destroySmoothScroll() {
  starting = false
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