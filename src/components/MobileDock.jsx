import { useEffect, useState } from 'react'
import {
  Home,
  CalendarDays,
  Sparkles,
  Users,
  LayoutGrid,
  Info,
  Compass,
  GraduationCap,
  Mail,
  CircleHelp,
  Gamepad2,
  ArrowRight,
  X,
} from 'lucide-react'
import { navigate } from '../lib/scroll'
import { haptic } from '../lib/haptic'
import ThemePicker from './ui/ThemePicker'
import InstallButton from './ui/InstallButton'
import { useRoute } from '../lib/useRoute'
import LogoMark from './ui/LogoMark'
import { SITE } from '../data/site'

// Phones only: a slim top bar (logo + Join) and an app-style bottom tab bar, like the Coders Club site.
const TABS = [
  { to: '/', label: 'Home', Icon: Home },
  { to: '/events', label: 'Events', Icon: CalendarDays },
  { to: '/upcoming', label: 'Upcoming', Icon: Sparkles },
  { to: '/team', label: 'Team', Icon: Users },
]
const MORE = [
  { to: '/about', label: 'About', Icon: Info },
  { to: '/journey', label: 'Journey', Icon: Compass },
  { to: '/play', label: 'Play', Icon: Gamepad2 },
  { to: '/learn', label: 'Learn', Icon: GraduationCap },
  { to: '/connect', label: 'Connect', Icon: Mail },
  { to: '/faq', label: 'FAQ', Icon: CircleHelp },
]

const go = (url) => (e) => {
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return
  e.preventDefault()
  haptic(8)
  navigate(url)
}

export default function MobileDock() {
  const path = useRoute()
  const [open, setOpen] = useState(false)
  const moreActive = MORE.some((m) => m.to === path) || path === '/join'

  // close the sheet whenever the page changes, or on Esc
  useEffect(() => setOpen(false), [path])
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <div className="md:hidden">
      {/* top bar */}
      <div className="fixed inset-x-0 top-[var(--ann,0px)] z-[65] flex items-center justify-between border-b border-white/[0.07] bg-ink/90 px-4 pb-2 pt-[max(0.5rem,env(safe-area-inset-top))]">
        <a href="/" onClick={go('/')} className="flex items-center gap-2" aria-label={`${SITE.name} home`}>
          <LogoMark className="h-7 w-7" />
          <span className="font-display text-[15px] font-semibold tracking-tight text-white">{SITE.name}</span>
        </a>
        <a
          href="/join"
          onClick={go('/join')}
          className="flex items-center gap-1 rounded-full bg-white px-3.5 py-1.5 text-xs font-semibold text-ink"
        >
          Join <ArrowRight size={13} />
        </a>
      </div>

      {/* "More" sheet */}
      {open && (
        <>
          <button
            type="button"
            aria-label="Close menu"
            className="fixed inset-0 z-[66] bg-black/60"
            onClick={() => setOpen(false)}
          />
          <div className="fixed inset-x-3 bottom-[calc(4.9rem+env(safe-area-inset-bottom))] z-[67] rounded-3xl border border-aws/30 bg-[#120a24] p-4 shadow-[0_20px_60px_-10px_rgba(0,0,0,0.9)]">
            <div className="mb-3 flex items-center justify-between px-1">
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/45">More pages</span>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="p-1 text-white/60">
                <X size={16} />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {MORE.map(({ to, label, Icon }) => (
                <a
                  key={to}
                  href={to}
                  onClick={go(to)}
                  aria-current={path === to ? 'page' : undefined}
                  className={`flex flex-col items-center gap-1.5 rounded-2xl border py-3.5 text-[12px] font-semibold ${
                    path === to ? 'border-aws/60 bg-aws/20 text-white' : 'border-white/10 bg-white/[0.04] text-white/75'
                  }`}
                >
                  <Icon size={20} />
                  {label}
                </a>
              ))}
              <a
                href="/join"
                onClick={go('/join')}
                className="flex flex-col items-center gap-1.5 rounded-2xl bg-white py-3.5 text-[12px] font-bold text-ink"
              >
                <ArrowRight size={20} />
                Join Club
              </a>
            </div>
            <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/10 pt-3.5 px-1">
              <ThemePicker />
              <InstallButton />
            </div>
          </div>
        </>
      )}

      {/* bottom tab bar */}
      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-[68] flex items-stretch justify-around rounded-t-[22px] border-t border-white/10 bg-ink/95 px-2 pt-1.5 pb-[calc(0.4rem+env(safe-area-inset-bottom))]"
      >
        {TABS.map(({ to, label, Icon }) => {
          const on = path === to
          return (
            <a
              key={to}
              href={to}
              onClick={go(to)}
              aria-current={on ? 'page' : undefined}
              className={`flex flex-1 flex-col items-center gap-0.5 py-1 text-[11px] font-semibold ${on ? 'text-white' : 'text-white/50'}`}
            >
              <span className={`grid h-8 w-14 place-items-center rounded-xl border ${on ? 'border-aws/60 bg-gradient-to-br from-aws/45 to-smile/20' : 'border-transparent'}`}>
                <Icon size={20} />
              </span>
              {label}
            </a>
          )
        })}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className={`flex flex-1 flex-col items-center gap-0.5 py-1 text-[11px] font-semibold ${moreActive || open ? 'text-white' : 'text-white/50'}`}
        >
          <span className={`grid h-8 w-14 place-items-center rounded-xl border ${moreActive || open ? 'border-aws/60 bg-gradient-to-br from-aws/45 to-smile/20' : 'border-transparent'}`}>
            <LayoutGrid size={20} />
          </span>
          More
        </button>
      </nav>
    </div>
  )
}
