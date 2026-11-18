import { useRef, useState } from 'react'
import { Minus, Plus, ArrowRight } from 'lucide-react'
import SectionHead from '../ui/SectionHead'
import { Reveal, Magnetic } from '../ui/motion'
import { ScrollTrigger, scrollToId } from '../../lib/scroll'
import { FAQ } from '../../data/site'
import { btnPrimary, btnGhost } from '../../lib/ui'

function FaqItem({ item, open, onToggle, id }) {
  return (
    <div className="border-b border-white/10 last:border-b-0">
      <h3>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={`${id}-panel`}
          id={`${id}-btn`}
          className="flex w-full items-center justify-between gap-6 py-5 text-left font-display text-base font-semibold text-white transition-colors hover:text-aws-soft md:text-lg"
        >
          {item.q}
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-white/15 text-aws-soft">
            {open ? <Minus size={16} /> : <Plus size={16} />}
          </span>
        </button>
      </h3>
      <div
        id={`${id}-panel`}
        role="region"
        aria-labelledby={`${id}-btn`}
        className={`grid transition-[grid-template-rows] duration-500 ease-out ${
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
      >
        <div className="overflow-hidden">
          <p className="pb-5 pr-12 leading-relaxed text-white/60">{item.a}</p>
        </div>
      </div>
    </div>
  )
}

export default function Faq() {
  const [open, setOpen] = useState(0)
  const timer = useRef(null)

  const toggle = (i) => {
    setOpen((cur) => (cur === i ? -1 : i))
    // page height changes, so let the scroll animations re-measure after the panel finishes moving
    clearTimeout(timer.current)
    timer.current = setTimeout(() => ScrollTrigger.refresh(), 600)
  }

  return (
    <section id="faq" className="relative mx-auto max-w-6xl px-5 pb-10 md:px-8 md:pb-14">
      <SectionHead eyebrow="FAQ" title="Questions? We Have Answers." center />

      <div className="mx-auto mt-12 max-w-3xl">
        <Reveal y={30} delay={0.1}>
          <div className="glass rounded-3xl px-6 md:px-8">
            {FAQ.map((item, i) => (
              <FaqItem key={item.q} id={`faq-${i}`} item={item} open={open === i} onToggle={() => toggle(i)} />
            ))}
          </div>
        </Reveal>

        <Reveal y={20} delay={0.15}>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Magnetic>
              <button type="button" onClick={() => scrollToId('join')} className={btnPrimary}>
                Ready? Join the club
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </button>
            </Magnetic>
            <button type="button" onClick={() => scrollToId('connect')} className={btnGhost}>
              Still have a question? Contact us
            </button>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
