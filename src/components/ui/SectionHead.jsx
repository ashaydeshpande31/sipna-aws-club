import { Reveal, SplitText } from './motion'
import Scramble from './Scramble'

/** Standard section heading: small eyebrow, big animated title, optional sub-text. */
export default function SectionHead({ eyebrow, title, sub, center = false, className = '' }) {
  return (
    <div className={`${center ? 'mx-auto text-center' : ''} max-w-3xl ${className}`}>
      <Reveal y={16}>
        <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.22em] text-aws-soft">
          <span className="h-px w-8 bg-aws-soft/60" />
          <Scramble text={eyebrow} />
        </span>
      </Reveal>
      <SplitText
        as="h2"
        text={title}
        className="mt-4 font-display text-[clamp(2rem,4.6vw,3.6rem)] font-bold leading-[1.08] text-white"
      />
      {sub && (
        <Reveal y={20} delay={0.15}>
          <p className="mt-5 text-base leading-relaxed text-white/60 md:text-lg">{sub}</p>
        </Reveal>
      )}
    </div>
  )
}
