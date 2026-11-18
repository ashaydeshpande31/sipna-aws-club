import { ArrowRight, Check } from 'lucide-react'
import SectionHead from '../ui/SectionHead'
import { Reveal, Card3D, Magnetic } from '../ui/motion'
import { scrollToId } from '../../lib/scroll'
import { SITE, MISSION, BENEFITS, LEARNING_PATH } from '../../data/site'
import { PAST_EVENTS } from '../../data/events'
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
