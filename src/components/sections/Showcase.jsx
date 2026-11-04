import { ArrowUpRight } from 'lucide-react'
import SectionHead from '../ui/SectionHead'
import { Reveal, Card3D } from '../ui/motion'
import { SHOWCASE } from '../../data/events'
import { getInitials } from '../../data/team'

const PLACEHOLDERS = [
  { name: 'Your name here', url: '', tag: 'Your portfolio could be next' },
  { name: 'Your name here', url: '', tag: 'Your portfolio could be next' },
  { name: 'Your name here', url: '', tag: 'Your portfolio could be next' },
]

const host = (url) => {
  try {
    return new URL(url).host
  } catch {
    return url
  }
}

export default function Showcase() {
  const items = SHOWCASE.length ? SHOWCASE : PLACEHOLDERS
  const live = SHOWCASE.length > 0

  return (
    <section id="showcase" className="relative mx-auto max-w-7xl px-5 pb-24 md:px-8 md:pb-32">
      <SectionHead
        eyebrow="Student showcase"
        title="Portfolios That Went Live"
        sub={
          live
            ? 'Built by students and hosted on the internet during our Online Portfolio Hosting session.'
            : 'Websites built and hosted by students during our Online Portfolio Hosting session will appear here.'
        }
      />

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((s, i) => {
          const Wrapper = live ? 'a' : 'div'
          const link = live ? { href: s.url, target: '_blank', rel: 'noopener noreferrer' } : {}
          return (
            <Reveal key={`${s.name}-${i}`} delay={(i % 3) * 0.1} className="h-full">
              <Card3D as={Wrapper} {...link} className="group glass block h-full overflow-hidden rounded-3xl">
                {/* little browser window */}
                <div className="flex items-center gap-2 border-b border-white/10 bg-black/20 px-4 py-3">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
                  <span className="ml-3 min-w-0 flex-1 truncate rounded-md bg-white/5 px-3 py-1 font-mono text-[11px] text-white/45">
                    {live ? host(s.url) : 'your-portfolio.vercel.app'}
                  </span>
                </div>
                <div className="relative grid aspect-[16/10] place-items-center overflow-hidden bg-linear-to-br from-aws/25 via-panel to-ink">
                  <span className="font-display text-6xl font-bold text-white/15 transition-transform duration-700 group-hover:scale-125">
                    {live ? getInitials(s.name) : '{ }'}
                  </span>
                  {!live && (
                    <div className="absolute inset-x-6 bottom-6 space-y-2" aria-hidden="true">
                      <div className="h-2 w-2/3 rounded-full bg-white/10" />
                      <div className="h-2 w-1/2 rounded-full bg-white/10" />
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between p-5">
                  <div className="min-w-0">
                    <div className="truncate font-display font-semibold text-white">{s.name}</div>
                    {s.tag && <div className="truncate text-sm text-white/50">{s.tag}</div>}
                  </div>
                  {live && (
                    <ArrowUpRight
                      size={20}
                      className="shrink-0 text-aws-soft transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1"
                    />
                  )}
                </div>
              </Card3D>
            </Reveal>
          )
        })}
      </div>
    </section>
  )
}
