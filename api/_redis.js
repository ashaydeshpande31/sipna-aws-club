// Small helper shared by the API files. (A leading underscore tells Vercel this is not a public endpoint.)
// Uses the same free Upstash Redis database as the quiz leaderboard.
const URL_ = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL
const TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN

export const redisReady = () => !!(URL_ && TOKEN)

/** Runs a list of Redis commands in one request, e.g. redis([['HINCRBY','k','f',1], ['GET','x']]). */
export async function redis(commands) {
  const res = await fetch(`${URL_}/pipeline`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(commands),
  })
  if (!res.ok) throw new Error(`Redis ${res.status}`)
  const out = await res.json()
  return out.map((r) => {
    if (r.error) throw new Error(r.error)
    return r.result
  })
}

// Days are counted in India time (UTC+5:30), so "today" matches the club's day.
const IST = 19800000
export const istDay = (ms = Date.now()) => new Date(ms + IST).toISOString().slice(0, 10)
export const istHour = (ms = Date.now()) => new Date(ms + IST).getUTCHours()
