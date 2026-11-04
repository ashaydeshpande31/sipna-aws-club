import { useRef, useState } from 'react'
import { ArrowRight, Minus, Plus } from 'lucide-react'
import { FaWhatsapp } from 'react-icons/fa6'
import SectionHead from '../ui/SectionHead'
import { Reveal, Magnetic } from '../ui/motion'
import { ScrollTrigger } from '../../lib/scroll'
import { SITE, FAQ } from '../../data/site'
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

export default function Join() {
  const [open, setOpen] = useState(0)
  const timer = useRef(null)
  const { joinForm, whatsapp } = SITE.links

  const toggle = (i) => {
    setOpen((cur) => (cur === i ? -1 : i))
    // page height changes, so let the scroll animations re-measure after the panel finishes moving
    clearTimeout(timer.current)
    timer.current = setTimeout(() => ScrollTrigger.refresh(), 600)
  }

  return (
    <section id="join" className="relative mx-auto max-w-6xl px-5 pb-24 md:px-8 md:pb-32">
      <Reveal y={60}>
        <div className="aura relative rounded-[2rem] p-[1.5px]">
          <div className="relative overflow-hidden rounded-[calc(2rem-1.5px)] bg-ink-2 px-6 py-16 text-center md:px-12 md:py-24">
            <div className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-aws/30 blur-[110px]" />
            <div className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-smile/10 blur-[110px]" />

            <div className="relative">
              <SectionHead
                eyebrow="Join the club"
                title="Ready to Build in the Cloud?"
                sub="No experience needed. Bring curiosity and we will take care of the rest."
                center
              />

              <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                <Magnetic>
                  {joinForm ? (
                    <a href={joinForm} target="_blank" rel="noopener noreferrer" className={btnPrimary}>
                      Join Sipna AWS Club
                      <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                    </a>
                  ) : (
                    <span
                      role="note"
                      className="inline-flex items-center gap-2 rounded-full border border-aws/40 bg-aws/10 px-6 py-3.5 text-sm font-semibold text-aws-soft"
                    >
                      Registration opening soon
                    </span>
                  )}
                </Magnetic>
                {whatsapp && (
                  <Magnetic>
                    <a href={whatsapp} target="_blank" rel="noopener noreferrer" className={btnGhost}>
                      <FaWhatsapp size={17} />
                      WhatsApp community
                    </a>
                  </Magnetic>
                )}
              </div>
            </div>
          </div>
        </div>
      </Reveal>

      <div className="mx-auto mt-24 max-w-3xl">
        <Reveal y={30}>
          <h2 className="mb-6 text-center font-display text-2xl font-bold text-white md:text-3xl">
            Questions? We have answers.
          </h2>
        </Reveal>
        <Reveal y={30} delay={0.1}>
          <div className="glass rounded-3xl px-6 md:px-8">
            {FAQ.map((item, i) => (
              <FaqItem key={item.q} id={`faq-${i}`} item={item} open={open === i} onToggle={() => toggle(i)} />
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
