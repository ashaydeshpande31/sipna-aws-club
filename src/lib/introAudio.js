// ============================================================
//  INTRO SOUND  (no audio files: everything is synthesised with the Web Audio API)
//  The whole soundtrack is scheduled up front on the audio clock, so it stays in sync with the visuals.
//  Browsers only allow sound after a tap/click, which is why the intro starts with a POWER ON button.
// ============================================================

// Moments of the intro, in seconds after POWER ON. Loader.jsx uses the same numbers for the visuals.
export const CUE = {
  crt: 0, // screen snaps on
  log: 0.45, // boot log starts typing
  chip: 0.9, // chip draws itself, pins light up
  riser: 2.7, // tension builds
  drop: 4.4, // flash, bass hit, club name slams in
  whoosh: 6.3, // sweep before the shutters open
  open: 6.55, // site is revealed
  end: 7.6, // overlay removed
}
export const PIN_COUNT = 20
export const PIN_STEP = 0.06
export const LOG_STEP = 0.27
export const LOG_ROWS = 8

const semi = (n) => Math.pow(2, n / 12)
// minor pentatonic, three octaves
const PENTA = [0, 3, 5, 7, 10, 12, 15, 17, 19, 22, 24, 27, 29, 31]
const arr = (v) => (Array.isArray(v) ? v : [v])

function makeNoise(ctx, seconds) {
  const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * seconds), ctx.sampleRate)
  const d = buf.getChannelData(0)
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
  return buf
}

function makeImpulse(ctx, seconds, decay) {
  const len = Math.floor(ctx.sampleRate * seconds)
  const buf = ctx.createBuffer(2, len, ctx.sampleRate)
  for (let c = 0; c < 2; c++) {
    const d = buf.getChannelData(c)
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay)
  }
  return buf
}

/** Builds the audio graph on any AudioContext (a real one in the browser, an offline one in tests). */
export function buildIntroAudio(ctx, dest = ctx.destination) {
  const master = ctx.createGain()
  master.gain.value = 0.8
  const comp = ctx.createDynamicsCompressor()
  comp.threshold.value = -18
  comp.knee.value = 12
  comp.ratio.value = 6
  comp.attack.value = 0.003
  comp.release.value = 0.22
  master.connect(comp)
  comp.connect(dest)

  // everything in the score goes through "bus" so Skip can cut it instantly
  const bus = ctx.createGain()
  bus.connect(master)

  const verbIn = ctx.createGain()
  verbIn.gain.value = 1
  const verb = ctx.createConvolver()
  verb.buffer = makeImpulse(ctx, 1.9, 2.4)
  verbIn.connect(verb)
  verb.connect(bus)

  const noise = makeNoise(ctx, 2)

  // one sound: an oscillator or a burst of noise, through optional filters, with an envelope
  function voice(src, o) {
    const t = o.t
    let node = src
    const filt = (type, spec, q) => {
      const [a, b] = arr(spec)
      const f = ctx.createBiquadFilter()
      f.type = type
      f.Q.value = q ?? 0.7
      f.frequency.setValueAtTime(a, t)
      if (b && b !== a) f.frequency.exponentialRampToValueAtTime(b, t + o.dur)
      node.connect(f)
      node = f
    }
    if (o.hp) filt('highpass', o.hp)
    if (o.bp) filt('bandpass', o.bp, o.q ?? 1)
    if (o.lp) filt('lowpass', o.lp)

    const g = ctx.createGain()
    const a = o.attack ?? 0.004
    g.gain.setValueAtTime(0.0001, t)
    // short attacks are exponential (punchy); long ones are linear so slow swells are audible from the start
    if (a > 0.3) g.gain.linearRampToValueAtTime(o.gain, t + a)
    else g.gain.exponentialRampToValueAtTime(o.gain, t + a)
    if (o.hold && o.hold > a) g.gain.setValueAtTime(o.gain, t + o.hold)
    g.gain.exponentialRampToValueAtTime(0.0001, t + o.dur)
    node.connect(g)
    g.connect(o.out || bus)
    if (o.send) {
      const s = ctx.createGain()
      s.gain.value = o.send
      g.connect(s)
      s.connect(verbIn)
    }
    src.start(t)
    src.stop(t + o.dur + 0.05)
  }

  function tone(o) {
    const osc = ctx.createOscillator()
    osc.type = o.type || 'sine'
    osc.frequency.setValueAtTime(o.f0, o.t)
    if (o.f1) osc.frequency.exponentialRampToValueAtTime(o.f1, o.t + (o.sweep ?? o.dur))
    if (o.detune) osc.detune.value = o.detune
    voice(osc, o)
  }

  function hit(o) {
    const src = ctx.createBufferSource()
    src.buffer = noise
    src.loop = true
    src.loopStart = 0
    src.loopEnd = 2
    // start() takes the time first; the buffer offset is set through a second start argument below
    voice(
      {
        connect: (n) => src.connect(n),
        start: (t) => src.start(t, Math.random() * 1.4),
        stop: (t) => src.stop(t),
      },
      o,
    )
  }

  const kick = (t, g = 0.9, len = 0.9) => {
    tone({ type: 'sine', f0: 165, f1: 38, sweep: 0.42, t, dur: len, gain: g, attack: 0.002 })
    hit({ t, dur: 0.035, gain: g * 0.35, hp: 1800, attack: 0.001 })
  }

  function schedule(t0) {
    const T = (s) => t0 + s

    // ---- 0.00 relay clunk + screen snap + rising whine
    hit({ t: T(0), dur: 0.06, gain: 0.55, hp: 2500, attack: 0.001 })
    tone({ type: 'sine', f0: 150, f1: 40, sweep: 0.3, t: T(0), dur: 0.5, gain: 0.95, attack: 0.002 })
    tone({ type: 'square', f0: 2200, f1: 260, sweep: 0.14, t: T(0), dur: 0.16, gain: 0.1, lp: [7000, 900], attack: 0.001 })
    tone({ type: 'sawtooth', f0: 90, f1: 520, sweep: 0.45, t: T(0.04), dur: 0.5, gain: 0.08, lp: [600, 3500], attack: 0.05 })

    // ---- mains hum + fan spinning up, until the drop
    tone({ type: 'sawtooth', f0: 55, t: T(0.1), dur: CUE.drop - 0.1 - 0.02, hold: CUE.drop - 0.14, attack: 3.8, gain: 0.12, lp: 240 })
    tone({ type: 'sawtooth', f0: 110.4, t: T(0.1), dur: CUE.drop - 0.1 - 0.02, hold: CUE.drop - 0.14, attack: 3.8, gain: 0.05, lp: 380, detune: 6 })
    hit({ t: T(0.2), dur: CUE.drop - 0.2 - 0.02, hold: CUE.drop - 0.25, attack: 2.4, gain: 0.06, bp: [250, 1500], q: 0.8 })

    // ---- boot log: soft typing clicks and a tiny confirm chirp per line
    for (let i = 0; i < LOG_ROWS; i++) {
      const t = CUE.log + i * LOG_STEP
      hit({ t: T(t), dur: 0.025, gain: 0.07, hp: 4200, attack: 0.001 })
      hit({ t: T(t + 0.08), dur: 0.02, gain: 0.05, hp: 5200, attack: 0.001 })
      tone({ type: 'sine', f0: i === LOG_ROWS - 1 ? 1760 : 1240, t: T(t + 0.22), dur: 0.07, gain: i === LOG_ROWS - 1 ? 0.1 : 0.05, attack: 0.002, send: 0.2 })
    }

    // ---- the chip wakes up: one blip per pin, climbing the scale
    for (let i = 0; i < PIN_COUNT; i++) {
      const n = PENTA[i % 10] + (i >= 10 ? 12 : 0)
      const t = T(CUE.chip + i * PIN_STEP)
      tone({ type: 'triangle', f0: 220 * semi(n), t, dur: 0.2, gain: 0.15, attack: 0.002, send: 0.3 })
      tone({ type: 'sine', f0: 440 * semi(n), t, dur: 0.12, gain: 0.05, attack: 0.002 })
    }

    // ---- build-up: data-stream hats, a quiet kick, accelerating ticks, the riser
    for (let t = 1.4; t < CUE.drop - 0.08; t += 0.125) {
      const k = (t - 1.4) / (CUE.drop - 1.4)
      hit({ t: T(t), dur: 0.03, gain: 0.02 + 0.05 * k, hp: 7500, attack: 0.001 })
    }
    for (let t = 2.2; t < CUE.drop - 0.1; t += 0.5) kick(T(t), 0.26, 0.3)
    const R = CUE.drop - 0.05 - CUE.riser // riser ends 50 ms before the drop: a tiny breath of silence
    for (let k = 0; k < 16; k++) {
      const t = CUE.riser + R * (1 - Math.pow(1 - k / 16, 2))
      hit({ t: T(t), dur: 0.03, gain: 0.07 + k * 0.004, hp: 5000, attack: 0.001 })
    }
    for (const dt of [-12, 12]) {
      tone({ type: 'sawtooth', f0: 110, f1: 1760, t: T(CUE.riser), dur: R + 0.02, hold: R, attack: R - 0.05, gain: 0.11, lp: [300, 7500], detune: dt })
    }
    hit({ t: T(CUE.riser), dur: R + 0.02, hold: R, attack: R - 0.05, gain: 0.13, hp: [800, 9000] })

    // ---- 4.40 THE DROP: kick, sub, crash, minor chord, sparkle
    const D = CUE.drop
    kick(T(D), 1.0, 1.1)
    tone({ type: 'sine', f0: 55, t: T(D), dur: 2.0, hold: 0.25, gain: 0.6, attack: 0.01 })
    hit({ t: T(D), dur: 1.9, gain: 0.34, hp: 3500, attack: 0.002, send: 0.35 })
    const chord = [110, 164.81, 220, 261.63, 329.63, 493.88]
    for (const f of chord) {
      for (const dt of [-8, 8]) {
        tone({ type: 'sawtooth', f0: f, t: T(D), dur: 2.7, hold: 0.2, gain: 0.055, lp: [4200, 520], detune: dt, send: 0.4, attack: 0.006 })
      }
    }
    tone({ type: 'triangle', f0: 880, t: T(D + 0.05), dur: 1.6, gain: 0.05, send: 0.55 })
    tone({ type: 'triangle', f0: 1318.5, t: T(D + 0.1), dur: 1.4, gain: 0.035, send: 0.55 })

    // letters slamming in: a quick climbing arpeggio, one note per letter
    for (let i = 0; i < 14; i++) {
      tone({ type: 'square', f0: 440 * semi(PENTA[i]), t: T(D + 0.05 + i * 0.045), dur: 0.1, gain: 0.05, lp: [5200, 1400], attack: 0.002, send: 0.25 })
    }

    // while the title holds: a soft pad, quiet pulse and a mini riser into the sweep
    const hold = CUE.whoosh - D - 0.3 + 0.15
    for (const f of [220, 329.63, 440]) {
      for (const dt of [-5, 5]) tone({ type: 'triangle', f0: f, t: T(D + 0.3), dur: hold, hold: hold - 0.15, attack: 0.6, gain: 0.03, lp: 1800, detune: dt, send: 0.4 })
    }
    for (let t = 5.3; t < CUE.whoosh - 0.05; t += 0.25) hit({ t: T(t), dur: 0.03, gain: 0.04, hp: 7000, attack: 0.001 })
    hit({ t: T(5.9), dur: CUE.whoosh - 5.9, hold: CUE.whoosh - 5.9 - 0.02, attack: CUE.whoosh - 5.9 - 0.05, gain: 0.12, hp: [2000, 9000] })

    // ---- 6.40 sweep + shutter clacks
    hit({ t: T(CUE.whoosh), dur: 0.95, attack: 0.5, gain: 1.4, bp: [250, 6500], q: 0.9 })
    tone({ type: 'sine', f0: 95, f1: 32, sweep: 0.5, t: T(CUE.open), dur: 0.7, gain: 0.6, attack: 0.004 })
    for (let i = 0; i < 6; i++) hit({ t: T(CUE.open + i * 0.06), dur: 0.035, gain: 0.13, hp: 3000, attack: 0.001 })
  }

  return {
    master,
    bus,
    schedule,
    setMuted(m) {
      const t = ctx.currentTime
      master.gain.cancelScheduledValues(t)
      master.gain.setTargetAtTime(m ? 0 : 0.8, t, 0.03)
    },
    /** Skip: cut the score fast, play a short zip. */
    skip() {
      const t = ctx.currentTime
      bus.gain.cancelScheduledValues(t)
      bus.gain.setTargetAtTime(0, t, 0.04)
      hit({ t: t + 0.01, dur: 0.38, attack: 0.1, gain: 0.3, bp: [500, 5200, 1], out: master })
    },
  }
}

// iPhones mute Web Audio when the ring switch is on silent. Playing a silent <audio> (or setting the audio
// session type) makes the intro use the normal media channel instead.
function unlockMobileAudio() {
  let url = ''
  let el = null
  try {
    if (navigator.audioSession) navigator.audioSession.type = 'playback'
  } catch {
    /* not supported */
  }
  try {
    const n = 800
    const b = new DataView(new ArrayBuffer(44 + n))
    const s = (o, t) => [...t].forEach((c, i) => b.setUint8(o + i, c.charCodeAt(0)))
    s(0, 'RIFF'); b.setUint32(4, 36 + n, true); s(8, 'WAVE'); s(12, 'fmt ')
    b.setUint32(16, 16, true); b.setUint16(20, 1, true); b.setUint16(22, 1, true)
    b.setUint32(24, 8000, true); b.setUint32(28, 8000, true); b.setUint16(32, 1, true); b.setUint16(34, 8, true)
    s(36, 'data'); b.setUint32(40, n, true)
    for (let i = 0; i < n; i++) b.setUint8(44 + i, 128)
    url = URL.createObjectURL(new Blob([b.buffer], { type: 'audio/wav' }))
    el = new Audio(url)
    el.loop = true
    el.setAttribute('playsinline', '')
    const p = el.play()
    if (p && p.catch) p.catch(() => {})
  } catch {
    /* ignore */
  }
  return () => {
    try {
      if (el) el.pause()
      if (url) URL.revokeObjectURL(url)
    } catch {
      /* ignore */
    }
  }
}

/** Call this inside the POWER ON click. Returns null when the browser has no Web Audio. */
export function createIntroAudio() {
  const AC = typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext)
  if (!AC) return null
  let ctx
  try {
    ctx = new AC()
  } catch {
    return null
  }
  const lock = unlockMobileAudio()
  if (ctx.resume) ctx.resume().catch(() => {})
  const graph = buildIntroAudio(ctx)
  const lead = 0.05
  let began = false
  let closed = false
  const close = () => {
    if (closed) return
    closed = true
    lock()
    setTimeout(() => ctx.close && ctx.close().catch(() => {}), 600)
  }
  return {
    lead,
    /** Start the soundtrack. Called on the first painted frame so sound and visuals begin together. */
    begin() {
      if (began || closed) return
      began = true
      graph.schedule(ctx.currentTime + lead)
    },
    setMuted: graph.setMuted,
    skip() {
      graph.skip()
      setTimeout(close, 900)
    },
    close,
  }
}
