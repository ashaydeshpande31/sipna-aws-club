import { useMemo, useRef, useState, useEffect } from 'react'
import {
  HardDrive, Network, Globe, Lock, Server, Database, Brain, Zap, Webhook, Archive, Activity,
  ArrowRight, RotateCcw, Share2, Check, X, Trophy, Flame,
} from 'lucide-react'
import SectionHead from '../ui/SectionHead'
import { confetti } from '../../lib/fx'
import { haptic } from '../../lib/haptic'
import { navigate } from '../../lib/scroll'
import { QUIZ, BUILDS, SERVICES } from '../../data/play'
import { btnPrimary, btnGhost } from '../../lib/ui'

const ICONS = { HardDrive, Network, Globe, Lock, Server, Database, Brain, Zap, Webhook, Archive, Activity }
const shuffle = (a) => {
  const r = [...a]
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[r[i], r[j]] = [r[j], r[i]]
  }
  return r
}
const ROUND = 8
const rank = (s) =>
  s >= 8 ? 'Cloud Legend' : s >= 6 ? 'Solutions Architect' : s >= 4 ? 'Cloud Practitioner' : 'Cloud Newbie'

function best(set) {
  try {
    if (set != null) localStorage.setItem('aws-quiz-best', String(set))
    return Number(localStorage.getItem('aws-quiz-best') || 0)
  } catch {
    return 0
  }
}

/* ---------------------------------- QUIZ ---------------------------------- */
function Quiz() {
  const make = () =>
    shuffle(QUIZ)
      .slice(0, ROUND)
      .map((q) => {
        const opts = shuffle(q.o.map((t, i) => ({ t, ok: i === q.a })))
        return { ...q, opts }
      })
  const [qs, setQs] = useState(make)
  const [i, setI] = useState(0)
  const [pick, setPick] = useState(-1)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [top, setTop] = useState(0)
  const [copied, setCopied] = useState(false)
  const done = i >= ROUND
  const q = qs[Math.min(i, ROUND - 1)]

  const choose = (k) => {
    if (pick !== -1) return
    setPick(k)
    if (q.opts[k].ok) {
      haptic(15)
      setScore((s) => s + 1)
      setStreak((s) => s + 1)
    } else {
      haptic([30, 40, 30])
      setStreak(0)
    }
  }
  const next = () => {
    const last = i + 1 >= ROUND
    setPick(-1)
    setI(i + 1)
    if (last) {
      const b = Math.max(best(), score)
      best(b)
      setTop(b)
      if (score >= 6) setTimeout(() => confetti(window.innerWidth / 2, window.innerHeight * 0.35, { count: 140, haptic: true }), 150)
    }
  }
  const again = () => {
    setQs(make())
    setI(0)
    setPick(-1)
    setScore(0)
    setStreak(0)
  }
  const share = async () => {
    const text = `I scored ${score}/${ROUND} (${rank(score)}) on the Sipna AWS Club cloud quiz. Can you beat me? ${window.location.origin}/play`
    try {
      if (navigator.share) await navigator.share({ text })
      else {
        await navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    } catch {
      /* cancelled */
    }
  }

  if (done) {
    return (
      <div className="glass mx-auto max-w-xl rounded-3xl p-8 text-center">
        <Trophy className="mx-auto text-smile" size={40} />
        <p className="mt-4 font-mono text-xs uppercase tracking-[0.2em] text-aws-soft">Your rank</p>
        <h3 className="font-display text-3xl font-bold text-white">{rank(score)}</h3>
        <p className="mt-2 text-5xl font-bold text-white">
          {score}
          <span className="text-2xl text-white/40"> / {ROUND}</span>
        </p>
        <p className="mt-2 text-sm text-white/50">Your best: {Math.max(top, score)} / {ROUND}</p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={again} className={btnPrimary}>
            <RotateCcw size={16} /> Play again
          </button>
          <button type="button" onClick={share} className={btnGhost}>
            {copied ? <Check size={16} /> : <Share2 size={16} />} {copied ? 'Copied!' : 'Share score'}
          </button>
        </div>
        <button type="button" onClick={() => navigate('/join')} className="mt-6 text-sm font-semibold text-aws-soft hover:text-white">
          Love the cloud? Join the club →
        </button>
      </div>
    )
  }

  return (
    <div className="glass mx-auto max-w-xl rounded-3xl p-5 md:p-8">
      <div className="flex items-center justify-between text-xs text-white/50">
        <span className="font-mono uppercase tracking-[0.18em]">Question {i + 1} / {ROUND}</span>
        <span className="flex items-center gap-1.5">
          {streak >= 2 && (
            <span className="flex items-center gap-1 text-smile">
              <Flame size={14} /> {streak}
            </span>
          )}
          Score {score}
        </span>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-gradient-to-r from-aws to-smile transition-[width] duration-500" style={{ width: `${(i / ROUND) * 100}%` }} />
      </div>

      <h3 className="mt-6 font-display text-xl font-semibold leading-snug text-white">{q.q}</h3>

      <div className="mt-5 grid gap-2.5">
        {q.opts.map((o, k) => {
          const state = pick === -1 ? '' : o.ok ? 'ok' : k === pick ? 'bad' : 'dim'
          return (
            <button
              key={o.t}
              type="button"
              onClick={() => choose(k)}
              disabled={pick !== -1}
              className={`flex items-center justify-between gap-3 rounded-2xl border px-4 py-3.5 text-left text-[15px] transition-colors ${
                state === 'ok'
                  ? 'border-emerald-400/70 bg-emerald-400/15 text-white'
                  : state === 'bad'
                    ? 'border-rose-400/70 bg-rose-400/15 text-white'
                    : state === 'dim'
                      ? 'border-white/5 text-white/30'
                      : 'border-white/12 bg-white/[0.04] text-white/85 active:bg-aws/20'
              }`}
            >
              {o.t}
              {state === 'ok' && <Check size={18} className="shrink-0 text-emerald-300" />}
              {state === 'bad' && <X size={18} className="shrink-0 text-rose-300" />}
            </button>
          )
        })}
      </div>

      {pick !== -1 && (
        <div className="mt-5">
          <p className="rounded-2xl bg-white/[0.05] p-4 text-sm leading-relaxed text-white/70">{q.why}</p>
          <button type="button" onClick={next} className={`${btnPrimary} mt-4 w-full justify-center`}>
            {i + 1 >= ROUND ? 'See my result' : 'Next question'} <ArrowRight size={16} />
          </button>
        </div>
      )}
    </div>
  )
}

/* ------------------------------- BUILDER ---------------------------------- */
function Builder() {
  const [n, setN] = useState(0)
  const b = BUILDS[n]
  const pool = useMemo(() => shuffle(b.pool), [n])
  const [filled, setFilled] = useState({})
  const [note, setNote] = useState('Tap a service to place it in the architecture.')
  const [shake, setShake] = useState('')
  const timer = useRef(0)
  useEffect(() => () => clearTimeout(timer.current), [])

  const need = b.slots.map((s) => s.id)
  const complete = need.every((id) => filled[id])

  const tap = (id) => {
    if (filled[id]) return
    const s = SERVICES[id]
    if (need.includes(id)) {
      haptic(15)
      const nf = { ...filled, [id]: true }
      setFilled(nf)
      setNote(`✓ ${s.name}: ${s.does}`)
      if (need.every((x) => nf[x])) setTimeout(() => confetti(window.innerWidth / 2, window.innerHeight * 0.4, { count: 110, haptic: true }), 200)
    } else {
      haptic([30, 40, 30])
      setShake(id)
      clearTimeout(timer.current)
      timer.current = setTimeout(() => setShake(''), 450)
      setNote(`✗ ${s.name} is not needed here. ${s.does}`)
    }
  }
  const go = (k) => {
    setN(k)
    setFilled({})
    setNote('Tap a service to place it in the architecture.')
  }

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-4 flex justify-center gap-2">
        {BUILDS.map((x, k) => (
          <button
            key={x.title}
            type="button"
            onClick={() => go(k)}
            aria-label={`Puzzle ${k + 1}`}
            className={`h-2.5 rounded-full transition-all ${k === n ? 'w-8 bg-aws' : 'w-2.5 bg-white/25'}`}
          />
        ))}
      </div>

      <div className="glass rounded-3xl p-5 md:p-8">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-aws-soft">Puzzle {n + 1} / {BUILDS.length}</p>
        <h3 className="mt-2 font-display text-xl font-semibold text-white">{b.title}</h3>
        <p className="mt-1 text-sm text-white/55">{b.brief}</p>

        {/* the architecture: slots in the order traffic flows */}
        <div className="mt-6 flex flex-col items-stretch gap-2">
          <div className="mx-auto rounded-full border border-white/15 px-4 py-1.5 text-xs text-white/60">Visitor</div>
          {b.slots.map((s) => {
            const on = filled[s.id]
            const svc = SERVICES[s.id]
            const Icon = ICONS[svc.icon]
            return (
              <div key={s.id} className="flex flex-col items-center gap-2">
                <span className="h-3 w-px bg-white/25" />
                <div
                  className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 transition-colors duration-500 ${
                    on ? 'border-aws/70 bg-aws/20' : 'border-dashed border-white/20 bg-white/[0.02]'
                  }`}
                >
                  <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${on ? 'bg-aws text-white' : 'bg-white/5 text-white/30'}`}>
                    {on ? <Icon size={18} /> : '?'}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[11px] uppercase tracking-[0.14em] text-white/40">{s.role}</span>
                    <span className={`block text-sm font-semibold ${on ? 'text-white' : 'text-white/25'}`}>{on ? svc.name : 'Choose a service'}</span>
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        <p className="mt-5 min-h-[3.2rem] rounded-2xl bg-white/[0.05] p-3.5 text-sm leading-relaxed text-white/70" aria-live="polite">{note}</p>

        {!complete ? (
          <div className="mt-5 grid grid-cols-2 gap-2.5">
            {pool.map((id) => {
              const s = SERVICES[id]
              const Icon = ICONS[s.icon]
              const used = filled[id]
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => tap(id)}
                  disabled={used}
                  className={`flex items-center gap-2.5 rounded-2xl border px-3 py-3 text-left text-[13px] font-semibold transition-colors ${
                    used ? 'border-white/5 text-white/20' : 'border-white/12 bg-white/[0.04] text-white/85 active:bg-aws/20'
                  } ${shake === id ? 'animate-[shake_.4s]' : ''}`}
                >
                  <Icon size={16} className="shrink-0 text-aws-soft" />
                  {s.name}
                </button>
              )
            })}
          </div>
        ) : (
          <div className="mt-5 text-center">
            <p className="font-display text-lg font-semibold text-emerald-300">Architecture complete!</p>
            <div className="mt-4 flex flex-wrap justify-center gap-3">
              {n + 1 < BUILDS.length ? (
                <button type="button" onClick={() => go(n + 1)} className={btnPrimary}>
                  Next puzzle <ArrowRight size={16} />
                </button>
              ) : (
                <button type="button" onClick={() => go(0)} className={btnPrimary}>
                  <RotateCcw size={16} /> Start again
                </button>
              )}
              <button type="button" onClick={() => navigate('/learn')} className={btnGhost}>
                Learn more AWS
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/* ---------------------------------- PAGE ---------------------------------- */
export default function Play() {
  const [tab, setTab] = useState('quiz')
  return (
    <section id="play" className="relative mx-auto max-w-3xl px-5 pb-10 md:px-8 md:pb-14">
      <SectionHead
        eyebrow="Play"
        title="Test Your Cloud Skills"
        sub="Two quick games: an AWS quiz and an architecture puzzle. Made for a break between classes."
        center
      />

      <div className="mx-auto mt-8 mb-8 flex w-fit rounded-full border border-white/10 bg-white/5 p-1">
        {[['quiz', 'Cloud Quiz'], ['build', 'Build It']].map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => {
              haptic(10)
              setTab(id)
            }}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${tab === id ? 'bg-white text-ink' : 'text-white/60'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'quiz' ? <Quiz /> : <Builder />}
    </section>
  )
}
