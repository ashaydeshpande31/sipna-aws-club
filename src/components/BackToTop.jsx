import { useEffect, useRef, useState } from 'react'
import { ArrowUp } from 'lucide-react'
import { scrollToId } from '../lib/scroll'

const R = 20
const C = 2 * Math.PI * R

/** Round "back to top" button with a ring that fills as you scroll. Shows up after the hero. */
export default function BackToTop() {
  const [show, setShow] = useState(false)
  const ring = useRef(null)

  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      const max = document.documentElement.scrollHeight - window.innerHeight
      const p = max > 0 ? Math.min(1, window.scrollY / max) : 0
      if (ring.current) ring.current.style.strokeDashoffset = String(C * (1 - p))
      setShow(window.scrollY > window.innerHeight * 0.9)
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <button
      type="button"
      onClick={() => scrollToId('home')}
      aria-label="Back to top"
      tabIndex={show ? 0 : -1}
      // on phones it sits above the bottom navigation bar
      className={`fixed bottom-[calc(5.25rem+env(safe-area-inset-bottom))] right-4 z-[64] grid h-12 w-12 place-items-center rounded-full border border-aws/40 bg-ink/80 text-white shadow-[0_0_30px_-6px_rgba(140,79,255,0.8)] backdrop-blur-md transition-all duration-500 hover:bg-aws sm:bottom-6 sm:right-6 ${
        show ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-6 opacity-0'
      }`}
    >
      <svg className="absolute inset-0 -rotate-90" viewBox="0 0 48 48" aria-hidden="true">
        <circle
          ref={ring}
          cx="24"
          cy="24"
          r={R}
          fill="none"
          stroke="#b58cff"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={C}
        />
      </svg>
      <ArrowUp size={18} />
    </button>
  )
}
