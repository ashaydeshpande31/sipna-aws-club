// Vercel serverless function behind the /admin page.
// It checks the admin password, then reads / commits files in the GitHub repo.
// Every commit triggers a normal Vercel redeploy, so the site updates itself.
//
// Environment variables (Vercel > Project > Settings > Environment Variables):
//   ADMIN_PASSWORD   the password for /admin
//   GITHUB_TOKEN     fine-grained token, this repo only, "Contents: Read and write"
//   GITHUB_REPO      optional, default ashaydeshpande31/sipna-aws-club
//   GITHUB_BRANCH    optional, default main

import crypto from 'node:crypto'

const REPO = process.env.GITHUB_REPO || 'ashaydeshpande31/sipna-aws-club'
const BRANCH = process.env.GITHUB_BRANCH || 'main'

const JSON_FILES = {
  team: 'src/data/team.json',
  pastEvents: 'src/data/pastEvents.json',
  upcoming: 'src/data/upcoming.json',
}

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
    if (!entry) throw new Error(`${path} not found in the repo`)
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
  if (!process.env.ADMIN_PASSWORD || !process.env.GITHUB_TOKEN) {
    return res.status(500).json({ error: 'Server is not set up: add ADMIN_PASSWORD and GITHUB_TOKEN in Vercel, then redeploy.' })
  }
  const given = req.headers['x-admin-password'] || ''
  if (!sameText(given, process.env.ADMIN_PASSWORD)) {
    await new Promise((r) => setTimeout(r, 800)) // slows down password guessing
    return res.status(401).json({ error: 'Wrong password' })
  }
  try {
    const body = req.body || {}
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
