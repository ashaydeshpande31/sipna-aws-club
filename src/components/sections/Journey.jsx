import { useEffect, useRef } from 'react'
import { ArrowRight, Image as ImageIcon, Play } from 'lucide-react'
import SectionHead from '../ui/SectionHead'
import { gsap, reducedMotion, scrollToId } from '../../lib/scroll'
import { SITE } from '../../data/site'
import { PAST_EVENTS, UPCOMING_EVENT } from '../../data/events'
import { youtubeId } from '../../lib/eventMedia'
import { chip, pad2 } from '../../lib/ui'

function buildNodes() {
  const founded = new Date(SITE.founded)
  const foundedLabel = Number.isNaN(founded.getTime())
    ? ''
    : founded.toLocaleDateString('en-IN', { month: 'long', year: 'numeric', timeZone: 'UTC' })

  const nodes = [
    {
      kind: 'start',
      title: 'The Club Is Start',
      date: foundedLabel,
      text: 'Every big cloud starts with one drop. Ours was our leader, Ayushi Sawarkar, who started Sipna AWS Club at Sipna COET and gave students a place to learn AWS by building.',
    },
    ...PAST_EVENTS.map((event) => ({
      kind: 'event',
      event,
      title: event.title,
      date: event.date,
      category: event.category,
      text: event.description,
    })),
    {
      kind: 'next',
      title: UPCOMING_EVENT.title || 'What Comes Next',
      date: '',
      text:
        UPCOMING_EVENT.description ||
        'The next chapter is already being planned. Join the club and be part of it from day one.',
    },
  ]
  return nodes
}

const NODES = buildNodes()

export default function Journey({ onOpen }) {
  const list = useRef(null)
  const line = useRef(null)

  useEffect(() => {
    const el = list.current
    if (!el || reducedMotion()) return
    const ctx = gsap.context(() => {
      gsap.fromTo(
        line.current,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: 'none',
          scrollTrigger: { trigger: el, start: 'top 65%', end: 'bottom 65%', scrub: true },
        },
      )
      gsap.utils.toArray('[data-node]').forEach((node, i) => {
        const dot = node.querySelector('[data-dot]')
        const card = node.querySelector('[data-card]')
        gsap.from(card, {
          opacity: 0,
          y: 60,
          x: i % 2 === 0 ? -30 : 30,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: { trigger: node, start: 'top 85%', once: true },
        })
        gsap.fromTo(
          dot,
          { scale: 0.6, backgroundColor: '#2a1d4d', boxShadow: '0 0 0 0 rgba(140,79,255,0)' },
          {
            scale: 1,
            backgroundColor: '#8c4fff',
            boxShadow: '0 0 0 6px rgba(140,79,255,0.2), 0 0 24px rgba(140,79,255,0.9)',
            duration: 0.5,
            ease: 'back.out(2)',
            scrollTrigger: { trigger: node, start: 'top 62%', toggleActions: 'play none none reverse' },
          },
        )
      })
    }, el)
    return () => ctx.revert()
  }, [])

  return (
    <section id="journey" className="relative mx-auto max-w-7xl px-5 py-24 md:px-8 md:py-32">
      <SectionHead
        eyebrow="Our journey"
        title="From Day One to What's Next"
        sub="Every great cloud starts with a single drop. Here is how Sipna AWS Club has grown, one event at a time."
        center
      />

      <div ref={list} className="relative mx-auto mt-20 max-w-5xl">
        <div className="absolute left-4 top-0 h-full w-px bg-white/10 md:left-1/2" />
        <div
          ref={line}
          className="absolute left-4 top-0 h-full w-px origin-top bg-linear-to-b from-aws via-aws-soft to-smile md:left-1/2"
        />

        {NODES.map((n, i) => {
          const even = i % 2 === 0
          const last = i === NODES.length - 1
          const hasVideo = n.event && (n.event.video || youtubeId(n.event.youtube))
          return (
            <div
              key={`${n.kind}-${i}`}
              data-node
              className={`relative pl-12 ${last ? 'pb-0' : 'pb-14'} md:w-1/2 ${
                even ? 'md:pl-0 md:pr-14' : 'md:ml-auto md:pl-14'
              }`}
            >
              <span
                data-dot
                className={`absolute top-7 h-3 w-3 rounded-full bg-[#2a1d4d] ${
                  even ? 'left-[10px] md:left-auto md:-right-[6px]' : 'left-[10px] md:-left-[6px]'
                }`}
              />
              <div
                data-card
                className={`glass rounded-3xl p-6 md:p-7 ${
                  n.kind === 'next' ? 'border-smile/40' : ''
                }`}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs text-aws-soft">
                    {n.kind === 'event' ? `EVENT ${pad2(i)}` : n.kind === 'start' ? 'CHAPTER 00' : 'UP NEXT'}
                  </span>
                  {n.category && <span className={chip}>{n.category}</span>}
                  {n.date && <span className={chip}>{n.date}</span>}
                </div>
                <h3 className="mt-3 font-display text-xl font-bold text-white md:text-2xl">{n.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/60 md:text-base">{n.text}</p>

                {n.kind === 'event' && (
                  <button
                    type="button"
                    onClick={() => onOpen(n.event)}
                    className="group mt-5 inline-flex items-center gap-2 text-sm font-semibold text-aws-soft transition-colors hover:text-white"
                  >
                    {hasVideo ? <Play size={14} /> : <ImageIcon size={14} />}
                    View photos &amp; video
                    <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                  </button>
                )}
                {n.kind === 'next' && (
                  <button
                    type="button"
                    onClick={() => scrollToId('upcoming')}
                    className="group mt-5 inline-flex items-center gap-2 text-sm font-semibold text-smile transition-colors hover:text-white"
                  >
                    See the next event
                    <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
