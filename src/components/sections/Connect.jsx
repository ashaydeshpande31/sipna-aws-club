import { useRef, useState } from 'react'
import { ArrowRight, Check, Mail, MapPin } from 'lucide-react'
import { FaWhatsapp, FaInstagram, FaLinkedinIn } from 'react-icons/fa6'
import SectionHead from '../ui/SectionHead'
import { Reveal, Magnetic } from '../ui/motion'
import { SITE } from '../../data/site'
import { CONTACT } from '../../data/contact'
import { btnPrimary } from '../../lib/ui'

const field =
  'w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-base text-white placeholder-white/35 outline-none transition-colors focus:border-aws focus:bg-white/[0.07]'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function QuickLink({ href, icon: Icon, title, text }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition-colors hover:border-aws/50 hover:bg-aws/10"
    >
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-aws/15 text-aws-soft transition-colors group-hover:bg-aws group-hover:text-white">
        <Icon size={18} />
      </span>
      <span className="min-w-0">
        <span className="block font-display text-sm font-semibold text-white">{title}</span>
        <span className="block truncate text-sm text-white/55">{text}</span>
      </span>
    </a>
  )
}

export default function Connect() {
  const [status, setStatus] = useState('idle') // idle | sending | sent | error
  const [error, setError] = useState('')
  const form = useRef(null)
  const { whatsapp, instagram, linkedin } = SITE.links
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(SITE.address)}`

  const submit = async (e) => {
    e.preventDefault()
    if (status === 'sending') return
    const fd = new FormData(form.current)
    const name = String(fd.get('name') || '').trim()
    const email = String(fd.get('email') || '').trim()
    const message = String(fd.get('message') || '').trim()
    if (fd.get('botcheck')) return // hidden field only bots fill in

    if (name.length < 2) return fail('Please tell us your name.')
    if (!EMAIL_RE.test(email)) return fail('Please enter a valid email so we can reply.')
    if (message.length < 10) return fail('Your message is a bit short. Add a few more words.')

    // no key set yet: open the visitor's email app instead (if the club email is known)
    if (!CONTACT.accessKey) {
      if (CONTACT.email) {
        const body = `${message}\n\n${name} (${email})`
        window.location.href = `mailto:${CONTACT.email}?subject=${encodeURIComponent('Message from the website')}&body=${encodeURIComponent(body)}`
        return
      }
      return fail('The form is not switched on yet. Please message us on WhatsApp or Instagram instead.')
    }

    setStatus('sending')
    setError('')
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: CONTACT.accessKey,
          subject: `New message from the ${SITE.name} website`,
          from_name: `${SITE.name} website`,
          name,
          email,
          message,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.success) throw new Error(data.message || 'failed')
      setStatus('sent')
      form.current.reset()
    } catch {
      fail('Could not send right now. Please check your internet and try again, or message us on WhatsApp.')
    }
  }

  function fail(msg) {
    setError(msg)
    setStatus('error')
  }

  return (
    <section id="connect" className="relative mx-auto max-w-6xl px-5 pb-10 md:px-8 md:pb-14">
      <SectionHead
        eyebrow="Connect"
        title="Get In Touch"
        sub="Have a question, an idea, or want to work with us? Send a message and we will get back to you."
        center
      />

      <div className="mt-14 grid gap-6 lg:grid-cols-[1.25fr_1fr]">
        <Reveal y={40}>
          <div className="glass h-full rounded-3xl p-6 md:p-9">
            {status === 'sent' ? (
              <div className="grid min-h-[22rem] place-items-center text-center" role="status">
                <div>
                  <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-smile/15 text-smile">
                    <Check size={26} />
                  </span>
                  <h3 className="mt-5 font-display text-2xl font-bold text-white">Message sent</h3>
                  <p className="mx-auto mt-2 max-w-sm text-white/60">Thank you. We read every message and will reply on your email soon.</p>
                  <button type="button" onClick={() => setStatus('idle')} className="mt-6 text-sm font-semibold text-aws-soft underline-offset-4 hover:text-white hover:underline">
                    Send another message
                  </button>
                </div>
              </div>
            ) : (
              <form ref={form} onSubmit={submit} noValidate className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-white/75">Your name</span>
                    <input name="name" type="text" autoComplete="name" maxLength={80} placeholder="Full name" className={field} />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-white/75">Your email</span>
                    <input name="email" type="email" autoComplete="email" maxLength={120} placeholder="you@example.com" className={field} />
                  </label>
                </div>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-white/75">Message</span>
                  <textarea name="message" rows={6} maxLength={2000} placeholder="How can we help?" className={`${field} resize-y`} />
                </label>
                {/* spam trap: people never see this, bots fill it in */}
                <input name="botcheck" type="text" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

                <div aria-live="polite" className="min-h-[1.25rem] text-sm text-red-300">
                  {status === 'error' && error}
                </div>

                <Magnetic>
                  <button type="submit" disabled={status === 'sending'} className={`${btnPrimary} disabled:opacity-70`}>
                    {status === 'sending' ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Sending...
                      </>
                    ) : (
                      <>
                        Send message
                        <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                  </button>
                </Magnetic>
              </form>
            )}
          </div>
        </Reveal>

        <Reveal y={40} delay={0.1}>
          <div className="glass flex h-full flex-col gap-3 rounded-3xl p-6 md:p-7">
            <h3 className="font-display text-lg font-semibold text-white">Prefer to chat?</h3>
            <p className="-mt-1 mb-2 text-sm text-white/55">The quickest replies usually come on WhatsApp and Instagram.</p>
            {whatsapp && <QuickLink href={whatsapp} icon={FaWhatsapp} title="WhatsApp community" text="Join and ask in the group" />}
            {instagram && <QuickLink href={instagram} icon={FaInstagram} title="Instagram" text="Send us a message" />}
            {linkedin && <QuickLink href={linkedin} icon={FaLinkedinIn} title="LinkedIn" text="Follow the club page" />}
            {CONTACT.email && <QuickLink href={`mailto:${CONTACT.email}`} icon={Mail} title="Email" text={CONTACT.email} />}
            <QuickLink href={mapUrl} icon={MapPin} title="Find us" text={SITE.college} />
          </div>
        </Reveal>
      </div>
    </section>
  )
}
