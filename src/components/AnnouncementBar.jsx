import { useLayoutEffect, useState } from 'react'
import { ArrowRight, Megaphone, X } from 'lucide-react'
import { navigate } from '../lib/scroll'
import { ANNOUNCEMENT } from '../data/news'

const KEY = 'aws-ann-closed'
const text = ANNOUNCEMENT.text

// Thin official notice bar at the very top. Visitors can close it (it stays closed for that visit).
export default function AnnouncementBar() {
  const [closed, setClosed] = useState(() => {
    try {
      return sessionStorage.getItem(KEY) === text
    } catch {
      return false
    }
  })
  const show = !!text && !closed

  // other fixed bars read this to sit just below
  useLayoutEffect(() => {
    document.documentElement.style.setProperty('--ann', show ? '2rem' : '0px')
    return () => document.documentElement.style.setProperty('--ann', '0px')
  }, [show])

  if (!show) return null
  const to = ANNOUNCEMENT.linkTo
  const external = /^https?:/.test(to || '')

  return (
    <div
      role="region"
      aria-label="Announcement"
      className="fixed inset-x-0 top-0 z-[69] flex h-8 items-center justify-center gap-2 bg-gradient-to-r from-aws-deep via-aws to-aws-deep px-9 text-[12px] font-medium text-white"
    >
      <Megaphone size={13} className="hidden shrink-0 sm:block" />
      <span className="truncate">{text}</span>
      {to && (
        <a
          href={to}
          target={external ? '_blank' : undefined}
          rel="noopener noreferrer"
          onClick={(e) => {
            if (external || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return
            e.preventDefault()
            navigate(to)
          }}
          className="flex shrink-0 items-center gap-1 font-semibold underline underline-offset-2"
        >
          {ANNOUNCEMENT.linkLabel || 'Learn more'} <ArrowRight size={12} />
        </a>
      )}
      <button
        type="button"
        aria-label="Close announcement"
        onClick={() => {
          setClosed(true)
          try {
            sessionStorage.setItem(KEY, text)
          } catch {
            /* ignore */
          }
        }}
        className="absolute right-2 grid h-6 w-6 place-items-center rounded-full hover:bg-white/15"
      >
        <X size={14} />
      </button>
    </div>
  )
}
