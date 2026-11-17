import { AWS_SERVICES } from '../../data/site'

function Row({ reverse = false }) {
  // the list is doubled so the loop is seamless (animation moves -50%)
  const items = [...AWS_SERVICES, ...AWS_SERVICES]
  return (
    <div className="overflow-hidden">
      <div className={`marquee-track ${reverse ? 'reverse' : ''}`}>
        {items.map((name, i) => (
          <span
            key={i}
            className="flex items-center gap-8 whitespace-nowrap pr-8 font-display text-2xl font-semibold text-white/[0.14] md:text-4xl"
          >
            {name}
            <span className="text-smile/60">✦</span>
          </span>
        ))}
      </div>
    </div>
  )
}

export default function Marquee() {
  return (
    // the band is tilted; clipping sideways stops its corners adding a sliver of horizontal scroll
    <div aria-hidden="true" className="relative z-10 overflow-x-clip py-6">
      <div className="-rotate-1 space-y-3 border-y border-white/5 bg-ink-2/60 py-5 backdrop-blur-sm">
        <Row />
        <Row reverse />
      </div>
    </div>
  )
}
