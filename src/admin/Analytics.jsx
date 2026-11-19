import { useCallback, useEffect, useState } from 'react'
import { api, Btn } from './ui.jsx'

// Visitor analytics for the admin page. Numbers come from /api/admin (action "stats").
// Everything is anonymous: pages, device types, browsers, countries and sources. No names or IP addresses.

const fmt = (n) => Number(n || 0).toLocaleString('en-IN')
const RANGES = [
  [1, 'Today'],
  [7, '7 days'],
  [30, '30 days'],
  [90, '90 days'],
]
const DEV_LABEL = { mobile: 'Mobile', tablet: 'Tablet', desktop: 'Desktop' }
const DEV_BAR = { mobile: 'bg-aws', tablet: 'bg-white/45', desktop: 'bg-smile' }
const dayLabel = (iso) => new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', timeZone: 'UTC' })
const hourLabel = (h) => `${h % 12 || 12}${h < 12 ? 'am' : 'pm'}`

function Panel({ title, note, children, className = '' }) {
  return (
    <section className={`rounded-2xl border border-white/10 bg-panel p-4 sm:p-5 ${className}`}>
      <h3 className="text-sm font-semibold text-white">{title}</h3>
      {note && <p className="mt-0.5 text-xs text-white/45">{note}</p>}
      <div className="mt-4">{children}</div>
    </section>
  )
}

function Kpi({ label, value, sub, live }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-panel p-4">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-white/55">
        {live && <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />}
        {label}
      </div>
      <div className="mt-1 text-3xl font-bold text-white">{value}</div>
      {sub && <div className="mt-0.5 text-xs text-white/45">{sub}</div>}
    </div>
  )
}

/** A ranked list: name, count, percent and a bar. */
function Ranked({ rows, empty = 'No data yet' }) {
  if (!rows || !rows.length) return <p className="text-sm text-white/40">{empty}</p>
  const max = Math.max(...rows.map((r) => r.count))
  return (
    <ul className="space-y-2.5">
      {rows.map((r) => (
        <li key={r.name}>
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="min-w-0 truncate text-white/85">{r.name}</span>
            <span className="shrink-0 tabular-nums text-white/60">
              {fmt(r.count)} <span className="text-white/40">· {r.pct}%</span>
            </span>
          </div>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-aws" style={{ width: `${Math.max(2, (r.count / max) * 100)}%` }} />
          </div>
        </li>
      ))}
    </ul>
  )
}

/** Simple column chart. items: [{label, value, title}] */
function Columns({ items, labelEvery = 1 }) {
  const max = Math.max(1, ...items.map((i) => i.value))
  return (
    <div>
      <div className="flex h-36 items-end gap-[3px]" role="img" aria-label="Column chart">
        {items.map((i, k) => (
          <div key={k} className="group relative flex h-full min-w-0 flex-1 items-end" title={i.title}>
            <div className="w-full rounded-t bg-aws/80 transition-colors group-hover:bg-aws" style={{ height: `${i.value ? Math.max(3, (i.value / max) * 100) : 0}%` }} />
          </div>
        ))}
      </div>
      <div className="mt-1.5 flex gap-[3px] text-[10px] text-white/45">
        {items.map((i, k) => (
          <div key={k} className="min-w-0 flex-1 truncate text-center">
            {k % labelEvery === 0 ? i.label : ''}
          </div>
        ))}
      </div>
      <p className="mt-1 text-right text-[11px] text-white/35">Tallest column: {fmt(max)}</p>
    </div>
  )
}

function DeviceSplit({ devices }) {
  const total = devices.reduce((s, d) => s + d.visitors, 0)
  return (
    <div>
      <div className="flex h-4 overflow-hidden rounded-full bg-white/10" role="img" aria-label="Visitors by device">
        {devices.map((d) => (
          <div key={d.name} className={DEV_BAR[d.name]} style={{ width: `${total ? d.pct : 0}%` }} title={`${DEV_LABEL[d.name]} ${d.pct}%`} />
        ))}
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        {devices.map((d) => (
          <div key={d.name} className="rounded-xl bg-ink-2 p-3">
            <div className="flex items-center gap-1.5 text-xs text-white/60">
              <span className={`h-2.5 w-2.5 rounded-sm ${DEV_BAR[d.name]}`} />
              {DEV_LABEL[d.name]}
            </div>
            <div className="mt-1 text-2xl font-bold text-white">{d.pct}%</div>
            <div className="text-[11px] leading-tight text-white/45">
              {fmt(d.visitors)} visitors
              <br />
              {fmt(d.views)} page views
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function PagesTable({ pages }) {
  if (!pages.length) return <p className="text-sm text-white/40">No page views yet</p>
  const max = pages[0].views
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[480px] text-sm">
        <thead>
          <tr className="text-left text-[11px] uppercase tracking-wider text-white/45">
            <th className="pb-2 font-medium">Page</th>
            <th className="pb-2 text-right font-medium">Views</th>
            <th className="pb-2 text-right font-medium">Share</th>
            <th className="pb-2 pl-4 font-medium">Mobile / Tablet / Desktop</th>
          </tr>
        </thead>
        <tbody>
          {pages.map((p) => {
            const t = p.mobile + p.tablet + p.desktop || 1
            const m = Math.round((p.mobile / t) * 100)
            const tb = Math.round((p.tablet / t) * 100)
            const d = Math.max(0, 100 - m - tb)
            return (
              <tr key={p.path} className="border-t border-white/5">
                <td className="py-2 pr-2">
                  <div className="text-white/90">{p.name}</div>
                  <div className="mt-1 h-1 w-24 overflow-hidden rounded-full bg-white/10 sm:w-40">
                    <div className="h-full rounded-full bg-aws" style={{ width: `${(p.views / max) * 100}%` }} />
                  </div>
                </td>
                <td className="py-2 text-right tabular-nums text-white/85">{fmt(p.views)}</td>
                <td className="py-2 text-right tabular-nums text-white/60">{p.pct}%</td>
                <td className="py-2 pl-4">
                  <div className="flex h-2 w-28 overflow-hidden rounded-full bg-white/10 sm:w-36">
                    <div className="bg-aws" style={{ width: `${m}%` }} />
                    <div className="bg-white/45" style={{ width: `${tb}%` }} />
                    <div className="bg-smile" style={{ width: `${d}%` }} />
                  </div>
                  <div className="mt-0.5 text-[11px] tabular-nums text-white/50">
                    {m}% / {tb}% / {d}%
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function SetupCard() {
  return (
    <div className="rounded-2xl border border-amber-300/30 bg-amber-300/5 p-5 text-sm leading-relaxed text-white/80">
      <h3 className="text-base font-semibold text-amber-200">One-time setup: connect the free database</h3>
      <p className="mt-2">Visitor numbers are stored in a free Upstash Redis database (the same one the quiz leaderboard uses).</p>
      <ol className="mt-3 list-decimal space-y-1.5 pl-5">
        <li>Open your project on vercel.com, then the <b>Storage</b> tab.</li>
        <li>Choose <b>Create Database</b>, then <b>Upstash for Redis</b>, free plan, and connect it to this project (all environments).</li>
        <li>Open <b>Deployments</b>, press the three dots on the latest one, and choose <b>Redeploy</b>.</li>
      </ol>
      <p className="mt-3 text-white/60">Counting starts from that moment. Nothing is lost for visitors if this is not done: the site works the same.</p>
    </div>
  )
}

export default function Analytics({ password, flags }) {
  const [days, setDays] = useState(7)
  const [data, setData] = useState(null)
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)
  const [at, setAt] = useState(null)

  const load = useCallback(
    async (quiet) => {
      if (!quiet) setLoading(true)
      setErr('')
      try {
        setData(await api(password, { action: 'stats', days }))
        setAt(new Date())
      } catch (e) {
        setErr(e.message)
      }
      setLoading(false)
    },
    [password, days],
  )

  useEffect(() => {
    load(false)
    const id = setInterval(() => !document.hidden && load(true), 60000)
    return () => clearInterval(id)
  }, [load])

  const header = (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <div className="flex gap-1.5 rounded-xl bg-ink-2 p-1">
        {RANGES.map(([d, label]) => (
          <button
            key={d}
            type="button"
            onClick={() => setDays(d)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${days === d ? 'bg-aws text-white' : 'text-white/60 hover:text-white'}`}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-3 text-xs text-white/45">
        {at && <span>Updated {at.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })}</span>}
        <Btn onClick={() => load(false)} disabled={loading}>{loading ? 'Loading...' : 'Refresh'}</Btn>
      </div>
    </div>
  )

  if (flags && flags.redis === false) return <SetupCard />
  if (err) return <p className="rounded-xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-200">{err}</p>
  if (!data) return <p className="text-white/60">Loading visitor numbers...</p>
  if (data.configured === false) return <SetupCard />

  const t = data.totals
  const newPct = t.visitors ? Math.round((t.newVisitors / t.visitors) * 100) : 0
  const daily =
    data.range === 1
      ? data.hours.map((v, h) => ({ label: hourLabel(h), value: v, title: `${hourLabel(h)}: ${fmt(v)} page views` }))
      : data.days.map((d) => ({ label: dayLabel(d.date), value: d.pv, title: `${dayLabel(d.date)}: ${fmt(d.pv)} page views, ${fmt(d.visitors)} visitors` }))
  const every = data.range === 1 ? 3 : data.range <= 7 ? 1 : data.range <= 30 ? 5 : 15

  return (
    <div className="space-y-5">
      {header}
      {t.views === 0 && (
        <p className="rounded-xl border border-white/10 bg-ink-2 p-4 text-sm text-white/60">
          No visits recorded for this period yet. Open the live site on your phone, then press Refresh. (Your own visits from this browser are not counted while you are logged in here.)
        </p>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="Online now" value={fmt(data.online)} sub="active in the last 5 minutes" live />
        <Kpi label="Visitors" value={fmt(t.visitors)} sub="unique people" />
        <Kpi label="Page views" value={fmt(t.views)} sub={`${t.perVisit} pages per visit`} />
        <Kpi label="Visits" value={fmt(t.sessions)} sub={`${newPct}% new · ${100 - newPct}% returning`} />
      </div>

      <Panel title={data.range === 1 ? 'Page views by hour (India time)' : 'Page views per day'} note="Hover or tap a column for the exact numbers.">
        <Columns items={daily} labelEvery={every} />
      </Panel>

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="Mobile vs desktop" note="Share of unique visitors by device type.">
          <DeviceSplit devices={data.devices} />
        </Panel>
        <Panel title="Where visitors come from" note="First thing that brought them: a link, an app or typing the address.">
          <Ranked rows={data.sources} />
        </Panel>
      </div>

      <Panel title="Where people go: pages" note="Views per page, and how each page splits between phones, tablets and computers.">
        <PagesTable pages={data.pages} />
      </Panel>

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="First page of a visit" note="The page people land on first.">
          <Ranked rows={data.entries} />
        </Panel>
        <Panel title="Where they go next" note="Most common moves from one page to another.">
          {data.flows.length ? (
            <ul className="space-y-2">
              {data.flows.map((f, i) => (
                <li key={i} className="flex items-center justify-between gap-3 text-sm">
                  <span className="min-w-0 truncate text-white/85">
                    {f.from} <span className="text-aws-soft">→</span> {f.to}
                  </span>
                  <span className="shrink-0 tabular-nums text-white/60">{fmt(f.count)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-white/40">No data yet</p>
          )}
        </Panel>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Panel title="Phone / computer system">
          <Ranked rows={data.os} />
        </Panel>
        <Panel title="Browser" note="Instagram app = opened inside Instagram.">
          <Ranked rows={data.browsers} />
        </Panel>
        <Panel title="Countries">
          <Ranked rows={data.countries} />
        </Panel>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="Indian states" note="Only for visitors from India.">
          <Ranked rows={data.states} />
        </Panel>
        <Panel title="Actions" note="What visitors do besides reading.">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-ink-2 p-3">
              <div className="text-2xl font-bold text-white">{fmt(data.events.quizDone)}</div>
              <div className="text-xs text-white/50">quizzes finished</div>
            </div>
            <div className="rounded-xl bg-ink-2 p-3">
              <div className="text-2xl font-bold text-white">{fmt(data.events.installs)}</div>
              <div className="text-xs text-white/50">app installs</div>
            </div>
          </div>
          <h4 className="mb-2 mt-4 text-xs font-medium uppercase tracking-wider text-white/55">Clicks to other sites</h4>
          <Ranked rows={data.events.outbound} empty="No clicks yet" />
        </Panel>
      </div>

      <p className="text-center text-xs text-white/35">
        Counts are anonymous (no names, no IP addresses) and skip visitors who send "Do Not Track". Days follow India time.
      </p>
    </div>
  )
}
