import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { gsap, lockScroll, reducedMotion, scrollToId } from '../lib/scroll'
import { ALL_PEOPLE } from '../data/team'
import { PAST_EVENTS, UPCOMING_EVENT } from '../data/events'
import { SITE } from '../data/site'

const BOOT = [
  { t: 'dim', text: 'Sipna AWS Club · Cloud Shell' },
  { t: 'out', text: "Welcome, builder. Type 'help' to see what this shell can do." },
]

const HELP = [
  'Available commands:',
  '  aws --version               show the CLI version',
  '  aws sts get-caller-identity who are you in this cloud?',
  '  aws s3 ls                   list buckets',
  '  aws team ls                 meet the team',
  '  aws events ls               list our events',
  '  aws join                    take me to the join section',
  '  whoami · date · clear · exit',
]

const pad = (n) => String(n).padStart(2, '0')

/** Easter-egg terminal. Opens when someone types "aws" on the page. */
export default function Terminal({ onClose }) {
  const [lines, setLines] = useState(BOOT)
  const [value, setValue] = useState('')
  const history = useRef([])
  const hIdx = useRef(-1)
  const input = useRef(null)
  const body = useRef(null)
  const panel = useRef(null)
  const root = useRef(null)
  const closing = useRef(false)

  const close = (after) => {
    if (closing.current) return
    closing.current = true
    const finish = () => {
      onClose()
      if (after) setTimeout(after, 80)
    }
    if (reducedMotion() || !panel.current) return finish()
    gsap.to(panel.current, { opacity: 0, y: 24, scale: 0.97, duration: 0.22, ease: 'power2.in' })
    gsap.to(root.current, { opacity: 0, duration: 0.25, onComplete: finish })
  }

  useEffect(() => {
    lockScroll(true)
    input.current && input.current.focus()
    if (!reducedMotion()) {
      gsap.fromTo(root.current, { opacity: 0 }, { opacity: 1, duration: 0.25 })
      gsap.fromTo(
        panel.current,
        { opacity: 0, y: 40, scale: 0.94 },
        { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'back.out(1.4)' },
      )
    }
    return () => lockScroll(false)
  }, [])

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && close()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (body.current) body.current.scrollTop = body.current.scrollHeight
  }, [lines])

  const print = (rows, t = 'out') =>
    setLines((l) => [...l, ...rows.map((text) => ({ t, text }))])

  const run = (raw) => {
    const cmd = raw.trim().replace(/\s+/g, ' ')
    setLines((l) => [...l, { t: 'in', text: cmd }])
    if (!cmd) return
    history.current.unshift(cmd)
    hIdx.current = -1
    const lower = cmd.toLowerCase()

    if (lower === 'help' || lower === 'aws help' || lower === 'aws') return print(HELP)
    if (lower === 'clear') return setLines([])
    if (lower === 'exit' || lower === 'quit') return close()
    if (lower === 'whoami') return print(['a future cloud engineer ☁'])
    if (lower === 'date') return print([new Date().toString()])
    if (lower === 'aws --version' || lower === 'aws version')
      return print([`aws-cli/sipna-edition · built by students in Amravati`])

    if (lower === 'aws sts get-caller-identity')
      return print([
        '{',
        '  "UserId": "FUTURE-CLOUD-ENGINEER",',
        '  "Account": "SIPNA-COET",',
        `  "Arn": "arn:aws:iam::sipna-coet:user/${SITE.name.toLowerCase().replace(/\s+/g, '-')}-member"`,
        '}',
      ])

    if (lower === 'aws s3 ls')
      return print([
        '2026-07-01 10:00:00 sipna-aws-club-events',
        '2026-07-01 10:00:00 sipna-aws-club-team',
        '2026-07-01 10:00:00 sipna-aws-club-memories',
        '',
        "try: aws s3 ls s3://sipna-aws-club-events",
      ])

    if (lower === 'aws s3 ls s3://sipna-aws-club-events')
      return print(
        PAST_EVENTS.length
          ? PAST_EVENTS.map(
              (e) => `PRE ${e.id}/   (${e.photos.length} photos${e.video || e.youtube ? ', 1 video' : ''})`,
            )
          : ['(empty)'],
      )

    if (lower === 'aws team ls')
      return print(ALL_PEOPLE.map((p, i) => `${pad(i + 1)}  ${p.name.padEnd(20)} ${p.position}`))

    if (lower === 'aws events ls') {
      const rows = PAST_EVENTS.map((e) => `done   ${(e.date || '—').padEnd(12)} ${e.title}`)
      rows.push(`next   ${(UPCOMING_EVENT.date ? 'scheduled' : 'soon').padEnd(12)} ${UPCOMING_EVENT.title || 'to be announced'}`)
      return print(rows)
    }

    if (lower === 'aws join') {
      print(['Provisioning your seat in the club…'])
      return setTimeout(() => close(() => scrollToId('join')), 700)
    }

    if (lower.startsWith('sudo')) return print(["Nice try. You are not root in this cloud."], 'err')
    if (lower.startsWith('aws ')) return print([`Unknown aws command: '${cmd.slice(4)}'. Try 'help'.`], 'err')
    return print([`command not found: ${cmd.split(' ')[0]}`], 'err')
  }

  const onKeyDown = (e) => {
    if (e.key === 'Enter') {
      run(value)
      setValue('')
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      const next = Math.min(hIdx.current + 1, history.current.length - 1)
      if (next >= 0) {
        hIdx.current = next
        setValue(history.current[next])
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      const next = hIdx.current - 1
      hIdx.current = Math.max(next, -1)
      setValue(next >= 0 ? history.current[next] : '')
    }
  }

  const color = { in: 'text-white', out: 'text-white/75', err: 'text-red-300', dim: 'text-aws-soft' }

  return createPortal(
    <div
      ref={root}
      data-modal
      className="fixed inset-0 z-[95] grid place-items-center bg-black/70 p-3 backdrop-blur-sm md:p-8"
      onMouseDown={(e) => e.target === e.currentTarget && close()}
    >
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label="Cloud shell"
        className="flex h-[min(34rem,85svh)] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-aws/40 bg-[#0b0618] shadow-[0_0_120px_-20px_rgba(140,79,255,0.8)]"
        onClick={() => input.current && input.current.focus()}
      >
        <div className="flex items-center gap-2 border-b border-white/10 bg-white/[0.03] px-4 py-3">
          <button
            type="button"
            aria-label="Close terminal"
            onClick={(e) => {
              e.stopPropagation()
              close()
            }}
            className="h-3 w-3 rounded-full bg-[#ff5f57]"
          />
          <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
          <span className="h-3 w-3 rounded-full bg-[#28c840]" />
          <span className="ml-3 font-mono text-xs text-white/40">aws-cloudshell — sipna</span>
        </div>

        <div
          ref={body}
          data-lenis-prevent
          className="flex-1 overflow-y-auto overscroll-contain p-4 font-mono text-[13px] leading-6 md:p-5"
        >
          {lines.map((l, i) => (
            <div key={i} className={`whitespace-pre-wrap break-words ${color[l.t]}`}>
              {l.t === 'in' && <span className="mr-2 text-aws-soft">❯</span>}
              {l.text || ' '}
            </div>
          ))}
          <label className="flex items-center">
            <span className="mr-2 text-aws-soft">❯</span>
            <input
              ref={input}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={onKeyDown}
              spellCheck={false}
              autoCapitalize="off"
              autoComplete="off"
              autoCorrect="off"
              aria-label="Terminal input"
              className="min-w-0 flex-1 border-0 bg-transparent font-mono text-[13px] text-white caret-[#b58cff] outline-none"
            />
          </label>
        </div>
      </div>
    </div>,
    document.body,
  )
}
