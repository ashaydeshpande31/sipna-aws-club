// Shared class strings + tiny helpers

export const btnPrimary =
  'group inline-flex items-center gap-2 rounded-full bg-aws px-6 py-3.5 text-sm font-semibold text-white shadow-[0_0_44px_-8px_rgba(140,79,255,0.95)] transition-colors duration-300 hover:bg-aws-soft hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-aws-soft'

export const btnGhost =
  'group inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white/90 backdrop-blur transition-colors duration-300 hover:border-aws/60 hover:bg-aws/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-aws-soft'

export const chip =
  'inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70'

// whole months between an ISO date and now (never negative)
export function monthsSince(iso) {
  const start = new Date(iso)
  if (Number.isNaN(start.getTime())) return 0
  const now = new Date()
  const months =
    (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth())
  return Math.max(0, months)
}

export const pad2 = (n) => String(n).padStart(2, '0')
