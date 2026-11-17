import { Users, CalendarCheck, GraduationCap, Hourglass } from 'lucide-react'
import { Counter, Reveal } from '../ui/motion'
import { ALL_PEOPLE } from '../../data/team'
import { PAST_EVENTS } from '../../data/events'
import { SITE } from '../../data/site'
import { monthsSince } from '../../lib/ui'

// Every number is worked out from the data files, so it updates by itself.
const participants = PAST_EVENTS.reduce((sum, e) => sum + (e.participants || 0), 0)
const branches = new Set(ALL_PEOPLE.map((p) => p.department)).size

const STATS = [
  { icon: Users, value: ALL_PEOPLE.length, label: 'Team Members' },
  { icon: CalendarCheck, value: PAST_EVENTS.length, label: 'Events Hosted' },
  participants > 0
    ? { icon: GraduationCap, value: participants, suffix: '+', label: 'Students Reached' }
    : { icon: GraduationCap, value: branches, label: 'Branches Represented' },
  { icon: Hourglass, value: monthsSince(SITE.founded), label: 'Months Active' },
]

export default function Stats() {
  return (
    <section aria-label="The club in numbers" className="relative mx-auto max-w-7xl px-5 pt-24 md:px-8 md:pt-32">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
        {STATS.map((s, i) => (
          <Reveal key={s.label} delay={i * 0.08} className="h-full">
            <div className="glass h-full rounded-3xl p-6 md:p-8">
              <s.icon className="text-aws-soft" size={22} />
              <div className="mt-5 font-display text-4xl font-bold text-white md:text-5xl">
                <Counter to={s.value} suffix={s.suffix || ''} />
              </div>
              <div className="mt-1 text-sm text-white/55">{s.label}</div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
