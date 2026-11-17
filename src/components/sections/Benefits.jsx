import { GraduationCap, FlaskConical, Users, TrendingUp } from 'lucide-react'
import SectionHead from '../ui/SectionHead'
import { Reveal, Card3D } from '../ui/motion'
import { BENEFITS } from '../../data/site'

const ICONS = [GraduationCap, FlaskConical, Users, TrendingUp]

export default function Benefits() {
  return (
    <section id="benefits" className="relative mx-auto max-w-7xl px-5 pb-24 md:px-8 md:pb-32">
      <SectionHead eyebrow="Why join" title="What You Get Out of the Club" center />

      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {BENEFITS.map((b, i) => {
          const Icon = ICONS[i % ICONS.length]
          return (
            <Reveal key={b.title} delay={i * 0.09} className="h-full">
              <Card3D className="glass group h-full rounded-3xl p-7">
                <div className="flex items-center justify-between">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-linear-to-br from-aws to-aws-deep text-white shadow-[0_8px_30px_-6px_rgba(140,79,255,0.9)] transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110">
                    <Icon size={22} />
                  </span>
                  <span className="font-mono text-xs text-white/30">0{i + 1}</span>
                </div>
                <h3 className="mt-6 font-display text-lg font-semibold text-white">{b.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/60">{b.description}</p>
              </Card3D>
            </Reveal>
          )
        })}
      </div>
    </section>
  )
}
