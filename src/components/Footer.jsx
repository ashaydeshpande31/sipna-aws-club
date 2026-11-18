import { Heart, MapPin, Mail, BadgeCheck, Terminal as TerminalIcon } from 'lucide-react'
import { LogoLockup } from './ui/LogoMark'
import Socials from './ui/Socials'
import ShareButton from './ui/ShareButton'
import ThemePicker from './ui/ThemePicker'
import InstallButton from './ui/InstallButton'
import { pathForId } from '../lib/routes'
import { navigate } from '../lib/scroll'
import { SITE } from '../data/site'
import { CONTACT } from '../data/contact'

const LINKS = [
  ['About', 'about'],
  ['Events', 'events'],
  ['Upcoming', 'upcoming'],
  ['Team', 'team'],
  ['Learn', 'learn'],
  ['Play', 'play'],
  ['News', 'news'],
  ['FAQ', 'faq'],
  ['Connect', 'connect'],
  ['Join', 'join'],
]

export default function Footer({ onTerminal }) {
  const year = new Date().getFullYear()

  return (
    <footer className="relative z-10 overflow-hidden border-t border-white/10 bg-ink/70 backdrop-blur-sm">

      <div
        aria-hidden="true"
        className="pointer-events-none select-none whitespace-nowrap text-center font-display text-[14vw] font-extrabold leading-none text-transparent"
        style={{ WebkitTextStroke: '1px rgba(140,79,255,0.22)' }}
      >
        SIPNA AWS
      </div>

      <div className="relative mx-auto max-w-7xl px-5 pb-10 pt-4 md:px-8">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr]">

          <div>
            <LogoLockup />
            <p className="mt-3 font-display text-lg font-bold text-white">{SITE.name}</p>

            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/55">
              An AWS Student Builder Group at {SITE.college}.
            </p>

            <p className="mt-4 flex max-w-sm items-start gap-2 text-sm text-white/45">
              <MapPin size={16} className="mt-0.5 shrink-0 text-aws-soft" />
              {SITE.address}
            </p>

            {CONTACT.email && (
              <p className="mt-3 flex max-w-sm items-start gap-2 text-sm text-white/45">
                <Mail size={16} className="mt-0.5 shrink-0 text-aws-soft" />
                <a href={`mailto:${CONTACT.email}`} className="hover:text-white">
                  {CONTACT.email}
                </a>
              </p>
            )}

            <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-aws/30 bg-aws/10 px-3.5 py-1.5 text-xs font-medium text-aws-soft">
              <BadgeCheck size={14} />
              Official AWS Student Builder Group · Sipna COET
            </p>
          </div>

          <nav aria-label="Footer">
            <h4 className="font-mono text-xs uppercase tracking-[0.2em] text-aws-soft">
              Explore
            </h4>

            <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2.5 text-sm">
              {LINKS.map(([label, id]) => (
                <li key={id}>
                  <a
                    href={pathForId(id)}
                    onClick={(e) => {
                      if (
                        e.metaKey ||
                        e.ctrlKey ||
                        e.shiftKey ||
                        e.altKey ||
                        e.button !== 0
                      ) return

                      e.preventDefault()
                      navigate(pathForId(id))
                    }}
                    className="text-white/60 transition-colors hover:text-white"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h4 className="font-mono text-xs uppercase tracking-[0.2em] text-aws-soft">
              Follow us
            </h4>

            <Socials
              links={SITE.links}
              label={SITE.name}
              className="mt-4"
            />

            <ShareButton
              title={SITE.name}
              text={`Check out ${SITE.name}, the AWS Student Builder Group at Sipna COET, Amravati!`}
              label="Share this site"
              className="mt-4"
            />

            <div className="mt-6">
              <p className="mb-2.5 font-mono text-[11px] uppercase tracking-[0.2em] text-white/40">Accent colour</p>
              <ThemePicker />
              <InstallButton className="mt-4" />
            </div>

            <button
              type="button"
              onClick={onTerminal}
              className="group mt-6 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 font-mono text-xs text-white/60 transition-colors hover:border-aws/60 hover:text-white"
            >
              <TerminalIcon size={14} className="text-aws-soft" />
              psst… type
              <span className="rounded bg-aws/25 px-1.5 py-0.5 text-aws-soft">
                aws
              </span>
              anywhere
            </button>
          </div>

        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-white/40 md:flex-row">
          <span>
            © {year} {SITE.name}. All rights reserved.
          </span>

          {SITE.credit && (
            <span className="flex items-center gap-1.5">
              Built with
              <Heart size={12} className="fill-smile text-smile" />
              by {SITE.credit}
            </span>
          )}
        </div>

        <nav aria-label="Legal" className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs">
          {[['privacy', 'Privacy Policy'], ['terms', 'Terms of Use'], ['conduct', 'Code of Conduct']].map(([id, label]) => (
            <a
              key={id}
              href={pathForId(id)}
              onClick={(e) => {
                if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return
                e.preventDefault()
                navigate(pathForId(id))
              }}
              className="text-white/50 transition-colors hover:text-white"
            >
              {label}
            </a>
          ))}
        </nav>

        <p className="mt-4 text-center text-[11px] text-white/30">
          AWS and related marks are trademarks of Amazon.com, Inc. or its affiliates. This is a student community site.
        </p>

      </div>
    </footer>
  )
}