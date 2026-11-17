import { useEffect, useRef } from 'react'
import { ArrowRight, Image as ImageIcon, Play } from 'lucide-react'
import SectionHead from '../ui/SectionHead'
import EventCover from '../ui/EventCover'
import { Card3D } from '../ui/motion'
import { gsap, scrollToId } from '../../lib/scroll'
import { PAST_EVENTS } from '../../data/events'
import { youtubeId } from '../../lib/eventMedia'
import { pad2 } from '../../lib/ui'

const INTRO_SUB = `${PAST_EVENTS.length} events so far. Open any frame to watch the video and browse the photos.`

/**
 * Past events as a film reel.
 *  - desktop: the section pins and the reel slides sideways as you scroll
 *  - phones / reduced motion: a normal swipeable row
 */
export default function EventsReel({ onOpen }) {
  const section = useRef(null)
  const wrap = useRef(null)
  const track = useRef(null)
  const progress = useRef(null)

  useEffect(() => {
    const mm = gsap.matchMedia()
    mm.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
      const sec = section.current
      const tr = track.current
      if (!sec || !tr) return
      gsap.set(wrap.current, { overflow: 'hidden' }) // no manual sideways scroll while pinned
      const distance = () => Math.max(0, tr.scrollWidth - window.innerWidth)
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: sec,
          start: 'top top',
          end: () => `+=${Math.max(distance(), 1)}`,
          pin: true,
          scrub: 0.8,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      })
      tl.to(tr, { x: () => -distance(), duration: 1 }, 0)
      tl.fromTo(progress.current, { scaleX: 0 }, { scaleX: 1, duration: 1 }, 0)
    })
    return () => mm.revert()
  }, [])

  return (
    <section
      id="events"
      ref={section}
      className="relative py-24 md:flex md:h-svh md:items-center md:py-0"
    >
      <div className="w-full">
        {/* phones: heading sits above the swipe row */}
        <div className="mb-10 px-5 md:hidden">
          <SectionHead eyebrow="Past events" title="Moments From Our Journey" sub={INTRO_SUB} />
        </div>

        <div className="film">
          <div ref={wrap} className="no-scrollbar overflow-x-auto max-md:snap-x max-md:snap-mandatory">
            <div ref={track} className="flex w-max items-stretch gap-5 px-5 md:gap-10 md:px-[8vw]">
              <div className="hidden w-[34rem] shrink-0 flex-col justify-center pr-6 md:flex">
                <SectionHead eyebrow="Past events" title="Moments From Our Journey" sub={INTRO_SUB} />
              </div>

              {PAST_EVENTS.map((e, i) => {
                const hasVideo = !!(e.video || youtubeId(e.youtube))
                return (
                  <Card3D
                    key={e.id}
                    as="button"
                    type="button"
                    onClick={() => onOpen(e)}
                    aria-label={`Open ${e.title}: photos and video`}
                    className="group glass relative flex h-[30rem] w-[80vw] shrink-0 flex-col overflow-hidden rounded-3xl text-left max-md:snap-center md:h-[min(62svh,34rem)] md:w-[26rem]"
                  >
                    <div className="relative h-[55%] shrink-0 overflow-hidden">
                      <div className="h-full w-full transition-transform duration-700 group-hover:scale-110">
                        <EventCover event={e} index={i} />
                      </div>
                      <div className="absolute inset-0 bg-linear-to-t from-ink-2 via-ink-2/10 to-transparent" />
                      <span className="absolute left-4 top-4 rounded-full bg-black/40 px-3 py-1 font-mono text-xs text-white backdrop-blur">
                        {pad2(i + 1)}
                      </span>
                      {hasVideo && (
                        <span className="absolute inset-0 grid place-items-center">
                          <span className="grid h-16 w-16 place-items-center rounded-full bg-aws/90 text-white shadow-[0_0_50px_rgba(140,79,255,0.9)] transition-transform duration-500 group-hover:scale-110">
                            <Play size={24} fill="currentColor" />
                          </span>
                        </span>
                      )}
                    </div>

                    <div className="flex flex-1 flex-col p-6">
                      <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-aws-soft">
                        {e.category}
                        {e.date && <span className="text-white/40">· {e.date}</span>}
                      </div>
                      <h3 className="mt-2 font-display text-xl font-bold leading-snug text-white">{e.title}</h3>
                      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-white/55">{e.description}</p>
                      <div className="mt-auto flex items-center justify-between pt-4 text-xs text-white/50">
                        <span className="flex items-center gap-3">
                          <span className="flex items-center gap-1.5">
                            <ImageIcon size={13} />
                            {e.photos.length} {e.photos.length === 1 ? 'photo' : 'photos'}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Play size={13} />
                            {hasVideo ? 'Video' : 'Video soon'}
                          </span>
                        </span>
                        <span className="flex items-center gap-1 font-semibold text-aws-soft transition-all group-hover:gap-2 group-hover:text-white">
                          Open <ArrowRight size={14} />
                        </span>
                      </div>
                    </div>
                  </Card3D>
                )
              })}

              <div className="flex h-[30rem] w-[80vw] shrink-0 flex-col items-start justify-center rounded-3xl border border-dashed border-aws/40 bg-aws/5 p-8 max-md:snap-center md:h-[min(62svh,34rem)] md:w-[22rem]">
                <span className="font-mono text-xs uppercase tracking-widest text-smile">Next frame</span>
                <h3 className="mt-3 font-display text-3xl font-bold text-white">Your event could be next.</h3>
                <p className="mt-3 text-sm text-white/55">
                  Every frame on this reel started as an idea. See what we are planning.
                </p>
                <button
                  type="button"
                  onClick={() => scrollToId('upcoming')}
                  className="group mt-6 inline-flex items-center gap-2 rounded-full bg-aws px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-aws-soft hover:text-ink"
                >
                  Upcoming event
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </div>
          </div>

          <div className="mx-auto mt-8 hidden w-[min(34rem,70vw)] items-center gap-4 md:flex" aria-hidden="true">
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/40">Scroll</span>
            <div className="h-px flex-1 bg-white/10">
              <div ref={progress} className="h-px origin-left scale-x-0 bg-linear-to-r from-aws to-smile" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
