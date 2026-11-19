import SectionHead from '../ui/SectionHead'
import { Reveal } from '../ui/motion'
import { navigate } from '../../lib/scroll'
import { LEGAL } from '../../data/legal'

const OTHERS = [
  ['/privacy', 'Privacy Policy'],
  ['/terms', 'Terms of Use'],
  ['/conduct', 'Code of Conduct'],
]

const fmt = (d) =>
  new Date(d + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })

export default function Legal({ doc }) {
  const d = LEGAL[doc]
  if (!d) return null
  return (
    <section className="relative mx-auto max-w-3xl px-5 pb-10 md:px-8 md:pb-14">
      <SectionHead eyebrow="Official" title={d.title} sub={d.intro} />
      <p className="mt-5 font-mono text-xs uppercase tracking-[0.18em] text-white/60">
        Last updated {fmt(d.updated)}
      </p>

      <div className="mt-10 space-y-8">
        {d.sections.map((s, i) => (
          <Reveal key={s.h} y={20} delay={0.04}>
            <div className="glass rounded-3xl p-6 md:p-8">
              <h2 className="font-display text-lg font-semibold text-white md:text-xl">
                <span className="mr-2 font-mono text-sm text-aws-soft">{String(i + 1).padStart(2, '0')}</span>
                {s.h}
              </h2>
              {s.p.map((t) => (
                <p key={t} className="mt-3 leading-relaxed text-white/60">
                  {t}
                </p>
              ))}
            </div>
          </Reveal>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        {OTHERS.filter(([to]) => to !== '/' + doc).map(([to, label]) => (
          <a
            key={to}
            href={to}
            onClick={(e) => {
              if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return
              e.preventDefault()
              navigate(to)
            }}
            className="rounded-full border border-white/15 px-5 py-2.5 text-sm text-white/70 transition-colors hover:border-aws/60 hover:text-white"
          >
            {label}
          </a>
        ))}
      </div>
    </section>
  )
}
