import { useEffect, useRef } from 'react'
import { reducedMotion } from '../../lib/scroll'

const CHARS = '!<>-_\\/[]{}=+*^?#01'

/** Text that scrambles into place the first time it scrolls into view. */
export default function Scramble({ text, className = '' }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.textContent = text
    if (reducedMotion()) return
    let raf = 0
    let started = false

    const run = () => {
      const start = performance.now()
      const duration = 900
      const step = (now) => {
        const p = Math.min(1, (now - start) / duration)
        const reveal = Math.floor(p * text.length)
        el.textContent = text
          .split('')
          .map((c, i) => (c === ' ' || i < reveal ? c : CHARS[Math.floor(Math.random() * CHARS.length)]))
          .join('')
        if (p < 1) raf = requestAnimationFrame(step)
        else el.textContent = text
      }
      raf = requestAnimationFrame(step)
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          started = true
          run()
          io.disconnect()
        }
      },
      { threshold: 0.6 },
    )
    io.observe(el)
    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
    }
  }, [text])

  return (
    <span ref={ref} className={className} aria-label={text}>
      {text}
    </span>
  )
}
