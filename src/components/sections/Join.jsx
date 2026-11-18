import { ArrowRight } from 'lucide-react'
import { FaWhatsapp } from 'react-icons/fa6'
import SectionHead from '../ui/SectionHead'
import { Reveal, Magnetic } from '../ui/motion'
import { scrollToId } from '../../lib/scroll'
import { SITE } from '../../data/site'
import { btnPrimary, btnGhost } from '../../lib/ui'

export default function Join() {
  const { joinForm, whatsapp } = SITE.links

  return (
    <section id="join" className="relative mx-auto max-w-6xl px-5 pb-10 md:px-8 md:pb-14">
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
                    <a href={joinForm} target="_blank" rel="noopener noreferrer" data-confetti className={btnPrimary}>
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
                    <a href={whatsapp} target="_blank" rel="noopener noreferrer" data-confetti className={btnGhost}>
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

      <Reveal y={20}>
        <p className="mt-10 text-center text-sm text-white/55">
          Have questions first?{' '}
          <button type="button" onClick={() => scrollToId('faq')} className="font-semibold text-aws-soft underline-offset-4 hover:text-white hover:underline">
            Read the FAQ
          </button>
        </p>
      </Reveal>
    </section>
  )
}
