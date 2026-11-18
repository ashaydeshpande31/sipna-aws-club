// Vercel serverless function for the quiz leaderboard on /play.
//
//  GET  /api/leaderboard            -> top 10 {name, score}
//  POST /api/leaderboard {name,score} -> adds one entry (one entry per name, ever)
//
// Storage: a free Upstash Redis database. In Vercel: Project > Storage > Create > Upstash (Redis),
// connect it to this project and redeploy. Vercel adds the two variables below by itself:
//   KV_REST_API_URL  and  KV_REST_API_TOKEN      (or UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN)
// Without them this API answers { configured: false } and the website keeps the board on the visitor's phone only.

const URL_ = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL
const TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN
const BOARD = 'aws:quiz:board'
const NAMES = 'aws:quiz:names'
const MAX_SCORE = 8 // number of questions in a round (src/components/sections/Play.jsx)
const SCALE = 1e10

async function redis(commands) {
  const res = await fetch(`${URL_}/pipeline`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(commands),
  })
  if (!res.ok) throw new Error(`Redis ${res.status}`)
  return res.json()
}

const clean = (s) =>
  String(s ?? '')
    .replace(/[\u0000-\u001f\u007f<>|]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 20)

async function top() {
  const [r] = await redis([['ZREVRANGE', BOARD, 0, 9, 'WITHSCORES']])
  const flat = r.result || []
  const out = []
  for (let i = 0; i < flat.length; i += 2) {
    const member = String(flat[i])
    out.push({ name: member.slice(member.indexOf('|') + 1), score: Math.floor(Number(flat[i + 1]) / SCALE) })
  }
  return out
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  if (!URL_ || !TOKEN) return res.status(200).json({ configured: false, top: [] })

  try {
    if (req.method === 'GET') return res.status(200).json({ configured: true, top: await top() })

    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {}
      const name = clean(body.name)
      const score = Number(body.score)
      if (name.length < 2) return res.status(400).json({ error: 'Please enter a name (2 to 20 letters).' })
      if (!Number.isInteger(score) || score < 0 || score > MAX_SCORE) return res.status(400).json({ error: 'Bad score.' })

      const lower = name.toLowerCase()
      const [added] = await redis([['SADD', NAMES, lower]])
      if (!added.result) return res.status(409).json({ error: 'That name has already played. Use another name.' })

      // higher score first; for equal scores the earlier finisher ranks higher
      const rank = score * SCALE + (2e9 - Math.floor(Date.now() / 1000))
      await redis([['ZADD', BOARD, rank, `${lower}|${name}`]])
      return res.status(200).json({ configured: true, top: await top() })
    }
    return res.status(405).json({ error: 'GET or POST only' })
  } catch {
    return res.status(500).json({ error: 'Leaderboard is busy. Try again in a moment.' })
  }
}
