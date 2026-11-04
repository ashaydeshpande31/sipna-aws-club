import { useEffect, useRef } from 'react'
import { gsap, reducedMotion, finePointer } from '../../lib/scroll'

/** Fades + lifts its children in when scrolled into view. */
export function Reveal({
  as: Tag = 'div',
  y = 40,
  delay = 0,
  duration = 0.9,
  className = '',
  children,
  ...rest
}) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el || reducedMotion()) return
    const ctx = gsap.context(() => {
      gsap.from(el, {
        y,
        opacity: 0,
        duration,
        delay,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 90%', once: true },
      })
    }, el)
    return () => ctx.revert()
  }, [y, delay, duration])
  return (
    <Tag ref={ref} className={className} {...rest}>
      {children}
    </Tag>
  )
}

/**
 * Word-by-word masked reveal.
 *  mode="scroll"  -> plays when scrolled into view
 *  mode="manual"  -> plays when `play` becomes true (used by the hero)
 */
export function SplitText({
  text,
  as: Tag = 'span',
  className = '',
  highlight = [],
  mode = 'scroll',
  play = true,
  delay = 0,
  stagger = 0.07,
}) {
  const ref = useRef(null)
  const words = text.split(' ')

  useEffect(() => {
    const el = ref.current
    if (!el || reducedMotion()) return
    const inner = el.querySelectorAll('[data-w]')
    const ctx = gsap.context(() => {
      gsap.set(inner, { yPercent: 118, rotate: 5 })
      const to = {
        yPercent: 0,
        rotate: 0,
        duration: 1.1,
        ease: 'power4.out',
        stagger,
        delay,
      }
      if (mode === 'scroll') {
        gsap.to(inner, { ...to, scrollTrigger: { trigger: el, start: 'top 88%', once: true } })
      } else if (play) {
        gsap.to(inner, to)
      }
    }, el)
    return () => ctx.revert()
  }, [mode, play, delay, stagger])

  return (
    <Tag ref={ref} className={className} aria-label={text}>
      {words.map((w, i) => (
        <span key={i} aria-hidden="true">
          <span className="inline-block overflow-hidden align-bottom pb-[0.16em] -mb-[0.16em]">
            <span
              data-w
              className={`inline-block will-change-transform ${
                highlight.includes(w) ? 'text-gradient' : ''
              }`}
            >
              {w}
            </span>
          </span>
          {i < words.length - 1 ? ' ' : ''}
        </span>
      ))}
    </Tag>
  )
}

/** Wraps a button/link so it is gently pulled toward the cursor. */
export function Magnetic({ children, strength = 0.35, className = '' }) {
  const outer = useRef(null)
  const inner = useRef(null)
  useEffect(() => {
    const area = outer.current
    const el = inner.current
    if (!area || !el || reducedMotion() || !finePointer()) return
    const xTo = gsap.quickTo(el, 'x', { duration: 0.7, ease: 'elastic.out(1, 0.45)' })
    const yTo = gsap.quickTo(el, 'y', { duration: 0.7, ease: 'elastic.out(1, 0.45)' })
    const move = (e) => {
      const r = area.getBoundingClientRect()
      xTo((e.clientX - (r.left + r.width / 2)) * strength)
      yTo((e.clientY - (r.top + r.height / 2)) * strength)
    }
    const leave = () => {
      xTo(0)
      yTo(0)
    }
    area.addEventListener('pointermove', move)
    area.addEventListener('pointerleave', leave)
    return () => {
      area.removeEventListener('pointermove', move)
      area.removeEventListener('pointerleave', leave)
      gsap.set(el, { x: 0, y: 0 })
    }
  }, [strength])
  return (
    <span ref={outer} className={`inline-block p-4 -m-4 ${className}`}>
      <span ref={inner} className="inline-block">
        {children}
      </span>
    </span>
  )
}

/** Number that counts up when scrolled into view. */
export function Counter({ to, suffix = '', duration = 1.8 }) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (reducedMotion()) {
      el.textContent = `${to}${suffix}`
      return
    }
    const obj = { v: 0 }
    const ctx = gsap.context(() => {
      gsap.to(obj, {
        v: to,
        duration,
        ease: 'power2.out',
        onUpdate: () => {
          el.textContent = `${Math.round(obj.v)}${suffix}`
        },
        scrollTrigger: { trigger: el, start: 'top 92%', once: true },
      })
    }, el)
    return () => ctx.revert()
  }, [to, suffix, duration])
  return <span ref={ref}>{`0${suffix}`}</span>
}

/** Card that tilts in 3D toward the cursor and lights up under it. */
export function Card3D({ children, max = 6, className = '', as: Tag = 'div', ...rest }) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el || reducedMotion() || !finePointer()) return
    gsap.set(el, { transformPerspective: 900 })
    const rx = gsap.quickTo(el, 'rotationX', { duration: 0.5, ease: 'power3.out' })
    const ry = gsap.quickTo(el, 'rotationY', { duration: 0.5, ease: 'power3.out' })
    const move = (e) => {
      const r = el.getBoundingClientRect()
      const px = (e.clientX - r.left) / r.width
      const py = (e.clientY - r.top) / r.height
      ry((px - 0.5) * max * 2)
      rx(-(py - 0.5) * max * 2)
      el.style.setProperty('--mx', `${e.clientX - r.left}px`)
      el.style.setProperty('--my', `${e.clientY - r.top}px`)
    }
    const leave = () => {
      rx(0)
      ry(0)
    }
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerleave', leave)
    return () => {
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerleave', leave)
      gsap.set(el, { rotationX: 0, rotationY: 0 })
    }
  }, [max])
  return (
    <Tag ref={ref} className={`spot ${className}`} {...rest}>
      {children}
    </Tag>
  )
}
