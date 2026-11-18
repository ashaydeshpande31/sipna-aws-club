import { ArrowRight, Check } from 'lucide-react'
import SectionHead from '../ui/SectionHead'
import { Reveal, Card3D, Magnetic } from '../ui/motion'
import { scrollToId } from '../../lib/scroll'
import { SITE, MISSION, BENEFITS, LEARNING_PATH } from '../../data/site'
import { PAST_EVENTS } from '../../data/events'
import { TEAM_PHOTO } from '../../data/team'
import EventCover from '../ui/EventCover'
import { ImageIcon, Play } from 'lucide-react'
import { btnGhost } from '../../lib/ui'

// Short previews of three full pages, shown on Home. Each one ends with a button to the full page.

function MoreButton({ id, children }) {
  return (
    <Magnetic>
      <button type="button" onClick={() => scrollToId(id)} className={btnGhost}>
        {children}
        <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
      </button>
    </Magnetic>
  )
}

/* ---------------- About ---------------- */
export function AboutPreview() {
  return (
    <section className="relative mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-24">
      <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
        <div>
          <SectionHead eyebrow="About the club" title="Where Students Meet the Cloud" />
          <Reveal y={20} delay={0.1}>
            <p className="mt-5 max-w-xl leading-relaxed text-white/65">{MISSION.description}</p>
            <div className="mt-8">
              <MoreButton id="about">More about us</MoreButton>
            </div>
          </Reveal>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {BENEFITS.map((b, i) => (
            <Reveal key={b.title} delay={i * 0.08} className="h-full">
              <Card3D className="glass h-full rounded-2xl p-5">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-aws/15 text-aws-soft">
                  <Check size={16} />
                </span>
                <h3 className="mt-4 font-display text-base font-semibold text-white">{b.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-white/55">{b.description}</p>
              </Card3D>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------------- Journey ---------------- */
function foundedLabel() {
  const d = new Date(SITE.founded)
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric', timeZone: 'UTC' })
}

export function JourneyPreview() {
  const items = [
    { title: 'The Club Is Started', date: foundedLabel() },
    ...PAST_EVENTS.slice(-3).map((e) => ({ title: e.title, date: e.date })),
  ]
  return (
    <section className="relative mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-24">
      <SectionHead eyebrow="Our journey" title="From One Idea to a Growing Club" center />

      <div className="relative mt-14">
        <div className="pointer-events-none absolute left-0 right-0 top-[1.1rem] hidden h-px bg-linear-to-r from-transparent via-aws/50 to-transparent lg:block" aria-hidden="true" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((it, i) => (
            <Reveal key={it.title + i} delay={i * 0.1} className="h-full">
              <div className="relative h-full">
                <span className="relative z-10 mb-4 block h-2.5 w-2.5 rounded-full bg-smile shadow-[0_0_14px_rgba(255,153,0,0.9)]" />
                <Card3D className="glass h-full rounded-2xl p-5">
                  <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-aws-soft">{it.date}</p>
                  <h3 className="mt-2 font-display text-base font-semibold leading-snug text-white">{it.title}</h3>
                </Card3D>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      <Reveal y={20} delay={0.2}>
        <div className="mt-10 flex justify-center">
          <MoreButton id="journey">See the full journey</MoreButton>
        </div>
      </Reveal>
    </section>
  )
}

/* ---------------- Learn ---------------- */
export function LearnPreview() {
  return (
    <section className="relative mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-24">
      <SectionHead eyebrow="Learn with us" title="Your Cloud Learning Path" center />

      <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {LEARNING_PATH.map((s, i) => (
          <Reveal key={s.title} delay={i * 0.08} className="h-full">
            <Card3D className="glass flex h-full items-center gap-4 rounded-2xl p-5">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-aws/50 bg-ink-2 font-display text-base font-bold text-aws-soft">
                {i + 1}
              </span>
              <h3 className="font-display text-base font-semibold leading-snug text-white">{s.title}</h3>
            </Card3D>
          </Reveal>
        ))}
      </div>

      <Reveal y={20} delay={0.2}>
        <div className="mt-10 flex justify-center">
          <MoreButton id="learn">Open the learning path</MoreButton>
        </div>
      </Reveal>
    </section>
  )
}


/* ---------------- Club photo ---------------- */
export function ClubPhoto() {
  if (!TEAM_PHOTO.src) return null
  return (
    <section className="relative mx-auto max-w-7xl px-5 py-12 md:px-8 md:py-20">
      <Reveal y={30}>
        <figure className="relative isolate overflow-hidden rounded-[1.75rem] border border-white/10 bg-ink-2 md:rounded-[2.25rem]">
          <img
            src={TEAM_PHOTO.src}
            alt="The Sipna AWS Club team together"
            loading="lazy"
            decoding="async"
            style={{ objectPosition: TEAM_PHOTO.focus || 'center 30%' }}
            className="aspect-[4/3] w-full object-cover md:aspect-[21/9]"
          />
          <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-ink/90 via-ink/20 to-transparent" />
          <figcaption className="absolute inset-x-0 bottom-0 flex flex-col items-start justify-between gap-4 p-5 md:flex-row md:items-end md:p-9">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-aws-soft md:text-xs">Our family</span>
              <p className="mt-1 font-display text-2xl font-bold text-white md:text-4xl">{TEAM_PHOTO.caption}</p>
            </div>
            <MoreButton id="team">Meet the team</MoreButton>
          </figcaption>
        </figure>
      </Reveal>
    </section>
  )
}

/* ---------------- Past events (tap a tile to open its photos and video) ---------------- */
function Tile({ e, i, onOpen, big }) {
  const hasVideo = !!(e.video || e.youtube)
  return (
    <button
      type="button"
      onClick={() => onOpen(e)}
      aria-label={`Open ${e.title}`}
      className={`group relative h-full w-full overflow-hidden rounded-3xl border border-white/10 bg-ink-2 text-left ${
        big ? 'col-span-2 aspect-[4/3] md:col-span-2 md:row-span-2 md:aspect-auto' : 'aspect-square md:aspect-auto'
      }`}
    >
      <div className="absolute inset-0 transition-transform duration-700 md:group-hover:scale-105">
        <EventCover event={e} index={i} />
      </div>
      <div className="absolute inset-0 bg-linear-to-t from-ink/95 via-ink/25 to-transparent" />
      {hasVideo && (
        <span className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-aws/90 text-white">
          <Play size={14} fill="currentColor" />
        </span>
      )}
      <div className="absolute inset-x-0 bottom-0 p-4 md:p-6">
        <span className="font-mono text-[10px] uppercase tracking-widest text-aws-soft">
          {e.category}
          {e.date && <span className="text-white/50"> · {e.date}</span>}
        </span>
        <h3 className={`mt-1 font-display font-bold leading-snug text-white ${big ? 'text-xl md:text-3xl' : 'text-sm md:text-lg'}`}>
          {e.title}
        </h3>
        {big && <p className="mt-2 line-clamp-2 hidden max-w-lg text-sm text-white/60 md:block">{e.description}</p>}
        <span className="mt-2 flex items-center gap-1.5 text-[11px] text-white/55">
          <ImageIcon size={12} /> {e.photos.length} {e.photos.length === 1 ? 'photo' : 'photos'}
        </span>
      </div>
    </button>
  )
}

export function PastEventsPreview({ onOpen }) {
  const list = PAST_EVENTS
  if (!list.length) return null
  const top = list.slice(0, 3)
  return (
    <section className="relative mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-24">
      <SectionHead eyebrow="Past events" title="What We've Done" sub="Workshops, competitions and meet-ups. Tap any event to see its photos and video." />
      <Reveal y={24} delay={0.1}>
        <div className="mt-10 grid grid-cols-2 gap-3 md:h-[30rem] md:grid-cols-3 md:grid-rows-2 md:gap-4">
          {top.map((e, i) => (
            <Tile key={e.id} e={e} i={i} onOpen={onOpen} big={i === 0} />
          ))}
        </div>
        <div className="mt-8 flex justify-center">
          <MoreButton id="events">See all {list.length} events</MoreButton>
        </div>
      </Reveal>
    </section>
  )
}
