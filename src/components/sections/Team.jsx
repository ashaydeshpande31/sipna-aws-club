import { useMemo, useState } from 'react'
import SectionHead from '../ui/SectionHead'
import Socials from '../ui/Socials'
import { Reveal, Card3D } from '../ui/motion'
import {
  LEADER,
  CORE_TEAM,
  MEMBERS,
  ALL_PEOPLE,
  DOMAIN_ORDER,
  getDomain,
  getInitials,
} from '../../data/team'

const SHORT = {
  'Information Technology': 'IT',
  'Computer Science & Engineering': 'CSE',
}
const meta = (p) => [SHORT[p.department] || p.department, p.year].filter(Boolean).join(' · ')

/** Photo with an initials fallback if the image is missing or broken. */
function Photo({ person, className = '' }) {
  const [bad, setBad] = useState(false)
  if (!person.img || bad) {
    return (
      <div
        className={`grid h-full w-full place-items-center bg-linear-to-br from-aws/40 to-aws-deep/20 font-display text-5xl font-bold text-white/70 ${className}`}
        role="img"
        aria-label={person.name}
      >
        {getInitials(person.name)}
      </div>
    )
  }
  return (
    <img
      src={person.img}
      alt={person.name}
      loading="lazy"
      decoding="async"
      onError={() => setBad(true)}
      className={`h-full w-full object-cover object-top ${className}`}
    />
  )
}

function Leader() {
  return (
    <Reveal y={50}>
      <div className="aura relative rounded-[2rem] p-[1.5px]">
        <div className="grid items-center gap-8 rounded-[calc(2rem-1.5px)] bg-ink-2 p-6 md:grid-cols-[17rem_1fr] md:gap-12 md:p-10">
          <div className="mx-auto aspect-[4/5] w-full max-w-[17rem] overflow-hidden rounded-2xl">
            <Photo person={LEADER} />
          </div>
          <div className="text-center md:text-left">
            <span className="font-mono text-xs uppercase tracking-[0.25em] text-aws-soft">Club lead</span>
            <h3 className="mt-3 font-display text-4xl font-bold text-white md:text-5xl">{LEADER.name}</h3>
            <div className="mt-4 inline-flex rounded-full bg-aws px-4 py-1.5 text-sm font-semibold text-white shadow-[0_0_40px_-8px_rgba(140,79,255,0.95)]">
              {LEADER.position}
            </div>
            <p className="mt-4 text-white/55">{meta(LEADER)}</p>
            <Socials
              links={LEADER.socials}
              label={LEADER.name}
              size="lg"
              className="mt-6 justify-center md:justify-start"
            />
          </div>
        </div>
      </div>
    </Reveal>
  )
}

function Card({ person, delay = 0 }) {
  return (
    <Reveal delay={delay} y={50} className="h-full">
      <Card3D max={7} className="team-card group glass h-full overflow-hidden rounded-3xl">
        <div className="relative aspect-[4/5] overflow-hidden">
          <Photo person={person} className="transition-transform duration-700 group-hover:scale-105" />
          <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-ink/80 via-transparent to-transparent" />
          <div className="socials absolute inset-x-0 bottom-0 flex justify-center p-3">
            <Socials links={person.socials} label={person.name} size="sm" />
          </div>
        </div>
        <div className="p-5">
          <h4 className="font-display text-base font-semibold text-white">{person.name}</h4>
          <p className="mt-1 text-sm text-aws-soft">{person.position}</p>
          <p className="mt-1 text-xs text-white/45">{meta(person)}</p>
        </div>
      </Card3D>
    </Reveal>
  )
}

function Group({ title, people, filter }) {
  if (!people.length) return null
  return (
    <div className="mt-16">
      <div className="mb-6 flex items-center gap-4">
        <h3 className="font-display text-xl font-semibold text-white">{title}</h3>
        <span className="h-px flex-1 bg-white/10" />
        <span className="font-mono text-xs text-white/40">{people.length}</span>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
        {people.map((p, i) => (
          // the key includes the filter so cards replay their entrance when it changes
          <Card key={`${filter}-${p.name}`} person={p} delay={(i % 4) * 0.07} />
        ))}
      </div>
    </div>
  )
}

export default function Team() {
  const [filter, setFilter] = useState('All')

  const domains = useMemo(() => {
    const present = new Set([...CORE_TEAM, ...MEMBERS].map(getDomain))
    return DOMAIN_ORDER.filter((d) => present.has(d))
  }, [])

  const pick = (list) => (filter === 'All' ? list : list.filter((p) => getDomain(p) === filter))
  const count = (d) => [...CORE_TEAM, ...MEMBERS].filter((p) => getDomain(p) === d).length

  return (
    <section id="team" className="relative mx-auto max-w-7xl px-5 py-24 md:px-8 md:py-32">
      <SectionHead
        eyebrow="The team"
        title="The Students Behind the Cloud"
        sub={`${ALL_PEOPLE.length} students from different branches, building the club together.`}
        center
      />

      <div className="mt-14">
        <Leader />
      </div>

      <div className="mt-16 flex flex-wrap justify-center gap-2" role="group" aria-label="Filter team by area">
        {['All', ...domains].map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => setFilter(d)}
            aria-pressed={filter === d}
            className={`rounded-full border px-4 py-2 text-sm transition-all duration-300 ${
              filter === d
                ? 'border-aws bg-aws text-white shadow-[0_0_30px_-6px_rgba(140,79,255,0.9)]'
                : 'border-white/10 bg-white/5 text-white/65 hover:border-aws/50 hover:text-white'
            }`}
          >
            {d}
            <span className="ml-2 text-xs opacity-60">{d === 'All' ? CORE_TEAM.length + MEMBERS.length : count(d)}</span>
          </button>
        ))}
      </div>

      <Group title="Core Team" people={pick(CORE_TEAM)} filter={filter} />
      <Group title="Members" people={pick(MEMBERS)} filter={filter} />
    </section>
  )
}
