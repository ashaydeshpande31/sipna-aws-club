import { useEffect, useMemo, useRef, useState } from 'react'

// ------------------------------------------------------------
//  Admin page (/admin). Talks to /api/admin, which commits to GitHub.
//  Nothing here is shown on the public site.
// ------------------------------------------------------------

const slug = (s) =>
  String(s || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const IMG_RE = /\.(jpe?g|png|webp)$/i
const VID_RE = /\.(mp4|webm)$/i

async function api(password, body) {
  const res = await fetch('/api/admin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
    body: JSON.stringify(body),
  })
  let data = {}
  try {
    data = await res.json()
  } catch {
    /* not json */
  }
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status}). Is the API deployed?`)
  return data
}

// Shrinks a photo in the browser and returns a JPEG (keeps uploads small and fast).
async function compress(file, maxSide, quality = 0.85) {
  const bmp = await createImageBitmap(file)
  const scale = Math.min(1, maxSide / Math.max(bmp.width, bmp.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bmp.width * scale)
  canvas.height = Math.round(bmp.height * scale)
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.drawImage(bmp, 0, 0, canvas.width, canvas.height)
  const blob = await new Promise((r) => canvas.toBlob(r, 'image/jpeg', quality))
  const base64 = await new Promise((resolve) => {
    const fr = new FileReader()
    fr.onload = () => resolve(String(fr.result).split(',')[1])
    fr.readAsDataURL(blob)
  })
  return { base64, preview: URL.createObjectURL(blob) }
}

const clone = (x) => JSON.parse(JSON.stringify(x))
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b)
const personPhotos = (t) => [t.leader, ...t.core, ...t.members].map((p) => p.photo).filter(Boolean)

// ---------- small UI pieces ----------
const input =
  'w-full rounded-lg border border-white/10 bg-ink-2 px-3 py-2 text-sm text-white outline-none placeholder:text-white/30 focus:border-aws'

function Field({ label, hint, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium uppercase tracking-wider text-white/60">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-white/40">{hint}</span>}
    </label>
  )
}

function Btn({ kind = 'ghost', className = '', ...p }) {
  const styles = {
    primary: 'bg-aws text-white hover:bg-aws-deep disabled:opacity-40',
    ghost: 'border border-white/15 text-white/80 hover:bg-white/5 disabled:opacity-40',
    danger: 'border border-red-400/30 text-red-300 hover:bg-red-500/10 disabled:opacity-40',
  }
  return (
    <button
      type="button"
      {...p}
      className={`rounded-lg px-3 py-2 text-sm font-medium transition ${styles[kind]} ${className}`}
    />
  )
}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 sm:p-8">
      <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-panel p-5 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <button type="button" onClick={onClose} className="text-2xl leading-none text-white/50 hover:text-white">
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

// ---------- login ----------
function Login({ onLogin }) {
  const [pw, setPw] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setErr('')
    try {
      const data = await api(pw, { action: 'load' })
      sessionStorage.setItem('aws-admin-pw', pw)
      onLogin(pw, data)
    } catch (ex) {
      setErr(ex.message)
    }
    setBusy(false)
  }
  return (
    <div className="grid min-h-screen place-items-center p-4">
      <form onSubmit={submit} className="w-full max-w-sm space-y-4 rounded-2xl border border-white/10 bg-panel p-6">
        <h1 className="text-xl font-semibold text-white">Sipna AWS Club admin</h1>
        <Field label="Password">
          <input type="password" autoFocus className={input} value={pw} onChange={(e) => setPw(e.target.value)} />
        </Field>
        {err && <p className="text-sm text-red-300">{err}</p>}
        <Btn kind="primary" type="submit" disabled={busy || !pw} className="w-full">
          {busy ? 'Checking...' : 'Log in'}
        </Btn>
      </form>
    </div>
  )
}

// ---------- team ----------
function PersonRow({ p, url, onEdit, onDelete, onUp, onDown }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-ink-2 p-3">
      {url ? (
        <img src={url} alt="" className="h-12 w-12 rounded-full object-cover" />
      ) : (
        <div className="grid h-12 w-12 place-items-center rounded-full bg-white/10 text-xs text-white/50">
          {(p.name || '?').slice(0, 1)}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium text-white">{p.name || '(no name)'}</div>
        <div className="truncate text-xs text-white/50">
          {p.position} · {p.year}
        </div>
      </div>
      {onUp && (
        <>
          <Btn onClick={onUp} aria-label="Move up">↑</Btn>
          <Btn onClick={onDown} aria-label="Move down">↓</Btn>
        </>
      )}
      <Btn onClick={onEdit}>Edit</Btn>
      {onDelete && <Btn kind="danger" onClick={onDelete}>Delete</Btn>}
    </div>
  )
}

function PersonForm({ draft, setDraft, photoUrl, onPhoto, busy, msg }) {
  const set = (k, v) => setDraft({ ...draft, [k]: v })
  const soc = (k, v) => setDraft({ ...draft, socials: { ...draft.socials, [k]: v } })
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        {photoUrl ? (
          <img src={photoUrl} alt="" className="h-20 w-20 rounded-full object-cover" />
        ) : (
          <div className="grid h-20 w-20 place-items-center rounded-full bg-white/10 text-xs text-white/40">No photo</div>
        )}
        <div>
          <input
            type="file"
            accept="image/*"
            disabled={busy}
            onChange={(e) => e.target.files[0] && onPhoto(e.target.files[0])}
            className="text-sm text-white/70"
          />
          <p className="mt-1 text-xs text-white/40">Square-ish photo works best. It is shrunk automatically.</p>
          {msg && <p className="mt-1 text-xs text-amber-300">{msg}</p>}
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Name">
          <input className={input} value={draft.name} onChange={(e) => set('name', e.target.value)} />
        </Field>
        <Field label="Position" hint="e.g. Technical Lead, Team Member (Design)">
          <input className={input} value={draft.position} onChange={(e) => set('position', e.target.value)} />
        </Field>
        <Field label="Department">
          <input className={input} value={draft.department} onChange={(e) => set('department', e.target.value)} />
        </Field>
        <Field label="Year">
          <input className={input} value={draft.year} onChange={(e) => set('year', e.target.value)} placeholder="3rd Year" />
        </Field>
      </div>
      <Field label="LinkedIn link">
        <input className={input} value={draft.socials.linkedin} onChange={(e) => soc('linkedin', e.target.value)} />
      </Field>
      <Field label="GitHub link">
        <input className={input} value={draft.socials.github} onChange={(e) => soc('github', e.target.value)} />
      </Field>
      <Field label="Instagram link">
        <input className={input} value={draft.socials.instagram} onChange={(e) => soc('instagram', e.target.value)} />
      </Field>
    </div>
  )
}

const BLANK_PERSON = {
  name: '',
  position: 'Team Member',
  department: 'Information Technology',
  year: '2nd Year',
  socials: { linkedin: '', github: '', instagram: '' },
  photo: '',
}

function TeamTab({ data, setData, ctx }) {
  const { urlFor, uploads, addUpload } = ctx
  const [editing, setEditing] = useState(null) // { group, index, draft }
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)
  const t = data.team

  const setTeam = (next) => setData({ ...data, team: next })
  const photoPath = (file) => `src/assets/team/${file}`

  const move = (group, i, d) => {
    const list = [...t[group]]
    const j = i + d
    if (j < 0 || j >= list.length) return
    ;[list[i], list[j]] = [list[j], list[i]]
    setTeam({ ...t, [group]: list })
  }

  const saveDraft = () => {
    const { group, index, draft } = editing
    if (!draft.name.trim()) return setMsg('Please enter a name.')
    if (group === 'leader') setTeam({ ...t, leader: draft })
    else {
      const list = [...t[group]]
      if (index < 0) list.push(draft)
      else list[index] = draft
      setTeam({ ...t, [group]: list })
    }
    setEditing(null)
    setMsg('')
  }

  const onPhoto = async (file) => {
    if (!editing.draft.name.trim()) return setMsg('Type the name first, then choose the photo.')
    setBusy(true)
    setMsg('')
    try {
      const file2 = `${slug(editing.draft.name)}.jpg`
      const img = await compress(file, 900)
      addUpload(photoPath(file2), img)
      setEditing({ ...editing, draft: { ...editing.draft, photo: file2 } })
    } catch {
      setMsg('Could not read that image. Try a JPG or PNG.')
    }
    setBusy(false)
  }

  const onGroupPhoto = async (file) => {
    setBusy(true)
    try {
      addUpload('src/assets/team-photo/team.jpg', await compress(file, 2000, 0.82))
    } catch {
      setMsg('Could not read that image.')
    }
    setBusy(false)
  }

  const Section = ({ title, group, addLabel }) => (
    <section className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-aws-soft">{title}</h3>
        <Btn onClick={() => setEditing({ group, index: -1, draft: clone(BLANK_PERSON) })}>{addLabel}</Btn>
      </div>
      {t[group].map((p, i) => (
        <PersonRow
          key={p.name + i}
          p={p}
          url={p.photo && urlFor(photoPath(p.photo))}
          onEdit={() => setEditing({ group, index: i, draft: clone(p) })}
          onDelete={() => confirm(`Delete ${p.name}?`) && setTeam({ ...t, [group]: t[group].filter((_, k) => k !== i) })}
          onUp={() => move(group, i, -1)}
          onDown={() => move(group, i, 1)}
        />
      ))}
    </section>
  )

  const groupUrl = uploads['src/assets/team-photo/team.jpg']?.preview || urlFor('src/assets/team-photo/team.jpg')

  return (
    <div className="space-y-8">
      <section className="space-y-3 rounded-xl border border-white/10 bg-ink-2 p-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-aws-soft">Group photo banner</h3>
        <img src={groupUrl} alt="" className="h-40 w-full rounded-lg object-cover" onError={(e) => (e.target.style.display = 'none')} />
        <input type="file" accept="image/*" disabled={busy} onChange={(e) => e.target.files[0] && onGroupPhoto(e.target.files[0])} className="text-sm text-white/70" />
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Caption">
            <input className={input} value={t.photo.caption} onChange={(e) => setTeam({ ...t, photo: { ...t.photo, caption: e.target.value } })} />
          </Field>
          <Field label="Date or note (optional)">
            <input className={input} value={t.photo.date} onChange={(e) => setTeam({ ...t, photo: { ...t.photo, date: e.target.value } })} />
          </Field>
        </div>
      </section>

      <section className="space-y-2">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-aws-soft">Club lead</h3>
        <PersonRow p={t.leader} url={t.leader.photo && urlFor(photoPath(t.leader.photo))} onEdit={() => setEditing({ group: 'leader', index: 0, draft: clone(t.leader) })} />
      </section>
      <Section title="Core team" group="core" addLabel="+ Add core member" />
      <Section title="Team members" group="members" addLabel="+ Add member" />

      {editing && (
        <Modal title={editing.index < 0 ? 'Add person' : `Edit ${editing.draft.name || 'person'}`} onClose={() => { setEditing(null); setMsg('') }}>
          <PersonForm
            draft={editing.draft}
            setDraft={(d) => setEditing({ ...editing, draft: d })}
            photoUrl={editing.draft.photo && urlFor(photoPath(editing.draft.photo))}
            onPhoto={onPhoto}
            busy={busy}
            msg={msg}
          />
          <div className="mt-5 flex justify-end gap-2">
            <Btn onClick={() => { setEditing(null); setMsg('') }}>Cancel</Btn>
            <Btn kind="primary" onClick={saveDraft}>Done</Btn>
          </div>
        </Modal>
      )}
    </div>
  )
}

// ---------- events ----------
const BLANK_EVENT = {
  id: '',
  title: '',
  category: 'Workshop',
  date: '',
  description: '',
  participants: 0,
  highlights: [],
  youtube: '',
  instagram: '',
}

function EventForm({ draft, setDraft, isNew, files, ctx, busy, setBusy, msg, setMsg }) {
  const { urlFor, uploads, addUpload, removed, toggleRemoved } = ctx
  const set = (k, v) => setDraft({ ...draft, [k]: v })
  const id = draft.id
  const folder = `src/assets/events/${id}/`
  const existing = files.filter((f) => f.startsWith(folder))
  const pending = Object.keys(uploads).filter((p) => p.startsWith(folder))

  const addPhotos = async (list) => {
    if (!id) return setMsg('Fill in the title first so the event gets an id.')
    setBusy(true)
    setMsg('')
    try {
      const nums = [...existing, ...pending].map((p) => parseInt(p.split('/').pop(), 10)).filter((n) => !Number.isNaN(n))
      let n = Math.max(0, ...nums)
      for (const f of Array.from(list)) {
        n += 1
        addUpload(`${folder}${n}.jpg`, await compress(f, 1600, 0.82))
      }
    } catch {
      setMsg('One of the images could not be read.')
    }
    setBusy(false)
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Title">
          <input
            className={input}
            value={draft.title}
            onChange={(e) => setDraft({ ...draft, title: e.target.value, ...(isNew ? { id: slug(e.target.value) } : {}) })}
          />
        </Field>
        <Field label="Event id" hint={isNew ? 'Made from the title. Cannot change after saving.' : 'Fixed (it names the photo folder).'}>
          <input className={input} value={draft.id} readOnly={!isNew} onChange={(e) => set('id', slug(e.target.value))} />
        </Field>
        <Field label="Category" hint="Launch, Competition, Workshop...">
          <input className={input} value={draft.category} onChange={(e) => set('category', e.target.value)} />
        </Field>
        <Field label="Date" hint="Written as you want it shown, e.g. 12 Dec 2026">
          <input className={input} value={draft.date} onChange={(e) => set('date', e.target.value)} />
        </Field>
      </div>
      <Field label="Description">
        <textarea rows={3} className={input} value={draft.description} onChange={(e) => set('description', e.target.value)} />
      </Field>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Participants" hint="0 hides it">
          <input type="number" min="0" className={input} value={draft.participants} onChange={(e) => set('participants', Math.max(0, parseInt(e.target.value, 10) || 0))} />
        </Field>
        <Field label="YouTube link (optional)">
          <input className={input} value={draft.youtube || ''} onChange={(e) => set('youtube', e.target.value)} />
        </Field>
      </div>
      <Field label="Instagram link (optional)">
        <input className={input} value={draft.instagram || ''} onChange={(e) => set('instagram', e.target.value)} />
      </Field>
      <Field label="Highlights" hint="One per line">
        <textarea
          rows={4}
          className={input}
          value={(draft.highlights || []).join('\n')}
          onChange={(e) => set('highlights', e.target.value.split('\n'))}
        />
      </Field>

      <div className="space-y-2 rounded-xl border border-white/10 bg-ink-2 p-3">
        <div className="text-xs font-medium uppercase tracking-wider text-white/60">Photos</div>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {existing.filter((p) => IMG_RE.test(p)).map((p) => (
            <div key={p} className="relative">
              <img src={urlFor(p)} alt="" className={`h-20 w-full rounded-lg object-cover ${removed.has(p) ? 'opacity-25' : ''}`} />
              <button
                type="button"
                onClick={() => toggleRemoved(p)}
                className="absolute right-1 top-1 rounded bg-black/70 px-1.5 text-xs text-white"
              >
                {removed.has(p) ? 'undo' : '✕'}
              </button>
            </div>
          ))}
          {pending.map((p) => (
            <div key={p} className="relative">
              <img src={uploads[p].preview} alt="" className="h-20 w-full rounded-lg object-cover ring-2 ring-aws" />
              <span className="absolute left-1 top-1 rounded bg-aws px-1.5 text-[10px] text-white">new</span>
            </div>
          ))}
        </div>
        <input type="file" accept="image/*" multiple disabled={busy} onChange={(e) => addPhotos(e.target.files)} className="text-sm text-white/70" />
        {existing.filter((p) => VID_RE.test(p)).map((p) => (
          <div key={p} className="flex items-center justify-between text-xs text-white/60">
            <span>Video: {p.split('/').pop()}</span>
            <button type="button" onClick={() => toggleRemoved(p)} className="text-red-300">
              {removed.has(p) ? 'undo remove' : 'remove video'}
            </button>
          </div>
        ))}
        <p className="text-xs text-white/40">
          Videos are too big to upload here. Use the YouTube link, or add video.mp4 to the event folder with git.
        </p>
      </div>
      {msg && <p className="text-sm text-amber-300">{msg}</p>}
    </div>
  )
}

function EventsTab({ data, setData, ctx }) {
  const [editing, setEditing] = useState(null) // { index, draft }
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')
  const list = data.pastEvents
  const setList = (next) => setData({ ...data, pastEvents: next })

  const move = (i, d) => {
    const next = [...list]
    const j = i + d
    if (j < 0 || j >= next.length) return
    ;[next[i], next[j]] = [next[j], next[i]]
    setList(next)
  }

  const done = () => {
    const d = { ...editing.draft, highlights: (editing.draft.highlights || []).map((h) => h.trim()).filter(Boolean) }
    if (!d.title.trim() || !d.id) return setMsg('A title is needed.')
    if (editing.index < 0 && list.some((e) => e.id === d.id)) return setMsg('An event with this id already exists.')
    const next = [...list]
    if (editing.index < 0) next.push(d)
    else next[editing.index] = d
    setList(next)
    setEditing(null)
    setMsg('')
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-white/60">Shown on the site in this order (oldest first).</p>
        <Btn onClick={() => setEditing({ index: -1, draft: clone(BLANK_EVENT) })}>+ Add past event</Btn>
      </div>
      {list.map((e, i) => (
        <div key={e.id} className="flex items-center gap-3 rounded-xl border border-white/10 bg-ink-2 p-3">
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium text-white">{e.title}</div>
            <div className="truncate text-xs text-white/50">
              {e.category} · {e.date}
            </div>
          </div>
          <Btn onClick={() => move(i, -1)}>↑</Btn>
          <Btn onClick={() => move(i, 1)}>↓</Btn>
          <Btn onClick={() => setEditing({ index: i, draft: clone(e) })}>Edit</Btn>
          <Btn kind="danger" onClick={() => confirm(`Delete "${e.title}" and its photos?`) && setList(list.filter((_, k) => k !== i))}>
            Delete
          </Btn>
        </div>
      ))}
      {editing && (
        <Modal title={editing.index < 0 ? 'Add past event' : 'Edit event'} onClose={() => { setEditing(null); setMsg('') }}>
          <EventForm
            draft={editing.draft}
            setDraft={(d) => setEditing({ ...editing, draft: d })}
            isNew={editing.index < 0}
            files={ctx.assets}
            ctx={ctx}
            busy={busy}
            setBusy={setBusy}
            msg={msg}
            setMsg={setMsg}
          />
          <div className="mt-5 flex justify-end gap-2">
            <Btn onClick={() => { setEditing(null); setMsg('') }}>Cancel</Btn>
            <Btn kind="primary" onClick={done}>Done</Btn>
          </div>
        </Modal>
      )}
    </div>
  )
}

// ---------- upcoming ----------
function UpcomingTab({ data, setData }) {
  const u = data.upcoming
  const set = (k, v) => setData({ ...data, upcoming: { ...u, [k]: v } })
  const local = /\+05:30$/.test(u.date || '') ? u.date.slice(0, 16) : ''
  return (
    <div className="space-y-3">
      <p className="text-sm text-white/60">Fill in the title and date and the countdown appears on the site. Clear everything for "coming soon".</p>
      <Field label="Title">
        <input className={input} value={u.title} onChange={(e) => set('title', e.target.value)} />
      </Field>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Date and time (India time)">
          <input
            type="datetime-local"
            className={input}
            value={local}
            onChange={(e) => set('date', e.target.value ? `${e.target.value}:00+05:30` : '')}
          />
        </Field>
        <Field label="Duration (hours)">
          <input type="number" min="1" className={input} value={u.durationHours} onChange={(e) => set('durationHours', Math.max(1, Number(e.target.value) || 1))} />
        </Field>
      </div>
      <Field label="Venue">
        <input className={input} value={u.venue} onChange={(e) => set('venue', e.target.value)} />
      </Field>
      <Field label="Description">
        <textarea rows={3} className={input} value={u.description} onChange={(e) => set('description', e.target.value)} />
      </Field>
      <Field label="Registration link (Google Form)">
        <input className={input} value={u.registerUrl} onChange={(e) => set('registerUrl', e.target.value)} />
      </Field>
      <Btn kind="danger" onClick={() => setData({ ...data, upcoming: { title: '', date: '', durationHours: 2, venue: '', description: '', registerUrl: '' } })}>
        Clear upcoming event
      </Btn>
    </div>
  )
}

// ---------- shell ----------
function Dashboard({ password, initial, onLogout }) {
  const [server, setServer] = useState(initial) // what is in GitHub right now
  const [data, setData] = useState(() => ({ team: clone(initial.team), pastEvents: clone(initial.pastEvents), upcoming: clone(initial.upcoming) }))
  const [uploads, setUploads] = useState({}) // path -> { base64, preview }
  const [removed, setRemoved] = useState(() => new Set())
  const [tab, setTab] = useState('team')
  const [status, setStatus] = useState({ kind: '', text: '' })
  const [saving, setSaving] = useState(false)
  const uploadsRef = useRef(uploads)
  uploadsRef.current = uploads

  const raw = (path) => `https://raw.githubusercontent.com/${server.repo}/${server.branch}/${path.split('/').map(encodeURIComponent).join('/')}`
  const urlFor = (path) => uploads[path]?.preview || raw(path)
  const addUpload = (path, img) => setUploads((u) => ({ ...u, [path]: img }))
  const toggleRemoved = (p) =>
    setRemoved((s) => {
      const n = new Set(s)
      n.has(p) ? n.delete(p) : n.add(p)
      return n
    })
  const ctx = { urlFor, uploads, addUpload, removed, toggleRemoved, assets: server.assets }

  const changed = useMemo(
    () => ({
      team: !same(data.team, server.team) || Object.keys(uploads).some((p) => /src\/assets\/team(-photo)?\//.test(p)),
      pastEvents: !same(data.pastEvents, server.pastEvents) || Object.keys(uploads).some((p) => p.includes('/events/')) || [...removed].length > 0,
      upcoming: !same(data.upcoming, server.upcoming),
    }),
    [data, server, uploads, removed],
  )
  const dirty = changed.team || changed.pastEvents || changed.upcoming

  useEffect(() => {
    if (!dirty) return
    const warn = (e) => e.preventDefault()
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])

  const discard = () => {
    if (!confirm('Throw away all unsaved changes?')) return
    setData({ team: clone(server.team), pastEvents: clone(server.pastEvents), upcoming: clone(server.upcoming) })
    setUploads({})
    setRemoved(new Set())
  }

  const save = async () => {
    setSaving(true)
    setStatus({ kind: '', text: 'Uploading photos...' })
    try {
      // photos that are no longer used get deleted
      const deletes = new Set(removed)
      const oldRefs = new Set(personPhotos(server.team))
      const newRefs = new Set(personPhotos(data.team))
      for (const f of oldRefs) if (!newRefs.has(f)) deletes.add(`src/assets/team/${f}`)
      const liveIds = new Set(data.pastEvents.map((e) => e.id))
      for (const p of server.assets) {
        const m = p.match(/^src\/assets\/events\/([^/]+)\//)
        if (m && !liveIds.has(m[1])) deletes.add(p)
      }
      // a new event folder must not be deleted just because it did not exist before
      const files = []
      for (const [path, img] of Object.entries(uploads)) {
        if (path.includes('/events/')) {
          const m = path.match(/^src\/assets\/events\/([^/]+)\//)
          if (!liveIds.has(m[1])) continue // event was removed again, skip its photos
        }
        const { sha } = await api(password, { action: 'blob', base64: img.base64 })
        files.push({ path, sha })
        deletes.delete(path)
      }
      // group photo: keep only team.jpg
      if (uploads['src/assets/team-photo/team.jpg']) {
        for (const p of server.assets) if (p.startsWith('src/assets/team-photo/') && p !== 'src/assets/team-photo/team.jpg') deletes.add(p)
      }
      const content = {}
      if (!same(data.team, server.team)) content.team = data.team
      if (!same(data.pastEvents, server.pastEvents)) content.pastEvents = data.pastEvents
      if (!same(data.upcoming, server.upcoming)) content.upcoming = data.upcoming
      const parts = Object.entries(changed).filter(([, v]) => v).map(([k]) => (k === 'pastEvents' ? 'events' : k))
      setStatus({ kind: '', text: 'Publishing...' })
      await api(password, { action: 'commit', message: `update ${parts.join(', ')}`, files, deletes: [...deletes].filter((p) => server.assets.includes(p)), content })
      const fresh = await api(password, { action: 'load' })
      setServer(fresh)
      setData({ team: clone(fresh.team), pastEvents: clone(fresh.pastEvents), upcoming: clone(fresh.upcoming) })
      setUploads({})
      setRemoved(new Set())
      setStatus({ kind: 'ok', text: 'Published. The live site updates in about a minute.' })
    } catch (e) {
      setStatus({ kind: 'err', text: e.message })
    }
    setSaving(false)
  }

  const tabs = [
    ['team', 'Team'],
    ['events', 'Past events'],
    ['upcoming', 'Upcoming event'],
  ]

  return (
    <div className="mx-auto min-h-screen max-w-3xl p-4 pb-32 sm:p-8 sm:pb-32">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-white">Sipna AWS Club admin</h1>
        <div className="flex gap-2">
          <a href="/" className="rounded-lg border border-white/15 px-3 py-2 text-sm text-white/80 hover:bg-white/5">View site</a>
          <Btn onClick={onLogout}>Log out</Btn>
        </div>
      </header>

      <nav className="mb-6 flex gap-2 border-b border-white/10 pb-3">
        {tabs.map(([k, label]) => (
          <button
            key={k}
            type="button"
            onClick={() => setTab(k)}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${tab === k ? 'bg-aws text-white' : 'text-white/60 hover:bg-white/5'}`}
          >
            {label}
          </button>
        ))}
      </nav>

      {tab === 'team' && <TeamTab data={data} setData={setData} ctx={ctx} />}
      {tab === 'events' && <EventsTab data={data} setData={setData} ctx={ctx} />}
      {tab === 'upcoming' && <UpcomingTab data={data} setData={setData} />}

      {(dirty || status.text) && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-ink/95 p-3 backdrop-blur">
          <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
            <p className={`text-sm ${status.kind === 'err' ? 'text-red-300' : status.kind === 'ok' ? 'text-emerald-300' : 'text-white/70'}`}>
              {status.text || 'You have unsaved changes.'}
            </p>
            <div className="flex shrink-0 gap-2">
              {dirty && <Btn onClick={discard} disabled={saving}>Discard</Btn>}
              {dirty && (
                <Btn kind="primary" onClick={save} disabled={saving}>
                  {saving ? 'Saving...' : 'Save & publish'}
                </Btn>
              )}
              {!dirty && !saving && <Btn onClick={() => setStatus({ kind: '', text: '' })}>OK</Btn>}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function Admin() {
  const [session, setSession] = useState(null) // { password, data }
  const [checking, setChecking] = useState(() => !!sessionStorage.getItem('aws-admin-pw'))

  useEffect(() => {
    document.title = 'Admin | Sipna AWS Club'
    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex'
    document.head.appendChild(meta)
    const pw = sessionStorage.getItem('aws-admin-pw')
    if (pw) {
      api(pw, { action: 'load' })
        .then((data) => setSession({ password: pw, data }))
        .catch(() => sessionStorage.removeItem('aws-admin-pw'))
        .finally(() => setChecking(false))
    }
    return () => meta.remove()
  }, [])

  if (checking) return <div className="grid min-h-screen place-items-center text-white/60">Loading...</div>
  if (!session) return <Login onLogin={(password, data) => setSession({ password, data })} />
  return (
    <Dashboard
      password={session.password}
      initial={session.data}
      onLogout={() => {
        sessionStorage.removeItem('aws-admin-pw')
        setSession(null)
      }}
    />
  )
}
