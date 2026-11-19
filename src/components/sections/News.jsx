import { ArrowRight } from 'lucide-react'
import SectionHead from '../ui/SectionHead'
import { Reveal } from '../ui/motion'
import { navigate } from '../../lib/scroll'
import { NEWS } from '../../data/news'

const fmt = (d) =>
  new Date(d + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

const open = (to) => (e) => {
  if (/^https?:/.test(to)) return
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return
  e.preventDefault()
  navigate(to)
}

export default function News() {
  const items = [...NEWS].sort((a, b) => (a.date < b.date ? 1 : -1))
  return (
    <section id="news" className="relative mx-auto max-w-3xl px-5 pb-10 md:px-8 md:pb-14">
      <SectionHead
        eyebrow="Official notices"
        title="News & Announcements"
        sub="Official updates from the Sipna AWS Club core team."
      />

      <ol className="mt-12 space-y-5">
        {items.map((n) => (
          <li key={n.date + n.title}>
            <Reveal y={24} delay={0.04}>
              <article className="glass rounded-3xl p-6 md:p-8">
                <div className="flex flex-wrap items-center gap-3 text-xs">
                  <span className="rounded-full bg-aws/20 px-3 py-1 font-mono uppercase tracking-[0.14em] text-aws-soft">
                    {n.kind || 'Notice'}
                  </span>
                  <time dateTime={n.date} className="font-mono text-white/60">
                    {fmt(n.date)}
                  </time>
                </div>
                <h2 className="mt-4 font-display text-xl font-semibold text-white md:text-2xl">{n.title}</h2>
                <p className="mt-2 leading-relaxed text-white/60">{n.text}</p>
                {n.link && (
                  <a
                    href={n.link}
                    onClick={open(n.link)}
                    target={/^https?:/.test(n.link) ? '_blank' : undefined}
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-aws-soft hover:text-white"
                  >
                    {n.linkLabel || 'Read more'} <ArrowRight size={15} />
                  </a>
                )}
              </article>
            </Reveal>
          </li>
        ))}
      </ol>
    </section>
  )
}
