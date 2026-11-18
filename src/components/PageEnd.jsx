import { ArrowRight } from 'lucide-react'
import { navigate } from '../lib/scroll'

// The pages in reading order. Each page ends with a card for the next one, so visitors always know where to go.
const ORDER = [
  ['/about', 'About', 'Our mission, vision and what you get from the club.'],
  ['/journey', 'Journey', 'How the club grew, one event at a time.'],
  ['/events', 'Events', 'Photos and videos from our past events.'],
  ['/upcoming', 'Upcoming', 'What is coming next and how to be part of it.'],
  ['/team', 'Team', 'Meet the students who run the club.'],
  ['/learn', 'Learn', 'A simple path from AWS basics to certification.'],
  ['/play', 'Play', 'A quick AWS quiz and an architecture puzzle.'],
  ['/connect', 'Connect', 'Ask us anything, we reply fast.'],
]
export const END_PAGES = ORDER.map((o) => o[0])

const go = (to) => (e) => {
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return
  e.preventDefault()
  navigate(to)
}

/** Closing strip for every page: the next page + a Join button. */
export default function PageEnd({ path }) {
  const i = ORDER.findIndex((o) => o[0] === path)
  if (i < 0) return null
  const next = ORDER[(i + 1) % ORDER.length]
  const last = i === ORDER.length - 1
  return (
    <section aria-label="Continue" className="relative mx-auto max-w-6xl px-5 pb-16 md:px-8 md:pb-20">
      <div className="grid gap-3 md:grid-cols-[1.4fr_1fr]">
        <a
          href={next[0]}
          onClick={go(next[0])}
          className="group glass flex items-center justify-between gap-4 rounded-3xl p-6 transition-colors hover:border-aws/50 md:p-8"
        >
          <span>
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-aws-soft">
              {last ? 'Back to the start' : 'Next page'}
            </span>
            <span className="mt-1 block font-display text-2xl font-bold text-white md:text-3xl">{next[1]}</span>
            <span className="mt-1 block text-sm text-white/55">{next[2]}</span>
          </span>
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-aws text-white transition-transform group-hover:translate-x-1">
            <ArrowRight size={20} />
          </span>
        </a>
        <a
          href="/join"
          onClick={go('/join')}
          className="group flex items-center justify-between gap-4 rounded-3xl bg-white p-6 text-ink transition-colors hover:bg-aws-soft md:p-8"
        >
          <span>
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-aws-deep">Ready?</span>
            <span className="mt-1 block font-display text-2xl font-bold md:text-3xl">Join the club</span>
            <span className="mt-1 block text-sm text-ink/60">Open to students of all years and branches.</span>
          </span>
          <ArrowRight size={22} className="shrink-0 transition-transform group-hover:translate-x-1" />
        </a>
      </div>
    </section>
  )
}
