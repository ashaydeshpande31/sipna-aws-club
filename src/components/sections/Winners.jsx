import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ChevronLeft, ChevronRight, Crown, Expand, Medal, X } from 'lucide-react'
import SectionHead from '../ui/SectionHead'
import { Reveal } from '../ui/motion'
import { gsap, lockScroll, reducedMotion } from '../../lib/scroll'
import { HALL_OF_FAME } from '../../data/events'
import { getInitials } from '../../data/team'

// visual order on the podium (desktop): 2nd, 1st, 3rd. On phones the cards stack 1st, 2nd, 3rd.
const ORDER = [2, 1, 3]
const MOBILE_ORDER = { 1: 'order-1 md:order-2', 2: 'order-2 md:order-1', 3: 'order-3 md:order-3' }
const HEIGHT = { 1: 'md:h-24', 2: 'md:h-16', 3: 'md:h-10' }
const PLACE = { 1: '1st', 2: '2nd', 3: '3rd' }

/** Big landscape photo. Click it to see the whole picture full screen. */
function Shot({ person, first, onOpen }) {
  const [bad, setBad] = useState(false)
  const ring = first
    ? 'border-smile/60 shadow-[0_0_60px_-10px_rgba(255,153,0,0.55)]'
    : 'border-aws/40 shadow-[0_0_40px_-12px_rgba(140,79,255,0.7)]'
  const frame = `relative block aspect-[4/3] w-full overflow-hidden rounded-2xl border-2 bg-ink-2 ${ring}`

  if (!person.photo || bad) {
    return (
      <div className={`${frame} grid place-items-center bg-linear-to-br from-aws/25 to-aws-deep/10`}>
        <div className="text-center">
          <div
            className={`font-display text-5xl font-bold md:text-6xl ${first ? 'text-smile' : 'text-aws-soft'}`}
            aria-hidden="true"
          >
            {person.name ? getInitials(person.name) : '?'}
          </div>
          <div className="mt-2 font-mono text-[10px] uppercase tracking-widest text-white/40">Photo coming soon</div>
        </div>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`View ${person.name || person.label} photo larger`}
      className={`${frame} group cursor-zoom-in focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-aws-soft`}
    >
      <img
        src={person.photo}
        alt={person.name ? `${person.name}, ${person.label}` : person.label}
        loading="lazy"
        decoding="async"
        onError={() => setBad(true)}
        style={{ objectPosition: person.focus || 'center' }}
        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
      />
      <span className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-black/55 text-white backdrop-blur transition-colors group-hover:bg-aws">
        <Expand size={16} />
      </span>
    </button>
  )
}

/** Full-screen viewer: the whole photo, never cropped. Arrow keys / buttons switch between winners. */
function Lightbox({ items, index, setIndex, onClose }) {
  const root = useRef(null)
  const panel = useRef(null)
  const closeBtn = useRef(null)
  const closing = useRef(false)
  const touchX = useRef(null)
  const item = items[index]

  const close = useCallback(() => {
    if (closing.current) return
    closing.current = true
    if (reducedMotion() || !root.current) return onClose()
    gsap.to(root.current, { opacity: 0, duration: 0.25, onComplete: onClose })
  }, [onClose])

  const step = useCallback(
    (d) => {
      if (items.length > 1) setIndex((i) => (i + d + items.length) % items.length)
    },
    [items.length, setIndex],
  )

  useEffect(() => {
    const previous = document.activeElement
    lockScroll(true)
    closeBtn.current && closeBtn.current.focus()
    if (!reducedMotion()) {
      gsap.fromTo(root.current, { opacity: 0 }, { opacity: 1, duration: 0.3 })
      gsap.fromTo(
        panel.current,
        { opacity: 0, y: 40, scale: 0.96 },
        { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'power3.out' },
      )
    }
    return () => {
      lockScroll(false)
      if (previous && previous.focus) previous.focus()
    }
  }, [])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') return close()
      if (e.key === 'ArrowRight') step(1)
      if (e.key === 'ArrowLeft') step(-1)
      if (e.key === 'Tab' && root.current) {
        const btns = root.current.querySelectorAll('button:not([disabled])')
        if (!btns.length) return
        const first = btns[0]
        const last = btns[btns.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [close, step])

  const onTouchEnd = (e) => {
    if (touchX.current == null) return
    const dx = e.changedTouches[0].clientX - touchX.current
    touchX.current = null
    if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1)
  }

  const arrow =
    'absolute top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-black/55 text-white backdrop-blur transition-colors hover:bg-aws'

  return createPortal(
    <div
      ref={root}
      data-modal
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
      onMouseDown={(e) => e.target === e.currentTarget && close()}
    >
      <button
        ref={closeBtn}
        type="button"
        onClick={close}
        aria-label="Close"
        className="absolute right-4 top-4 z-20 grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-black/60 text-white backdrop-blur transition-colors hover:bg-aws"
      >
        <X size={18} />
      </button>

      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={`${item.name || item.label}, ${item.label}`}
        className="relative flex max-h-full w-full max-w-5xl flex-col items-center"
        onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
        onTouchEnd={onTouchEnd}
      >
        <img
          key={item.photo}
          src={item.photo}
          alt={item.name ? `${item.name}, ${item.label}` : item.label}
          className="max-h-[76svh] w-auto max-w-full rounded-2xl object-contain shadow-[0_0_120px_-30px_rgba(140,79,255,0.8)]"
        />

        {items.length > 1 && (
          <>
            <button type="button" onClick={() => step(-1)} aria-label="Previous photo" className={`${arrow} left-1 md:-left-14`}>
              <ChevronLeft size={20} />
            </button>
            <button type="button" onClick={() => step(1)} aria-label="Next photo" className={`${arrow} right-1 md:-right-14`}>
              <ChevronRight size={20} />
            </button>
          </>
        )}

        <div className="mt-4 text-center">
          <span
            className={`rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-widest ${
              item.rank === 1 ? 'border-smile/50 bg-smile/10 text-smile' : 'border-aws/40 bg-aws/10 text-aws-soft'
            }`}
          >
            {PLACE[item.rank]} · {item.label}
          </span>
          {item.name && <p className="mt-3 font-display text-xl font-bold text-white md:text-2xl">{item.name}</p>}
          {item.detail && <p className="mt-1 text-sm text-white/60">{item.detail}</p>}
          {items.length > 1 && (
            <p className="mt-2 font-mono text-xs text-white/40">
              {index + 1} / {items.length}
            </p>
          )}
        </div>
      </div>
    </div>,
    document.body,
  )
}

function Podium({ entry, onOpen }) {
  const root = useRef(null)

  useEffect(() => {
    const el = root.current
    if (!el || reducedMotion()) return
    const ctx = gsap.context(() => {
      const trigger = { trigger: el, start: 'top 80%', once: true }
      gsap.from('[data-bar]', {
        scaleY: 0,
        transformOrigin: 'bottom',
        duration: 1.1,
        ease: 'power4.out',
        stagger: 0.18,
        scrollTrigger: trigger,
      })
      gsap.from('[data-person]', {
        y: 40,
        opacity: 0,
        duration: 0.9,
        ease: 'power3.out',
        stagger: 0.18,
        delay: 0.2,
        scrollTrigger: trigger,
      })
    }, el)
    return () => ctx.revert()
  }, [])

  return (
    <div ref={root} className="grid grid-cols-1 gap-12 md:grid-cols-[1fr_1.25fr_1fr] md:items-end md:gap-8">
      {ORDER.map((rank) => {
        const p = entry.places.find((x) => x.rank === rank)
        const first = rank === 1
        const Icon = first ? Crown : Medal
        return (
          <div key={rank} className={`flex flex-col items-center text-center ${MOBILE_ORDER[rank]}`}>
            <div data-person className="w-full">
              <div className="mb-4 flex items-center justify-center gap-2">
                <Icon
                  size={first ? 30 : 22}
                  className={first ? 'text-smile drop-shadow-[0_0_14px_rgba(255,153,0,0.8)]' : 'text-aws-soft'}
                />
                <span
                  className={`rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-widest ${
                    first ? 'border-smile/50 bg-smile/10 text-smile' : 'border-aws/40 bg-aws/10 text-aws-soft'
                  }`}
                >
                  {PLACE[rank]} · {p.label}
                </span>
              </div>

              <Shot person={p} first={first} onOpen={() => onOpen(rank)} />

              <div className="mt-4 text-base font-semibold text-white md:text-lg">{p.name || 'To be announced'}</div>
              {p.detail && <div className="mx-auto mt-0.5 max-w-xs text-xs text-white/55 md:text-sm">{p.detail}</div>}
            </div>

            <div
              data-bar
              className={`mt-5 hidden w-full items-center justify-center rounded-t-2xl border border-b-0 md:flex ${HEIGHT[rank]} ${
                first
                  ? 'border-smile/40 bg-linear-to-b from-smile/30 via-aws/20 to-transparent'
                  : 'border-aws/30 bg-linear-to-b from-aws/30 to-transparent'
              }`}
            >
              <span className={`font-display text-2xl font-bold md:text-3xl ${first ? 'text-smile' : 'text-white/70'}`}>
                {PLACE[rank]}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function Winners() {
  const [active, setActive] = useState(0)
  const [box, setBox] = useState(null) // index in the list of photos shown by the full-screen viewer
  if (!HALL_OF_FAME.length) return null
  const entry = HALL_OF_FAME[Math.min(active, HALL_OF_FAME.length - 1)]
  const named = HALL_OF_FAME.some((c) => c.places.some((p) => p.name))
  const withPhoto = [1, 2, 3].map((r) => entry.places.find((p) => p.rank === r)).filter((p) => p && p.photo)

  const openPhoto = (rank) => {
    const i = withPhoto.findIndex((p) => p.rank === rank)
    if (i >= 0) setBox(i)
  }

  return (
    <section id="winners" className="relative mx-auto max-w-6xl px-5 py-24 md:px-8 md:py-32">
      <SectionHead
        eyebrow="Hall of fame"
        title="Meet Our Champions"
        sub={
          named
            ? 'The students who took the podium in our competitions and hackathons.'
            : 'Our champions will be crowned right here. Winner names are coming soon.'
        }
        center
      />

      {HALL_OF_FAME.length > 1 && (
        <div className="mt-10 flex flex-wrap justify-center gap-2" role="group" aria-label="Choose a competition">
          {HALL_OF_FAME.map((c, i) => (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                setActive(i)
                setBox(null)
              }}
              aria-pressed={i === active}
              className={`rounded-full border px-5 py-2 text-sm transition-all duration-300 ${
                i === active
                  ? 'border-aws bg-aws text-white shadow-[0_0_30px_-6px_rgba(140,79,255,0.9)]'
                  : 'border-white/10 bg-white/5 text-white/65 hover:border-aws/50 hover:text-white'
              }`}
            >
              {c.event}
            </button>
          ))}
        </div>
      )}

      <Reveal y={30} className="mt-10 text-center">
        <span className="font-mono text-xs uppercase tracking-[0.25em] text-aws-soft">
          {entry.event}
          {entry.date && <span className="text-white/40"> · {entry.date}</span>}
        </span>
      </Reveal>

      <div className="mt-14">
        {/* key restarts the entrance animation when the tab changes */}
        <Podium key={entry.id} entry={entry} onOpen={openPhoto} />
      </div>
      <div className="h-px bg-linear-to-r from-transparent via-aws/60 to-transparent" />

      {box !== null && withPhoto[box] && (
        <Lightbox items={withPhoto} index={box} setIndex={setBox} onClose={() => setBox(null)} />
      )}
    </section>
  )
}
