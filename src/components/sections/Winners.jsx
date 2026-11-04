import { useEffect, useRef, useState } from 'react'
import { Crown, Medal } from 'lucide-react'
import SectionHead from '../ui/SectionHead'
import { Reveal } from '../ui/motion'
import { gsap, reducedMotion } from '../../lib/scroll'
import { HALL_OF_FAME } from '../../data/events'
import { getInitials } from '../../data/team'

// visual order on the podium: 2nd, 1st, 3rd
const ORDER = [2, 1, 3]
const HEIGHT = { 1: 'h-36 md:h-52', 2: 'h-28 md:h-40', 3: 'h-20 md:h-28' }
const PLACE = { 1: '1st', 2: '2nd', 3: '3rd' }

/** Round photo, or the person's initials if there is no photo yet. */
function Face({ person, first }) {
  const [bad, setBad] = useState(false)
  const size = first ? 'h-24 w-24 text-2xl md:h-40 md:w-40 md:text-5xl' : 'h-20 w-20 text-xl md:h-32 md:w-32 md:text-4xl'
  const look = first
    ? 'border-smile bg-smile/15 text-smile shadow-[0_0_44px_-6px_rgba(255,153,0,0.75)]'
    : 'border-aws bg-aws/15 text-aws-soft shadow-[0_0_32px_-8px_rgba(140,79,255,0.85)]'
  return (
    <div className={`grid shrink-0 place-items-center overflow-hidden rounded-full border-[3px] font-display font-bold ${size} ${look}`}>
      {person.photo && !bad ? (
        <img
          src={person.photo}
          alt={person.name}
          loading="lazy"
          decoding="async"
          onError={() => setBad(true)}
          className="h-full w-full object-cover object-top"
        />
      ) : (
        <span aria-hidden="true">{person.name ? getInitials(person.name) : '?'}</span>
      )}
    </div>
  )
}

function Podium({ entry }) {
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
        delay: 0.45,
        scrollTrigger: trigger,
      })
    }, el)
    return () => ctx.revert()
  }, [])

  return (
    <div ref={root} className="grid grid-cols-3 items-end gap-3 md:gap-8">
      {ORDER.map((rank) => {
        const p = entry.places.find((x) => x.rank === rank)
        const first = rank === 1
        const Icon = first ? Crown : Medal
        return (
          <div key={rank} className="flex flex-col items-center text-center">
            <div data-person className="mb-5 flex flex-col items-center">
              <Icon
                size={first ? 36 : 26}
                className={first ? 'mb-3 text-smile drop-shadow-[0_0_14px_rgba(255,153,0,0.8)]' : 'mb-3 text-aws-soft'}
              />
              <Face person={p} first={first} />
              <div className="mt-4 text-sm font-semibold text-white md:text-lg">{p.name || 'To be announced'}</div>
              {p.detail && <div className="mt-0.5 max-w-[14rem] text-xs text-white/55 md:text-sm">{p.detail}</div>}
              <span
                className={`mt-2 rounded-full border px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-widest md:text-[10px] ${
                  first ? 'border-smile/50 bg-smile/10 text-smile' : 'border-aws/40 bg-aws/10 text-aws-soft'
                }`}
              >
                {p.label}
              </span>
            </div>

            <div
              data-bar
              className={`flex w-full items-start justify-center rounded-t-2xl border border-b-0 pt-3 md:pt-4 ${HEIGHT[rank]} ${
                first
                  ? 'border-smile/40 bg-linear-to-b from-smile/30 via-aws/20 to-transparent'
                  : 'border-aws/30 bg-linear-to-b from-aws/30 to-transparent'
              }`}
            >
              <span className={`font-display text-3xl font-bold md:text-5xl ${first ? 'text-smile' : 'text-white/70'}`}>
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
  if (!HALL_OF_FAME.length) return null
  const entry = HALL_OF_FAME[Math.min(active, HALL_OF_FAME.length - 1)]
  const named = HALL_OF_FAME.some((c) => c.places.some((p) => p.name))

  return (
    <section id="winners" className="relative mx-auto max-w-5xl px-5 py-24 md:px-8 md:py-32">
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
              onClick={() => setActive(i)}
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
        <Podium key={entry.id} entry={entry} />
      </div>
      <div className="h-px bg-linear-to-r from-transparent via-aws/60 to-transparent" />
    </section>
  )
}
