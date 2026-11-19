import { useState } from 'react'
import { clone, input, Field, Btn, Modal } from './ui.jsx'

// "Site controls": everything that used to be edited in code. Saved into src/data/settings.json
// together with the team / events / upcoming changes, then the site redeploys by itself.

export const DEFAULT_SETTINGS = {
  announcement: { text: '', linkLabel: 'Join now', linkTo: '/join' },
  maintenance: { on: false, message: 'We are updating the website. Please check back in a few minutes.' },
  hiddenPages: [],
  quizOpen: true,
  links: { joinForm: '', whatsapp: '', linkedin: '', github: '', instagram: '' },
  contact: { accessKey: '', email: '' },
  news: [],
}

const PAGES = [
  ['/events', 'Events', 'Past events, photos and winners'],
  ['/upcoming', 'Upcoming', 'Next event and countdown'],
  ['/team', 'Team', 'Meet the team'],
  ['/learn', 'Learn', 'Learning path'],
  ['/connect', 'Connect', 'Contact form'],
  ['/faq', 'FAQ', 'Questions and answers'],
  ['/play', 'Play', 'Quiz and puzzle'],
  ['/news', 'News', 'Official notices'],
]

function Switch({ on, onChange, label, hint }) {
  return (
    <button type="button" role="switch" aria-checked={on} onClick={() => onChange(!on)} className="flex w-full items-center justify-between gap-4 rounded-xl border border-white/10 bg-ink-2 p-3 text-left">
      <span className="min-w-0">
        <span className="block text-sm font-medium text-white">{label}</span>
        {hint && <span className="block text-xs text-white/50">{hint}</span>}
      </span>
      <span className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${on ? 'bg-aws' : 'bg-white/20'}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${on ? 'left-[22px]' : 'left-0.5'}`} />
      </span>
    </button>
  )
}

function Card({ title, note, children }) {
  return (
    <section className="space-y-3 rounded-2xl border border-white/10 bg-panel p-4 sm:p-5">
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-aws-soft">{title}</h3>
        {note && <p className="mt-1 text-xs text-white/50">{note}</p>}
      </div>
      {children}
    </section>
  )
}

const today = () => new Date().toISOString().slice(0, 10)
const BLANK_NEWS = { date: '', kind: 'Update', title: '', text: '', link: '', linkLabel: '' }

export default function Controls({ data, setData }) {
  const s = { ...DEFAULT_SETTINGS, ...data.settings }
  const set = (patch) => setData({ ...data, settings: { ...s, ...patch } })
  const [editing, setEditing] = useState(null) // { index, draft }
  const [msg, setMsg] = useState('')

  const hidden = new Set(s.hiddenPages)
  const togglePage = (p) => {
    const next = new Set(hidden)
    next.has(p) ? next.delete(p) : next.add(p)
    set({ hiddenPages: [...next] })
  }

  const saveNews = () => {
    const d = editing.draft
    if (!d.title.trim()) return setMsg('Please add a title.')
    if (!/^\d{4}-\d{2}-\d{2}$/.test(d.date)) return setMsg('Please pick a date.')
    const item = { date: d.date, kind: d.kind.trim() || 'Update', title: d.title.trim(), text: d.text.trim() }
    if (d.link.trim()) {
      item.link = d.link.trim()
      if (d.linkLabel.trim()) item.linkLabel = d.linkLabel.trim()
    }
    const list = [...s.news]
    if (editing.index < 0) list.push(item)
    else list[editing.index] = item
    list.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0)) // newest first
    set({ news: list })
    setEditing(null)
    setMsg('')
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-white/60">Change anything here, then press <b className="text-white">Save &amp; publish</b> at the bottom. The live site updates in about a minute.</p>

      <Card title="Site status" note="Maintenance mode replaces the whole site with a 'back soon' message. The admin page keeps working.">
        <Switch on={s.maintenance.on} onChange={(v) => set({ maintenance: { ...s.maintenance, on: v } })} label="Maintenance mode" hint={s.maintenance.on ? 'ON: visitors see the back soon screen' : 'OFF: site is live'} />
        <Field label="Message shown to visitors">
          <textarea rows={2} className={input} value={s.maintenance.message} onChange={(e) => set({ maintenance: { ...s.maintenance, message: e.target.value } })} />
        </Field>
      </Card>

      <Card title="Announcement bar" note="The thin bar at the very top of every page. Clear the text to hide it.">
        <Field label="Text">
          <input className={input} maxLength={300} value={s.announcement.text} onChange={(e) => set({ announcement: { ...s.announcement, text: e.target.value } })} />
        </Field>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Button text">
            <input className={input} maxLength={40} value={s.announcement.linkLabel} onChange={(e) => set({ announcement: { ...s.announcement, linkLabel: e.target.value } })} />
          </Field>
          <Field label="Button goes to" hint="A page like /news or /upcoming, or a full https:// link">
            <input className={input} value={s.announcement.linkTo} onChange={(e) => set({ announcement: { ...s.announcement, linkTo: e.target.value.trim() } })} />
          </Field>
        </div>
      </Card>

      <Card title="Pages on or off" note="A page that is switched off disappears from the menus and shows 'page not found'. Home, About, Join and the legal pages always stay.">
        <div className="grid gap-2 sm:grid-cols-2">
          {PAGES.map(([p, label, hint]) => (
            <Switch key={p} on={!hidden.has(p)} onChange={() => togglePage(p)} label={label} hint={hidden.has(p) ? 'Hidden' : hint} />
          ))}
        </div>
        <Switch on={s.quizOpen} onChange={(v) => set({ quizOpen: v })} label="Quiz open for new players" hint={s.quizOpen ? 'Visitors can play' : 'Closed: shows only the leaderboard'} />
      </Card>

      <Card title="Links" note="Leave a link empty to hide its button. Links must start with https://">
        {[
          ['joinForm', 'Join form (Google Form)'],
          ['whatsapp', 'WhatsApp community invite'],
          ['instagram', 'Instagram page'],
          ['linkedin', 'LinkedIn page'],
          ['github', 'GitHub page'],
        ].map(([k, label]) => (
          <Field key={k} label={label}>
            <input className={input} placeholder="https://" value={s.links[k] || ''} onChange={(e) => set({ links: { ...s.links, [k]: e.target.value.trim() } })} />
          </Field>
        ))}
      </Card>

      <Card title="Contact form" note="Where messages from the Connect page go. Get a free key at web3forms.com using the club email.">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Club email (shown on the site)">
            <input type="email" className={input} value={s.contact.email} onChange={(e) => set({ contact: { ...s.contact, email: e.target.value.trim() } })} />
          </Field>
          <Field label="Web3Forms access key">
            <input className={input} value={s.contact.accessKey} onChange={(e) => set({ contact: { ...s.contact, accessKey: e.target.value.trim() } })} />
          </Field>
        </div>
      </Card>

      <Card title="News and notices" note="Shown on the News page, newest first.">
        <Btn onClick={() => setEditing({ index: -1, draft: { ...BLANK_NEWS, date: today() } })}>+ Add news</Btn>
        {s.news.length === 0 && <p className="text-sm text-white/40">No news yet.</p>}
        {s.news.map((n, i) => (
          <div key={n.date + n.title + i} className="flex items-center gap-3 rounded-xl border border-white/10 bg-ink-2 p-3">
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium text-white">{n.title}</div>
              <div className="truncate text-xs text-white/50">
                {n.kind} · {n.date}
              </div>
            </div>
            <Btn onClick={() => setEditing({ index: i, draft: { ...BLANK_NEWS, ...clone(n) } })}>Edit</Btn>
            <Btn kind="danger" onClick={() => confirm(`Delete "${n.title}"?`) && set({ news: s.news.filter((_, k) => k !== i) })}>Delete</Btn>
          </div>
        ))}
      </Card>

      {editing && (
        <Modal title={editing.index < 0 ? 'Add news' : 'Edit news'} onClose={() => { setEditing(null); setMsg('') }}>
          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Date">
                <input type="date" className={input} value={editing.draft.date} onChange={(e) => setEditing({ ...editing, draft: { ...editing.draft, date: e.target.value } })} />
              </Field>
              <Field label="Tag" hint="Notice, Event, Update, Achievement...">
                <input className={input} maxLength={30} value={editing.draft.kind} onChange={(e) => setEditing({ ...editing, draft: { ...editing.draft, kind: e.target.value } })} />
              </Field>
            </div>
            <Field label="Title">
              <input className={input} maxLength={160} value={editing.draft.title} onChange={(e) => setEditing({ ...editing, draft: { ...editing.draft, title: e.target.value } })} />
            </Field>
            <Field label="Text">
              <textarea rows={4} className={input} maxLength={800} value={editing.draft.text} onChange={(e) => setEditing({ ...editing, draft: { ...editing.draft, text: e.target.value } })} />
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Link (optional)" hint="/events or https://...">
                <input className={input} value={editing.draft.link} onChange={(e) => setEditing({ ...editing, draft: { ...editing.draft, link: e.target.value } })} />
              </Field>
              <Field label="Link text">
                <input className={input} value={editing.draft.linkLabel} onChange={(e) => setEditing({ ...editing, draft: { ...editing.draft, linkLabel: e.target.value } })} />
              </Field>
            </div>
            {msg && <p className="text-sm text-amber-300">{msg}</p>}
            <div className="flex justify-end gap-2">
              <Btn onClick={() => { setEditing(null); setMsg('') }}>Cancel</Btn>
              <Btn kind="primary" onClick={saveNews}>Done</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
