import { Target, Telescope, Check } from 'lucide-react'
import SectionHead from '../ui/SectionHead'
import { Reveal, Card3D } from '../ui/motion'
import { MISSION, VISION } from '../../data/site'

function Panel({ icon: Icon, data, delay = 0, children }) {
  return (
    <Reveal delay={delay} className="h-full">
      <Card3D className="glass group relative h-full overflow-hidden rounded-3xl p-8 md:p-10">
        <Icon
          aria-hidden="true"
          className="absolute -right-6 -top-6 h-40 w-40 text-aws/10 transition-all duration-700 group-hover:rotate-12 group-hover:text-aws/20"
          strokeWidth={1}
        />
        <span className="relative inline-flex items-center gap-2 rounded-full border border-aws/30 bg-aws/10 px-3 py-1 font-mono text-xs uppercase tracking-widest text-aws-soft">
          <Icon size={13} />
          {data.badge}
        </span>
        <h3 className="relative mt-6 font-display text-2xl font-bold leading-tight text-white md:text-3xl">
          {data.title}
        </h3>
        <p className="relative mt-4 leading-relaxed text-white/65">{data.description}</p>
        {children}
      </Card3D>
    </Reveal>
  )
}

export default function About() {
  return (
    <section id="about" className="relative mx-auto max-w-7xl px-5 py-24 md:px-8 md:py-32">
      <SectionHead
        eyebrow="About the club"
        title="Where Students Meet the Cloud"
        sub="Sipna AWS Club is a student community at Sipna COET built around learning Amazon Web Services by actually using it."
      />

      <div className="mt-14 grid gap-6 lg:grid-cols-2">
        <Panel icon={Target} data={MISSION}>
          <ul className="relative mt-7 space-y-3">
            {MISSION.objectives.map((o) => (
              <li key={o} className="flex items-start gap-3 text-sm text-white/80 md:text-base">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-aws/25 text-aws-soft">
                  <Check size={12} strokeWidth={3} />
                </span>
                {o}
              </li>
            ))}
          </ul>
        </Panel>
        <Panel icon={Telescope} data={VISION} delay={0.12} />
      </div>
    </section>
  )
}
