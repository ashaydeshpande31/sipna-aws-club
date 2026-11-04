import { useEffect, useState } from 'react'
import { ArrowRight, CalendarPlus, Clock, MapPin } from 'lucide-react'
import SectionHead from '../ui/SectionHead'
import { Reveal, Magnetic } from '../ui/motion'
import LogoMark from '../ui/LogoMark'
import { scrollToId } from '../../lib/scroll'
import { UPCOMING_EVENT as EV } from '../../data/events'
import { SITE } from '../../data/site'
import { btnPrimary, btnGhost, pad2 } from '../../lib/ui'

const start = EV.date ? new Date(EV.date) : null
const valid = !!start && !Number.isNaN(start.getTime())
const end = valid ? new Date(start.getTime() + (EV.durationHours || 2) * 3600 * 1000) : null

function useNow(active) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    if (!active) return
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [active])
  return now
}

const fmtDate = (d) =>
  d.toLocaleString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'Asia/Kolkata',
  })

function calendarUrl() {
  const z = (d) => d.toISOString().replace(/[-:]|\.\d{3}/g, '')
  const q = new URLSearchParams({
    action: 'TEMPLATE',
    text: EV.title,
    dates: `${z(start)}/${z(end)}`,
    details: EV.description || `${EV.title} by ${SITE.name}`,
    location: EV.venue || SITE.college,
  })
  return `https://calendar.google.com/calendar/render?${q.toString()}`
}

function Unit({ value, label }) {
  return (
    <div className="glass rounded-2xl px-3 py-5 text-center md:px-4 md:py-6">
      <div className="font-display text-4xl font-bold tabular-nums text-white md:text-6xl">{value}</div>
      <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-white/45">{label}</div>
    </div>
  )
}

export default function Upcoming() {
  const now = useNow(valid)
  const state = !valid ? 'soon' : now < start.getTime() ? 'countdown' : now < end.getTime() ? 'live' : 'ended'
  const diff = valid ? Math.max(0, start.getTime() - now) : 0
  const d = Math.floor(diff / 86400000)
  const h = Math.floor((diff % 86400000) / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  const s = Math.floor((diff % 60000) / 1000)

  const registerHref = EV.registerUrl || ''
  const showEvent = state === 'countdown' || state === 'live'

  return (
    <section id="upcoming" className="relative mx-auto max-w-6xl px-5 py-24 md:px-8 md:py-32">
      <SectionHead
        eyebrow="Upcoming event"
        title={showEvent ? 'Mark Your Calendar' : 'The Next Chapter Is Loading'}
        center
      />

      <Reveal y={50} className="mt-14">
        <div className="aura relative rounded-[2rem] p-[1.5px]">
          <div className="relative overflow-hidden rounded-[calc(2rem-1.5px)] bg-ink-2 p-7 md:p-12">
            <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-aws/25 blur-[100px]" />

            {showEvent ? (
              <div className="relative">
                <span className="inline-flex items-center gap-2 rounded-full border border-smile/40 bg-smile/10 px-4 py-1.5 font-mono text-xs uppercase tracking-widest text-smile">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-smile opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-smile" />
                  </span>
                  {state === 'live' ? 'Happening now' : 'Registrations open'}
                </span>

                <h3 className="mt-5 max-w-3xl font-display text-3xl font-bold leading-tight text-white md:text-5xl">
                  {EV.title}
                </h3>

                <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-white/65">
                  <span className="flex items-center gap-2">
                    <Clock size={16} className="text-aws-soft" />
                    {fmtDate(start)}
                  </span>
                  {EV.venue && (
                    <span className="flex items-center gap-2">
                      <MapPin size={16} className="text-aws-soft" />
                      {EV.venue}
                    </span>
                  )}
                </div>

                {EV.description && (
                  <p className="mt-5 max-w-2xl leading-relaxed text-white/60">{EV.description}</p>
                )}

                {state === 'countdown' && (
                  <div className="mt-10 grid max-w-2xl grid-cols-4 gap-3 md:gap-4" role="timer" aria-label="Time until the event">
                    <Unit value={pad2(d)} label="Days" />
                    <Unit value={pad2(h)} label="Hours" />
                    <Unit value={pad2(m)} label="Mins" />
                    <Unit value={pad2(s)} label="Secs" />
                  </div>
                )}

                <div className="mt-10 flex flex-wrap items-center gap-4">
                  <Magnetic>
                    {registerHref ? (
                      <a href={registerHref} target="_blank" rel="noopener noreferrer" className={btnPrimary}>
                        Register now
                        <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                      </a>
                    ) : (
                      <button type="button" onClick={() => scrollToId('join')} className={btnPrimary}>
                        Register now
                        <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                      </button>
                    )}
                  </Magnetic>
                  {state === 'countdown' && (
                    <Magnetic>
                      <a href={calendarUrl()} target="_blank" rel="noopener noreferrer" className={btnGhost}>
                        <CalendarPlus size={16} />
                        Add to calendar
                      </a>
                    </Magnetic>
                  )}
                </div>
              </div>
            ) : (
              <div className="relative grid items-center gap-10 md:grid-cols-[1fr_auto]">
                <div>
                  <span className="inline-flex items-center gap-2 rounded-full border border-aws/30 bg-aws/10 px-4 py-1.5 font-mono text-xs uppercase tracking-widest text-aws-soft">
                    {state === 'ended' ? 'Event completed' : 'Coming soon'}
                  </span>
                  <h3 className="mt-5 font-display text-3xl font-bold leading-tight text-white md:text-5xl">
                    {state === 'ended' ? 'That one was a success. The next is on its way.' : 'Our next event is being planned.'}
                  </h3>
                  <p className="mt-5 max-w-xl leading-relaxed text-white/60">
                    Workshops, competitions and cloud hands-on sessions are in the works. Join the club to hear about
                    it first and to get a seat.
                  </p>
                  <div className="mt-8">
                    <Magnetic>
                      <button type="button" onClick={() => scrollToId('join')} className={btnPrimary}>
                        Get notified
                        <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                      </button>
                    </Magnetic>
                  </div>
                </div>

                <div className="relative mx-auto grid h-56 w-56 place-items-center" aria-hidden="true">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="absolute inset-4 animate-[pulse-ring_3.6s_ease-out_infinite] rounded-full border border-aws/60"
                      style={{ animationDelay: `${i * 1.2}s` }}
                    />
                  ))}
                  <LogoMark className="relative h-24 w-24 animate-float drop-shadow-[0_0_30px_rgba(140,79,255,0.8)]" />
                </div>
              </div>
            )}
          </div>
        </div>
      </Reveal>
    </section>
  )
}
