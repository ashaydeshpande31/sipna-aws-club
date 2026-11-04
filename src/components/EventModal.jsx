import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  X,
  Play,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Users,
  Film,
  Check,
} from 'lucide-react'
import { gsap, lockScroll, reducedMotion } from '../lib/scroll'
import { youtubeId } from '../lib/eventMedia'
import EventCover from './ui/EventCover'

/** Pop-up for one past event: a Video tab and a Photos tab. */
export default function EventModal({ event, onClose }) {
  const yt = youtubeId(event.youtube)
  const hasVideo = !!event.video || !!yt
  const photos = event.photos || []

  const [tab, setTab] = useState(hasVideo || photos.length === 0 ? 'video' : 'photos')
  const [idx, setIdx] = useState(0)
  const [playYT, setPlayYT] = useState(false)

  const root = useRef(null)
  const panel = useRef(null)
  const closeBtn = useRef(null)
  const touchX = useRef(null)
  const closing = useRef(false)

  const close = useCallback(() => {
    if (closing.current) return
    closing.current = true
    if (reducedMotion() || !panel.current) return onClose()
    gsap.to(panel.current, { opacity: 0, y: 30, scale: 0.97, duration: 0.25, ease: 'power2.in' })
    gsap.to(root.current, { opacity: 0, duration: 0.3, onComplete: onClose })
  }, [onClose])

  const step = useCallback(
    (d) => {
      if (!photos.length) return
      setIdx((i) => (i + d + photos.length) % photos.length)
    },
    [photos.length],
  )

  // open: lock page scroll, animate in, move focus; close: give focus back
  useEffect(() => {
    const previous = document.activeElement
    lockScroll(true)
    closeBtn.current && closeBtn.current.focus()
    if (!reducedMotion()) {
      gsap.fromTo(root.current, { opacity: 0 }, { opacity: 1, duration: 0.3 })
      gsap.fromTo(
        panel.current,
        { opacity: 0, y: 60, scale: 0.96 },
        { opacity: 1, y: 0, scale: 1, duration: 0.55, ease: 'power3.out' },
      )
    }
    return () => {
      lockScroll(false)
      if (previous && previous.focus) previous.focus()
    }
  }, [])

  // keyboard: Esc closes, arrows flip photos, Tab stays inside the pop-up
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') return close()
      if (tab === 'photos') {
        if (e.key === 'ArrowRight') step(1)
        if (e.key === 'ArrowLeft') step(-1)
      }
      if (e.key === 'Tab' && panel.current) {
        const items = panel.current.querySelectorAll(
          'button:not([disabled]), a[href], video[controls], [tabindex]:not([tabindex="-1"])',
        )
        if (!items.length) return
        const first = items[0]
        const last = items[items.length - 1]
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
  }, [tab, close, step])

  // keep the selected thumbnail in view
  useEffect(() => {
    if (tab !== 'photos') return
    const t = panel.current && panel.current.querySelector(`[data-thumb="${idx}"]`)
    if (t && t.scrollIntoView) t.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' })
  }, [idx, tab])

  const onTouchEnd = (e) => {
    if (touchX.current == null) return
    const dx = e.changedTouches[0].clientX - touchX.current
    touchX.current = null
    if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1)
  }

  const tabBtn = (id, label, Icon, count) => (
    <button
      type="button"
      role="tab"
      aria-selected={tab === id}
      onClick={() => setTab(id)}
      className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
        tab === id ? 'bg-aws text-white' : 'text-white/60 hover:text-white'
      }`}
    >
      <Icon size={15} />
      {label}
      {count != null && <span className="text-xs opacity-70">{count}</span>}
    </button>
  )

  return createPortal(
    <div
      ref={root}
      data-modal
      className="fixed inset-0 z-[90] flex items-end justify-center bg-black/80 backdrop-blur-sm md:items-center md:p-6"
      onMouseDown={(e) => e.target === e.currentTarget && close()}
    >
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={event.title}
        data-lenis-prevent
        className="relative flex max-h-[100svh] w-full max-w-6xl flex-col overflow-y-auto overscroll-contain rounded-t-3xl border border-white/10 bg-ink-2 shadow-[0_0_120px_-20px_rgba(140,79,255,0.6)] md:max-h-[92svh] md:flex-row md:overflow-hidden md:rounded-3xl"
      >
        <button
          ref={closeBtn}
          type="button"
          onClick={close}
          aria-label="Close"
          className="absolute right-4 top-4 z-20 grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-black/50 text-white backdrop-blur transition-colors hover:bg-aws"
        >
          <X size={18} />
        </button>

        {/* ---------- media ---------- */}
        <div className="flex min-w-0 flex-col md:w-[62%]">
          <div className="flex items-center gap-1 p-4 pr-16" role="tablist" aria-label="Event media">
            {tabBtn('video', 'Video', Play)}
            {tabBtn('photos', 'Photos', ImageIcon, photos.length)}
          </div>

          <div className="relative aspect-video w-full overflow-hidden bg-black">
            {tab === 'video' && (
              <>
                {event.video ? (
                  <video
                    key={event.video}
                    src={event.video}
                    poster={photos[0]}
                    controls
                    playsInline
                    preload="metadata"
                    className="absolute inset-0 h-full w-full"
                  />
                ) : yt ? (
                  playYT ? (
                    <iframe
                      title={`${event.title}: video`}
                      src={`https://www.youtube-nocookie.com/embed/${yt}?autoplay=1&rel=0`}
                      allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                      allowFullScreen
                      className="absolute inset-0 h-full w-full"
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => setPlayYT(true)}
                      aria-label="Play video"
                      className="group absolute inset-0 h-full w-full"
                    >
                      <img
                        src={`https://i.ytimg.com/vi/${yt}/hqdefault.jpg`}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                      <span className="absolute inset-0 grid place-items-center bg-black/30">
                        <span className="grid h-20 w-20 place-items-center rounded-full bg-aws text-white shadow-[0_0_60px_rgba(140,79,255,0.9)] transition-transform group-hover:scale-110">
                          <Play size={30} fill="currentColor" />
                        </span>
                      </span>
                    </button>
                  )
                ) : (
                  <div className="absolute inset-0 grid place-items-center bg-linear-to-br from-panel to-ink text-center">
                    <div>
                      <Film className="mx-auto text-aws-soft" size={40} />
                      <p className="mt-3 font-display text-lg font-semibold text-white">Event video coming soon</p>
                      <p className="mt-1 text-sm text-white/45">The highlights reel is being edited.</p>
                    </div>
                  </div>
                )}
              </>
            )}

            {tab === 'photos' &&
              (photos.length ? (
                <div
                  className="absolute inset-0 select-none"
                  onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
                  onTouchEnd={onTouchEnd}
                >
                  <img
                    key={photos[idx]}
                    src={photos[idx]}
                    alt={`${event.title}: photo ${idx + 1} of ${photos.length}`}
                    className="h-full w-full object-contain"
                  />
                  {photos.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={() => step(-1)}
                        aria-label="Previous photo"
                        className="absolute left-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-black/50 text-white backdrop-blur transition-colors hover:bg-aws"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <button
                        type="button"
                        onClick={() => step(1)}
                        aria-label="Next photo"
                        className="absolute right-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-black/50 text-white backdrop-blur transition-colors hover:bg-aws"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </>
                  )}
                  <span className="absolute bottom-3 right-3 rounded-full bg-black/60 px-3 py-1 font-mono text-xs text-white">
                    {idx + 1} / {photos.length}
                  </span>
                </div>
              ) : (
                <div className="absolute inset-0">
                  <EventCover event={event} />
                </div>
              ))}
          </div>

          {tab === 'photos' && photos.length > 1 && (
            <div className="no-scrollbar flex gap-2 overflow-x-auto p-4">
              {photos.map((src, i) => (
                <button
                  key={src}
                  type="button"
                  data-thumb={i}
                  onClick={() => setIdx(i)}
                  aria-label={`Show photo ${i + 1}`}
                  aria-current={i === idx}
                  className={`h-14 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                    i === idx ? 'border-aws opacity-100' : 'border-transparent opacity-50 hover:opacity-90'
                  }`}
                >
                  <img src={src} alt="" loading="lazy" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ---------- details ---------- */}
        <div className="min-w-0 border-t border-white/10 p-6 md:w-[38%] md:overflow-y-auto md:border-l md:border-t-0 md:p-8">
          <span className="font-mono text-xs uppercase tracking-widest text-aws-soft">{event.category}</span>
          <h3 className="mt-2 font-display text-2xl font-bold leading-tight text-white md:text-3xl">{event.title}</h3>

          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/60">
            {event.date && (
              <span className="flex items-center gap-2">
                <Calendar size={15} className="text-aws-soft" />
                {event.date}
              </span>
            )}
            {event.participants > 0 && (
              <span className="flex items-center gap-2">
                <Users size={15} className="text-aws-soft" />
                {event.participants} participants
              </span>
            )}
          </div>

          <p className="mt-5 leading-relaxed text-white/70">{event.description}</p>

          {event.highlights && event.highlights.length > 0 && (
            <ul className="mt-6 space-y-2.5">
              {event.highlights.map((h) => (
                <li key={h} className="flex items-start gap-3 text-sm text-white/80">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-aws/25 text-aws-soft">
                    <Check size={12} strokeWidth={3} />
                  </span>
                  {h}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>,
    document.body,
  )
}
