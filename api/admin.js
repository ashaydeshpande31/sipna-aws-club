// Vercel serverless function behind the /admin page.
// It checks the admin password, then reads / commits files in the GitHub repo.
// Every commit triggers a normal Vercel redeploy, so the site updates itself.
//
// Environment variables (Vercel > Project > Settings > Environment Variables):
//   ADMIN_PASSWORD   the password for /admin
//   GITHUB_TOKEN     fine-grained token, this repo only, "Contents: Read and write" (needed to edit the site)
//   Upstash Redis    (Vercel > Storage) powers visitor analytics and the quiz leaderboard tools
//   GITHUB_REPO      optional, default ashaydeshpande31/sipna-aws-club
//   GITHUB_BRANCH    optional, default main

import crypto from 'node:crypto'
import { redis, redisReady, istDay } from './_redis.js'

const REPO = process.env.GITHUB_REPO || 'ashaydeshpande31/sipna-aws-club'
const BRANCH = process.env.GITHUB_BRANCH || 'main'

const JSON_FILES = {
  team: 'src/data/team.json',
  pastEvents: 'src/data/pastEvents.json',
  upcoming: 'src/data/upcoming.json',
  settings: 'src/data/settings.json',
}
const OPTIONAL = new Set(['settings']) // missing on the very first load: the admin starts from defaults

const IMG = 'jpg|jpeg|png|webp'
const PATH_RULES = [
  new RegExp(`^src/assets/(team|team-photo|winners)/[a-z0-9][a-z0-9._-]*\\.(${IMG})$`, 'i'),
  new RegExp(`^src/assets/events/[a-z0-9][a-z0-9-]*/[\\w][\\w .()-]*\\.(${IMG}|mp4|webm)$`, 'i'),
]
const okPath = (p) => typeof p === 'string' && !p.includes('..') && PATH_RULES.some((r) => r.test(p))

function sameText(a, b) {
  const x = crypto.createHash('sha256').update(String(a)).digest()
  const y = crypto.createHash('sha256').update(String(b)).digest()
  return crypto.timingSafeEqual(x, y)
}

async function gh(path, options = {}) {
  const res = await fetch(`https://api.github.com/repos/${REPO}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'sipna-aws-club-admin',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    },
  })
  const text = await res.text()
  let data = {}
  try {
    data = text ? JSON.parse(text) : {}
  } catch {
    data = { raw: text }
  }
  if (!res.ok) {
    const err = new Error(data.message || `GitHub error ${res.status}`)
    err.status = res.status
    throw err
  }
  return data
}

async function headTree() {
  const ref = await gh(`/git/ref/heads/${BRANCH}`)
  const commit = await gh(`/git/commits/${ref.object.sha}`)
  return { commitSha: ref.object.sha, treeSha: commit.tree.sha }
}

async function load() {
  const { treeSha } = await headTree()
  const tree = await gh(`/git/trees/${treeSha}?recursive=1`)
  const entries = tree.tree || []
  const content = {}
  for (const [key, path] of Object.entries(JSON_FILES)) {
    const entry = entries.find((e) => e.path === path)
    if (!entry) {
      if (OPTIONAL.has(key)) {
        content[key] = null
        continue
      }
      throw new Error(`${path} not found in the repo`)
    }
    const blob = await gh(`/git/blobs/${entry.sha}`)
    content[key] = JSON.parse(Buffer.from(blob.content, 'base64').toString('utf8'))
  }
  const assets = entries
    .filter((e) => e.type === 'blob' && e.path.startsWith('src/assets/'))
    .map((e) => e.path)
  return { ...content, assets, repo: REPO, branch: BRANCH }
}

function checkContent(c) {
  if (c.team) {
    const t = c.team
    if (!t.leader || !Array.isArray(t.core) || !Array.isArray(t.members)) throw new Error('team data is not valid')
  }
  if (c.pastEvents) {
    if (!Array.isArray(c.pastEvents)) throw new Error('events data is not valid')
    const seen = new Set()
    for (const e of c.pastEvents) {
      if (!/^[a-z0-9][a-z0-9-]*$/.test(e.id || '')) throw new Error(`bad event id: ${e.id}`)
      if (seen.has(e.id)) throw new Error(`duplicate event id: ${e.id}`)
      seen.add(e.id)
    }
  }
  if (c.upcoming && (typeof c.upcoming !== 'object' || Array.isArray(c.upcoming))) throw new Error('upcoming data is not valid')
  if (c.settings) checkSettings(c.settings)
}

const HIDEABLE = ['/events', '/upcoming', '/team', '/learn', '/connect', '/faq', '/play', '/news']
const str = (v, max, what) => {
  if (typeof v !== 'string' || v.length > max) throw new Error(`${what} is not valid`)
  return v
}
function checkSettings(s) {
  if (typeof s !== 'object' || Array.isArray(s)) throw new Error('settings are not valid')
  const a = s.announcement || {}
  str(a.text, 300, 'announcement text')
  str(a.linkLabel, 40, 'announcement button')
  if (!/^(|\/[a-z0-9\-/]*|https?:\/\/\S+)$/i.test(str(a.linkTo, 300, 'announcement link'))) throw new Error('announcement link must be a page like /news or a full https:// link')
  str(s.maintenance?.message, 300, 'maintenance message')
  if (typeof s.maintenance?.on !== 'boolean' || typeof s.quizOpen !== 'boolean') throw new Error('settings switches are not valid')
  if (!Array.isArray(s.hiddenPages) || s.hiddenPages.some((p) => !HIDEABLE.includes(p))) throw new Error('page list is not valid')
  for (const k of ['joinForm', 'whatsapp', 'linkedin', 'github', 'instagram']) {
    if (!/^(|https?:\/\/\S+)$/i.test(str(s.links?.[k], 400, `${k} link`))) throw new Error(`${k} link must start with https://`)
  }
  if (!/^(|[^\s@]+@[^\s@]+\.[^\s@]+)$/.test(str(s.contact?.email, 120, 'email'))) throw new Error('email is not valid')
  str(s.contact?.accessKey, 80, 'access key')
  if (!Array.isArray(s.news) || s.news.length > 100) throw new Error('news is not valid')
  for (const n of s.news) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(n.date || '')) throw new Error('every news item needs a date')
    if (!str(n.title, 160, 'news title').trim()) throw new Error('every news item needs a title')
    str(n.text, 800, 'news text')
    str(n.kind, 30, 'news tag')
    for (const k of ['link', 'linkLabel']) if (n[k] != null) str(n[k], 300, `news ${k}`)
  }
}

// ---------- visitor analytics ----------
const IN_STATES = { AN: 'Andaman & Nicobar', AP: 'Andhra Pradesh', AR: 'Arunachal Pradesh', AS: 'Assam', BR: 'Bihar', CH: 'Chandigarh', CG: 'Chhattisgarh', DN: 'Dadra & Nagar Haveli and Daman & Diu', DD: 'Daman & Diu', DL: 'Delhi', GA: 'Goa', GJ: 'Gujarat', HR: 'Haryana', HP: 'Himachal Pradesh', JK: 'Jammu & Kashmir', JH: 'Jharkhand', KA: 'Karnataka', KL: 'Kerala', LA: 'Ladakh', LD: 'Lakshadweep', MP: 'Madhya Pradesh', MH: 'Maharashtra', MN: 'Manipur', ML: 'Meghalaya', MZ: 'Mizoram', NL: 'Nagaland', OR: 'Odisha', OD: 'Odisha', PY: 'Puducherry', PB: 'Punjab', RJ: 'Rajasthan', SK: 'Sikkim', TN: 'Tamil Nadu', TS: 'Telangana', TG: 'Telangana', TR: 'Tripura', UP: 'Uttar Pradesh', UT: 'Uttarakhand', UK: 'Uttarakhand', WB: 'West Bengal' }
let regionNames
try {
  regionNames = new Intl.DisplayNames(['en'], { type: 'region' })
} catch {
  regionNames = null
}
const countryName = (c) => {
  try {
    return (regionNames && regionNames.of(c)) || c
  } catch {
    return c
  }
}
const PATH_LABEL = { '/': 'Home', '/about': 'About', '/events': 'Events', '/upcoming': 'Upcoming', '/team': 'Team', '/learn': 'Learn', '/connect': 'Connect', '/faq': 'FAQ', '/play': 'Play (quiz)', '/news': 'News', '/privacy': 'Privacy', '/terms': 'Terms', '/conduct': 'Conduct', '/join': 'Join', '/other': 'Missing page (404)' }
const pathName = (p) => PATH_LABEL[p] || p

const toObj = (flat) => {
  const o = {}
  if (Array.isArray(flat)) for (let i = 0; i < flat.length; i += 2) o[flat[i]] = Number(flat[i + 1]) || 0
  return o
}
const pct = (n, total) => (total ? Math.round((n / total) * 1000) / 10 : 0)

async function stats(rawDays) {
  if (!redisReady()) return { configured: false }
  const n = Math.min(90, Math.max(1, parseInt(rawDays, 10) || 7))
  const now = Date.now()
  const keys = []
  for (let i = n - 1; i >= 0; i--) keys.push(istDay(now - i * 86400000))
  const DEV = ['mobile', 'tablet', 'desktop']
  const r = await redis([
    ...keys.map((k) => ['HGETALL', `aws:s:${k}`]),
    ...keys.map((k) => ['PFCOUNT', `aws:u:${k}`]),
    ['PFCOUNT', ...keys.map((k) => `aws:u:${k}`)],
    ...DEV.map((d) => ['PFCOUNT', ...keys.map((k) => `aws:u:${k}:${d}`)]),
    ['ZREMRANGEBYSCORE', 'aws:live', '-inf', String(now - 300000)],
    ['ZCARD', 'aws:live'],
  ])
  const tot = {}
  const days = keys.map((date, i) => {
    const h = toObj(r[i])
    let pv = 0
    for (const [f, v] of Object.entries(h)) {
      tot[f] = (tot[f] || 0) + v
      if (f.startsWith('p:')) pv += v
    }
    return { date, pv, visitors: Number(r[n + i]) || 0, sessions: h.sess || 0 }
  })
  const visitors = Number(r[2 * n]) || 0
  const devVisitors = Object.fromEntries(DEV.map((d, i) => [d, Number(r[2 * n + 1 + i]) || 0]))
  const online = Number(r[2 * n + 5]) || 0

  const group = (prefix, label = (x) => x, limit = 12) => {
    const rows = Object.entries(tot)
      .filter(([f]) => f.startsWith(prefix))
      .map(([f, v]) => ({ name: label(f.slice(prefix.length)), count: v }))
      .sort((a, b) => b.count - a.count)
    const sum = rows.reduce((s, x) => s + x.count, 0)
    return rows.slice(0, limit).map((x) => ({ ...x, pct: pct(x.count, sum) }))
  }

  const pageViews = Object.entries(tot).filter(([f]) => f.startsWith('p:')).reduce((s, [, v]) => s + v, 0)
  const pages = Object.entries(tot)
    .filter(([f]) => f.startsWith('p:'))
    .map(([f, v]) => {
      const p = f.slice(2)
      return { path: p, name: pathName(p), views: v, pct: pct(v, pageViews), mobile: tot[`pd:${p}:mobile`] || 0, tablet: tot[`pd:${p}:tablet`] || 0, desktop: tot[`pd:${p}:desktop`] || 0 }
    })
    .sort((a, b) => b.views - a.views)

  const sessions = tot.sess || 0
  const devSessions = Object.fromEntries(DEV.map((d) => [d, tot[`ss:${d}`] || 0]))
  const devViews = Object.fromEntries(DEV.map((d) => [d, pages.reduce((s, p) => s + p[d], 0)]))
  const sumVisitors = DEV.reduce((s, d) => s + devVisitors[d], 0)
  const devices = DEV.map((d) => ({ name: d, visitors: devVisitors[d], pct: pct(devVisitors[d], sumVisitors), sessions: devSessions[d], views: devViews[d], viewsPct: pct(devViews[d], pageViews) }))

  const flows = Object.entries(tot)
    .filter(([f]) => f.startsWith('fl:'))
    .map(([f, v]) => {
      const [from, to] = f.slice(3).split('>')
      return { from: pathName(from), to: pathName(to), count: v }
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  const hours = Array.from({ length: 24 }, (_, h) => tot[`h:${h}`] || 0)
  const newVisitors = Math.min(tot.newv || 0, visitors)

  return {
    configured: true,
    range: n,
    online,
    totals: { views: pageViews, visitors, sessions, newVisitors, returning: Math.max(0, visitors - newVisitors), perVisit: sessions ? Math.round((pageViews / sessions) * 10) / 10 : 0 },
    days,
    hours,
    pages,
    devices,
    os: group('os:'),
    browsers: group('b:'),
    sources: group('ref:'),
    countries: group('c:', countryName),
    states: group('r:', (c) => IN_STATES[c] || c),
    entries: group('en:', pathName),
    flows,
    events: { quizDone: tot['ev:quiz_done'] || 0, installs: tot['ev:install'] || 0, outbound: group('out:', (x) => x, 10) },
  }
}

// ---------- quiz leaderboard tools ----------
const BOARD = 'aws:quiz:board'
const NAMES = 'aws:quiz:names'
async function board() {
  if (!redisReady()) return { configured: false, rows: [] }
  const [flat, count] = await redis([['ZREVRANGE', BOARD, 0, 99, 'WITHSCORES'], ['SCARD', NAMES]])
  const rows = []
  for (let i = 0; i < (flat || []).length; i += 2) {
    const key = String(flat[i])
    rows.push({ key, name: key.slice(key.indexOf('|') + 1), score: Math.floor(Number(flat[i + 1]) / 1e10) })
  }
  return { configured: true, rows, players: Number(count) || 0 }
}

async function commit({ message, files = [], deletes = [], content = {} }) {
  if (!files.length && !deletes.length && !Object.keys(content).length) throw new Error('nothing to save')
  checkContent(content)
  const entries = []
  for (const f of files) {
    if (!okPath(f.path) || !/^[0-9a-f]{40}$/.test(f.sha || '')) throw new Error(`file not allowed: ${f.path}`)
    entries.push({ path: f.path, mode: '100644', type: 'blob', sha: f.sha })
  }
  for (const p of deletes) {
    if (!okPath(p)) throw new Error(`delete not allowed: ${p}`)
    entries.push({ path: p, mode: '100644', type: 'blob', sha: null })
  }
  for (const [key, value] of Object.entries(content)) {
    if (!JSON_FILES[key]) throw new Error(`unknown data: ${key}`)
    entries.push({ path: JSON_FILES[key], mode: '100644', type: 'blob', content: JSON.stringify(value, null, 2) + '\n' })
  }
  const { commitSha, treeSha } = await headTree()
  const tree = await gh('/git/trees', { method: 'POST', body: JSON.stringify({ base_tree: treeSha, tree: entries }) })
  const created = await gh('/git/commits', {
    method: 'POST',
    body: JSON.stringify({ message: `Admin: ${String(message || 'update site').slice(0, 120)}`, tree: tree.sha, parents: [commitSha] }),
  })
  await gh(`/git/refs/heads/${BRANCH}`, { method: 'PATCH', body: JSON.stringify({ sha: created.sha }) })
  return { commit: created.sha }
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' })
  if (!process.env.ADMIN_PASSWORD) {
    return res.status(500).json({ error: 'Server is not set up: add ADMIN_PASSWORD in Vercel (Settings > Environment Variables), then redeploy.' })
  }
  const given = req.headers['x-admin-password'] || ''
  if (!sameText(given, process.env.ADMIN_PASSWORD)) {
    await new Promise((r) => setTimeout(r, 800)) // slows down password guessing
    return res.status(401).json({ error: 'Wrong password' })
  }
  try {
    const body = req.body || {}
    if (body.action === 'login') return res.status(200).json({ ok: true, github: !!process.env.GITHUB_TOKEN, redis: redisReady() })
    if (body.action === 'stats') return res.status(200).json(await stats(body.days))
    if (body.action === 'board') return res.status(200).json(await board())
    if (body.action === 'boardRemove' || body.action === 'boardReset' || body.action === 'statsReset') {
      if (!redisReady()) throw new Error('Redis is not connected yet')
      if (body.action === 'boardRemove') {
        const key = String(body.key || '')
        if (!key.includes('|') || key.length > 80) throw new Error('bad entry')
        await redis([['ZREM', BOARD, key], ['SREM', NAMES, key.slice(0, key.indexOf('|'))]])
      } else if (body.action === 'boardReset') {
        await redis([['DEL', BOARD], ['DEL', NAMES]])
      } else {
        const [a, b] = await redis([['KEYS', 'aws:s:*'], ['KEYS', 'aws:u:*']])
        const all = [...(a || []), ...(b || []), 'aws:live']
        for (let i = 0; i < all.length; i += 50) await redis([['DEL', ...all.slice(i, i + 50)]])
      }
      return res.status(200).json({ ok: true })
    }
    if (!process.env.GITHUB_TOKEN) {
      return res.status(400).json({ error: 'Site editing is not set up: add GITHUB_TOKEN in Vercel, then redeploy.' })
    }
    if (body.action === 'load') return res.status(200).json(await load())
    if (body.action === 'blob') {
      if (typeof body.base64 !== 'string' || body.base64.length > 3_500_000) throw new Error('file too large')
      const blob = await gh('/git/blobs', { method: 'POST', body: JSON.stringify({ content: body.base64, encoding: 'base64' }) })
      return res.status(200).json({ sha: blob.sha })
    }
    if (body.action === 'commit') return res.status(200).json(await commit(body))
    return res.status(400).json({ error: 'unknown action' })
  } catch (e) {
    return res.status(e.status >= 500 ? 500 : 400).json({ error: e.message || 'failed' })
  }
}
