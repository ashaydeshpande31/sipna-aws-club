// Anonymous visit counter. The website sends one small message per page view (src/lib/track.js).
// Nothing personal is stored: no IP address, no name. Counts are grouped per day (India time) in Redis.
// The /admin page reads them through /api/admin (action "stats").
//
// Redis keys, for a day like 2026-11-19:
//   aws:s:<day>          hash of counters   p:<path>  pd:<path>:<device>  h:<hour>  sess  ss:<device>
//                                           os:<name> b:<browser>  ref:<source>  c:<country>  r:<region>
//                                           en:<entry path>  fl:<from>><to>  newv  ev:<event>  out:<host>
//   aws:u:<day>[:<dev>]  HyperLogLog of anonymous visitor ids (unique visitors)
//   aws:live             sorted set of visitors seen in the last few minutes ("online now")

import { redis, redisReady, istDay, istHour } from './_redis.js'

const PATHS = new Set(['/', '/about', '/events', '/upcoming', '/team', '/learn', '/connect', '/faq', '/play', '/news', '/privacy', '/terms', '/conduct', '/join'])
const DEVICES = new Set(['mobile', 'tablet', 'desktop'])
const BOT = /bot|crawl|spider|slurp|lighthouse|pagespeed|headless|preview|facebookexternalhit|monitor|uptime|curl|wget|python|node-fetch|axios/i

const osOf = (ua) =>
  /iPhone|iPad|iPod/i.test(ua) ? 'iOS' : /Android/i.test(ua) ? 'Android' : /Windows/i.test(ua) ? 'Windows' : /CrOS/i.test(ua) ? 'ChromeOS' : /Mac OS X|Macintosh/i.test(ua) ? 'macOS' : /Linux/i.test(ua) ? 'Linux' : 'Other'

const browserOf = (ua) =>
  /Instagram/i.test(ua) ? 'Instagram app' : /FBAN|FBAV/i.test(ua) ? 'Facebook app' : /LinkedInApp/i.test(ua) ? 'LinkedIn app' : /EdgA?\/|Edg\//i.test(ua) ? 'Edge' : /SamsungBrowser/i.test(ua) ? 'Samsung Internet' : /OPR\/|Opera/i.test(ua) ? 'Opera' : /Firefox|FxiOS/i.test(ua) ? 'Firefox' : /CriOS|Chrome/i.test(ua) ? 'Chrome' : /Safari/i.test(ua) ? 'Safari' : 'Other'

const sourceOf = (raw) => {
  const s = String(raw || '').toLowerCase().replace(/^www\./, '').replace(/[^a-z0-9.\-_ ]/g, '').slice(0, 30)
  if (!s) return 'Direct'
  if (/instagram|^ig$/.test(s)) return 'Instagram'
  if (/whatsapp|^wa$/.test(s)) return 'WhatsApp'
  if (/linkedin|lnkd/.test(s)) return 'LinkedIn'
  if (/google/.test(s)) return 'Google'
  if (/bing|duckduckgo|yahoo|ecosia/.test(s)) return 'Other search'
  if (/facebook|^fb$|fb\.com/.test(s)) return 'Facebook'
  if (/youtube|youtu\.be/.test(s)) return 'YouTube'
  if (/^t\.co$|twitter|^x\.com$/.test(s)) return 'X / Twitter'
  if (/telegram|^t\.me$/.test(s)) return 'Telegram'
  if (/vercel\.app$/.test(s) && /sipna/.test(s)) return 'Direct'
  return s
}

const clean = (s, max) => String(s || '').replace(/[^a-zA-Z0-9._\-]/g, '').slice(0, max)

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  if (req.method !== 'POST') return res.status(405).end()
  if (!redisReady()) return res.status(204).end() // analytics not set up yet: do nothing, break nothing
  try {
    const ua = String(req.headers['user-agent'] || '')
    if (!ua || BOT.test(ua)) return res.status(204).end()
    const b = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {}
    const vid = clean(b.v, 40)
    const dev = DEVICES.has(b.dv) ? b.dv : 'desktop'
    if (vid.length < 6) return res.status(204).end()

    const now = Date.now()
    const day = istDay(now)
    const S = `aws:s:${day}`
    const cmds = []

    if (b.t === 'event') {
      const e = clean(b.e, 24)
      if (!['quiz_done', 'install', 'out'].includes(e)) return res.status(204).end()
      cmds.push(['HINCRBY', S, `ev:${e}`, 1])
      if (e === 'out') {
        const host = clean(b.o, 40).toLowerCase()
        if (host) cmds.push(['HINCRBY', S, `out:${host}`, 1])
      }
    } else if (b.t === 'view') {
      const p = PATHS.has(b.p) ? b.p : '/other'
      cmds.push(['HINCRBY', S, `p:${p}`, 1], ['HINCRBY', S, `pd:${p}:${dev}`, 1], ['HINCRBY', S, `h:${istHour(now)}`, 1])
      cmds.push(['PFADD', `aws:u:${day}`, vid], ['PFADD', `aws:u:${day}:${dev}`, vid])
      if (PATHS.has(b.f) && b.f !== p) cmds.push(['HINCRBY', S, `fl:${b.f}>${p}`, 1])
      if (b.nv === true) cmds.push(['HINCRBY', S, 'newv', 1])
      if (b.ns === true) {
        cmds.push(['HINCRBY', S, 'sess', 1], ['HINCRBY', S, `ss:${dev}`, 1], ['HINCRBY', S, `en:${p}`, 1])
        cmds.push(['HINCRBY', S, `os:${osOf(ua)}`, 1], ['HINCRBY', S, `b:${browserOf(ua)}`, 1])
        cmds.push(['HINCRBY', S, `ref:${sourceOf(b.r)}`, 1])
        const country = clean(req.headers['x-vercel-ip-country'], 2).toUpperCase()
        if (country) cmds.push(['HINCRBY', S, `c:${country}`, 1])
        const region = clean(req.headers['x-vercel-ip-country-region'], 3).toUpperCase()
        if (country === 'IN' && region) cmds.push(['HINCRBY', S, `r:${region}`, 1])
      }
      cmds.push(['ZADD', 'aws:live', now, vid])
    } else {
      return res.status(204).end()
    }
    await redis(cmds)
    return res.status(204).end()
  } catch {
    return res.status(204).end() // counting must never show an error to a visitor
  }
}
