import { Target, TrendingUp, Image as ImageIcon, CalendarClock, Users, GraduationCap, Heart, ArrowUpRight } from 'lucide-react'
import SectionHead from '../ui/SectionHead'
import { Reveal, Card3D } from '../ui/motion'
import { navigate } from '../../lib/scroll'

const ITEMS = [
  ['About', '/about', Target, 'Who we are, what we believe and what you get from the club.'],
  ['Journey', '/journey', TrendingUp, 'How the club started and the milestones along the way.'],
  ['Events', '/events', ImageIcon, 'Photos and videos from past events, and our Hall of Fame.'],
  ['Upcoming', '/upcoming', CalendarClock, 'What is happening next and how to register.'],
  ['Team', '/team', Users, 'Meet the people who run the club.'],
  ['Learn', '/learn', GraduationCap, 'A simple path from cloud basics to AWS certification.'],
  ['Join', '/join', Heart, 'Become part of the community. It takes a minute.'],
]

/** Home page: a card for every page of the site. */
export default function Explore() {
  return (
    <section className="relative mx-auto max-w-7xl px-5 pb-24 md:px-8 md:pb-32">
      <SectionHead eyebrow="Explore" title="Where Do You Want To Go?" center />
      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {ITEMS.map(([label, path, Icon, text], i) => (
          <Reveal key={path} delay={i * 0.07} className="h-full">
            <Card3D
              as="a"
              href={path}
              onClick={(e) => {
                if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return
                e.preventDefault()
                navigate(path)
              }}
              className="glass group flex h-full flex-col rounded-3xl p-7"
            >
              <div className="flex items-center justify-between">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-linear-to-br from-aws to-aws-deep text-white shadow-[0_8px_30px_-6px_rgba(140,79,255,0.9)] transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110">
                  <Icon size={22} />
                </span>
                <ArrowUpRight size={18} className="text-white/30 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white" />
              </div>
              <h3 className="mt-6 font-display text-lg font-semibold text-white">{label}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/60">{text}</p>
            </Card3D>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
