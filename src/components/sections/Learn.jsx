import { ArrowUpRight } from 'lucide-react'
import SectionHead from '../ui/SectionHead'
import { Reveal, Card3D } from '../ui/motion'
import { LEARNING_PATH } from '../../data/site'

export default function Learn() {
  return (
    <section id="learn" className="relative mx-auto max-w-7xl px-5 pb-24 md:px-8 md:pb-32">
      <SectionHead
        eyebrow="Learn with us"
        title="Your Cloud Learning Path"
        sub="A simple route from zero to AWS certified. We run workshops along the way, and every link below is an official AWS resource."
      />

      <div className="relative mt-14">
        {/* connecting line behind the cards (large screens) */}
        <div
          className="pointer-events-none absolute left-0 right-0 top-[3.25rem] hidden h-px bg-linear-to-r from-transparent via-aws/50 to-transparent lg:block"
          aria-hidden="true"
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {LEARNING_PATH.map((step, i) => (
            <Reveal key={step.title} delay={i * 0.1} className="h-full">
              <Card3D className="glass group relative h-full rounded-3xl p-7">
                <div className="relative z-10 grid h-12 w-12 place-items-center rounded-full border border-aws/50 bg-ink-2 font-display text-lg font-bold text-aws-soft transition-colors duration-300 group-hover:bg-aws group-hover:text-white">
                  {i + 1}
                </div>
                <h3 className="mt-6 font-display text-lg font-semibold text-white">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/60">{step.text}</p>
                <a
                  href={step.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-aws-soft transition-colors hover:text-white"
                >
                  {step.cta}
                  <ArrowUpRight size={15} />
                </a>
              </Card3D>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
