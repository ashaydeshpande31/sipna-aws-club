import { useEffect, useRef } from 'react'
import { gsap, reducedMotion, finePointer } from '../lib/scroll'
import { confetti, partyMode } from '../lib/fx'

// ------------------------------------------------------------
//  Page-wide effects (all switch off for "reduce motion" visitors):
//   1. glowing cloud trail: follows the mouse on desktop, the finger on phones
//   2. section headings warp into place while scrolling
//   3. confetti (and a small buzz on phones) on any element marked  data-confetti
//   4. hidden party mode: Konami code or typing "party"
//  (the scroll progress bar lives in Nav.jsx)
// ------------------------------------------------------------

function glowSprite(color) {
  const c = document.createElement('canvas')
  c.width = c.height = 64
  const g = c.getContext('2d')
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32)
  grad.addColorStop(0, `${color}ff`)
  grad.addColorStop(0.35, `${color}88`)
  grad.addColorStop(1, `${color}00`)
  g.fillStyle = grad
  g.fillRect(0, 0, 64, 64)
  return c
}

const KONAMI = ['arrowup', 'arrowup', 'arrowdown', 'arrowdown', 'arrowleft', 'arrowright', 'arrowleft', 'arrowright', 'b', 'a']

export default function FX({ ready }) {
  const trail = useRef(null)

  // 1. glow trail (mouse on desktop, finger on phones)
  useEffect(() => {
    if (reducedMotion()) return
    const canvas = trail.current
    if (!canvas) return
    const touchDevice = !finePointer()
    const maxParticles = touchDevice ? 70 : 140
    const ctx = canvas.getContext('2d')
    let w = 0
    let h = 0
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, touchDevice ? 1.5 : 2)
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    const sprites = [glowSprite('#8c4fff'), glowSprite('#b58cff'), glowSprite('#ff9900')]
    const ps = []
    let last = null
    let raf = 0

    const loop = () => {
      ctx.clearRect(0, 0, w, h)
      ctx.globalCompositeOperation = 'lighter'
      for (let i = ps.length - 1; i >= 0; i--) {
        const p = ps[i]
        p.life -= 0.026
        if (p.life <= 0) {
          ps.splice(i, 1)
          continue
        }
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.01
        const s = p.size * (0.4 + p.life * 0.8)
        ctx.globalAlpha = Math.min(1, p.life) * 0.55
        ctx.drawImage(p.sprite, p.x - s / 2, p.y - s / 2, s, s)
      }
      // the loop sleeps when there is nothing left to draw
      if (ps.length) raf = requestAnimationFrame(loop)
      else {
        raf = 0
        ctx.clearRect(0, 0, w, h)
      }
    }

    // draw a line of glow from the last point to (x, y)
    const trailTo = (x, y, sizeBase, sizeRand) => {
      if (last) {
        const dx = x - last.x
        const dy = y - last.y
        const n = Math.min(4, Math.ceil(Math.hypot(dx, dy) / 14))
        for (let i = 0; i < n; i++) {
          const t = i / n
          const roll = Math.random()
          ps.push({
            x: last.x + dx * t,
            y: last.y + dy * t,
            vx: (Math.random() - 0.5) * 0.6,
            vy: (Math.random() - 0.5) * 0.6,
            life: 1,
            size: sizeBase + Math.random() * sizeRand,
            sprite: roll < 0.12 ? sprites[2] : roll < 0.56 ? sprites[0] : sprites[1],
          })
        }
      }
      last = { x, y }
      if (ps.length > maxParticles) ps.splice(0, ps.length - maxParticles)
      if (!raf) raf = requestAnimationFrame(loop)
    }

    const move = (e) => {
      if (e.pointerType === 'touch') return // fingers are handled by the touch events below
      trailTo(e.clientX, e.clientY, 18, 26)
    }
    const touchStart = (e) => {
      const t = e.touches[0]
      if (!t) return
      last = null
      trailTo(t.clientX, t.clientY, 22, 16)
    }
    const touchMove = (e) => {
      const t = e.touches[0]
      if (t) trailTo(t.clientX, t.clientY, 16, 18)
    }
    const end = () => {
      last = null
    }
    window.addEventListener('pointermove', move, { passive: true })
    document.addEventListener('pointerleave', end)
    window.addEventListener('touchstart', touchStart, { passive: true })
    window.addEventListener('touchmove', touchMove, { passive: true })
    window.addEventListener('touchend', end, { passive: true })
    window.addEventListener('touchcancel', end, { passive: true })
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', move)
      document.removeEventListener('pointerleave', end)
      window.removeEventListener('touchstart', touchStart)
      window.removeEventListener('touchmove', touchMove)
      window.removeEventListener('touchend', end)
      window.removeEventListener('touchcancel', end)
    }
  }, [])

  // 2. heading warp (after the intro finishes)
  useEffect(() => {
    if (!ready || reducedMotion()) return
    let cleanup = () => {}
    const timer = setTimeout(() => {
      const ctx = gsap.context(() => {
        document.querySelectorAll('main h2').forEach((h) => {
          if (h.closest('#events')) return // that section is pinned, leave its heading alone
          gsap.fromTo(
            h,
            { y: 46, scale: 0.9, skewY: 2.5, transformOrigin: '50% 100%' },
            {
              y: 0,
              scale: 1,
              skewY: 0,
              ease: 'none',
              scrollTrigger: { trigger: h, start: 'top 98%', end: 'top 58%', scrub: true },
            },
          )
        })
      })
      cleanup = () => ctx.revert()
    }, 600)
    return () => {
      clearTimeout(timer)
      cleanup()
    }
  }, [ready])

  // 3 + 4. confetti on click, party mode on key combos
  useEffect(() => {
    const onClick = (e) => {
      const el = e.target.closest && e.target.closest('[data-confetti]')
      if (!el) return
      let x = e.clientX
      let y = e.clientY
      if (!x && !y) {
        const r = el.getBoundingClientRect()
        x = r.left + r.width / 2
        y = r.top + r.height / 2
      }
      confetti(x, y, { haptic: true })
    }
    let keys = []
    const onKey = (e) => {
      const t = e.target
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return
      if (e.metaKey || e.ctrlKey || e.altKey || !e.key) return
      keys = [...keys, e.key.toLowerCase()].slice(-10)
      const joined = keys.join('')
      if (keys.join(',') === KONAMI.join(',') || joined.endsWith('party')) {
        keys = []
        partyMode()
      }
    }
    document.addEventListener('click', onClick)
    window.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('click', onClick)
      window.removeEventListener('keydown', onKey)
    }
  }, [])

  return (
    <>
      <canvas ref={trail} aria-hidden="true" className="pointer-events-none fixed left-0 top-0 z-[70]" />
    </>
  )
}
