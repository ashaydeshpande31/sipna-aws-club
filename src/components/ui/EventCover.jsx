import LogoMark from './LogoMark'
import { pad2 } from '../../lib/ui'

const HUES = [268, 282, 255, 296]

/** First event photo, or a purple placeholder until photos are added. */
export default function EventCover({ event, index = 0, className = '' }) {
  const img = event.photos && event.photos[0]
  if (img) {
    return (
      <img
        src={img}
        alt={`${event.title}: cover photo`}
        loading="lazy"
        decoding="async"
        className={`h-full w-full object-cover ${className}`}
      />
    )
  }
  const hue = HUES[index % HUES.length]
  return (
    <div
      className={`relative h-full w-full overflow-hidden ${className}`}
      style={{
        background: `radial-gradient(circle at 25% 20%, hsl(${hue} 80% 38% / 0.7), transparent 55%), linear-gradient(135deg, hsl(${hue} 60% 17%), hsl(${hue + 18} 70% 7%))`,
      }}
      role="img"
      aria-label={`${event.title}: photos coming soon`}
    >
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />
      <LogoMark className="absolute -bottom-6 -right-6 h-40 w-40 opacity-25" />
      <span className="absolute bottom-3 left-4 font-display text-6xl font-bold text-white/10">
        {pad2(index + 1)}
      </span>
      <span className="absolute right-4 top-4 rounded-full border border-white/10 bg-black/20 px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-white/50">
        Photos coming soon
      </span>
    </div>
  )
}
