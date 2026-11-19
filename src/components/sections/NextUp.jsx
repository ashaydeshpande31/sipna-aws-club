import { useEffect, useState } from 'react'
import { ArrowRight, CalendarClock } from 'lucide-react'
import { Reveal, Magnetic } from '../ui/motion'
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
    if (!active || Date.now() >= end.getTime()) return
    const id = setInterval(() => {
      setNow(Date.now())
      if (Date.now() >= end.getTime()) clearInterval(id)
    }, 1000)
    return () => clearInterval(id)
  }, [active])
  return now
}

const fmtDate = (d) =>
  d.toLocaleString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', timeZone: 'Asia/Kolkata' })

function Cell({ value, label }) {
  return (
    <div className="min-w-[3.4rem] rounded-xl bg-white/5 px-3 py-2 text-center">
      <div className="font-display text-2xl font-bold tabular-nums text-white">{value}</div>
      <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/60">{label}</div>
    </div>
  )
}

/** Home page strip: the next event with a live countdown and one clear button. */
export default function NextUp() {
  const now = useNow(valid)
  const state = !valid ? 'soon' : now < start.getTime() ? 'countdown' : now < end.getTime() ? 'live' : 'ended'
  const diff = valid ? Math.max(0, start.getTime() - now) : 0
  const d = Math.floor(diff / 86400000)
  const h = Math.floor((diff % 86400000) / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  const s = Math.floor((diff % 60000) / 1000)
  const showEvent = state === 'countdown' || state === 'live'

  return (
    <section className="relative mx-auto max-w-6xl px-5 py-10 md:px-8 md:py-14">
      <Reveal y={30}>
        <div className="aura rounded-3xl p-[1.5px]">
          <div className="flex flex-col gap-6 rounded-[calc(1.5rem-1.5px)] bg-ink-2 p-6 md:flex-row md:items-center md:justify-between md:p-8">
            <div className="min-w-0">
              <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-smile">
                <CalendarClock size={14} />
                {state === 'live' ? 'Happening now' : showEvent ? 'Next event' : 'Stay in the loop'}
              </span>
              <h2 className="mt-3 font-display text-xl font-bold leading-snug text-white md:text-2xl">
                {showEvent ? EV.title : 'Our next event is being planned'}
              </h2>
              <p className="mt-1 text-sm text-white/55">
                {showEvent ? fmtDate(start) + (EV.venue ? ` · ${EV.venue}` : '') : 'Join the community to hear about it first.'}
              </p>
            </div>

            {state === 'countdown' && (
              <div className="flex gap-2" role="timer" aria-label="Time until the event">
                <Cell value={pad2(d)} label="Days" />
                <Cell value={pad2(h)} label="Hrs" />
                <Cell value={pad2(m)} label="Min" />
                <Cell value={pad2(s)} label="Sec" />
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3">
              <Magnetic>
                {showEvent && EV.registerUrl ? (
                  <a href={EV.registerUrl} target="_blank" rel="noopener noreferrer" className={btnPrimary}>
                    Register now
                    <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                  </a>
                ) : (
                  <button type="button" onClick={() => scrollToId('join')} className={btnPrimary}>
                    {showEvent ? 'Register now' : 'Join the club'}
                    <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                  </button>
                )}
              </Magnetic>
              {showEvent ? (
                <button type="button" onClick={() => scrollToId('upcoming')} className={btnGhost}>
                  Details
                </button>
              ) : SITE.links.whatsapp ? (
                <a href={SITE.links.whatsapp} target="_blank" rel="noopener noreferrer" className={btnGhost}>
                  WhatsApp group
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  )
}
