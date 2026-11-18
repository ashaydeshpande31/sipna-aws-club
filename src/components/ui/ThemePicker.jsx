import { useEffect, useState } from 'react'
import { THEMES, savedTheme, setTheme } from '../../lib/theme'
import { haptic } from '../../lib/haptic'

/** Four colour dots: the visitor picks the accent colour of the whole site. */
export default function ThemePicker({ className = '' }) {
  const [cur, setCur] = useState(savedTheme)
  useEffect(() => {
    const on = () => setCur(savedTheme())
    window.addEventListener('aws:theme', on)
    return () => window.removeEventListener('aws:theme', on)
  }, [])
  return (
    <div className={`flex items-center gap-2.5 ${className}`} role="group" aria-label="Accent colour">
      {THEMES.map((t) => (
        <button
          key={t.id}
          type="button"
          aria-label={`${t.label} theme`}
          aria-pressed={cur === t.id}
          onClick={() => {
            haptic(10)
            setTheme(t.id)
          }}
          className={`h-7 w-7 rounded-full border-2 transition-transform ${cur === t.id ? 'scale-110 border-white' : 'border-white/20'}`}
          style={{ background: t.aws }}
        />
      ))}
    </div>
  )
}
