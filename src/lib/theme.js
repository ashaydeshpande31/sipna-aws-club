// Accent colour picker. Saved on the visitor's phone and applied before the page appears.
export const THEMES = [
  { id: 'violet', label: 'Violet', aws: '#8c4fff', soft: '#b58cff', deep: '#6a2be0' },
  { id: 'orange', label: 'Orange', aws: '#ff9900', soft: '#ffb84d', deep: '#d97f00' },
  { id: 'cyan', label: 'Cyan', aws: '#14b8e6', soft: '#6fd8f5', deep: '#0b8fb3' },
  { id: 'green', label: 'Green', aws: '#22c55e', soft: '#6ee79a', deep: '#15a047' },
]
const KEY = 'aws-theme'

export function applyTheme(id) {
  const t = THEMES.find((x) => x.id === id) || THEMES[0]
  const root = document.documentElement
  if (t.id === 'violet') {
    ;['--color-aws', '--color-aws-soft', '--color-aws-deep'].forEach((k) => root.style.removeProperty(k))
  } else {
    root.style.setProperty('--color-aws', t.aws)
    root.style.setProperty('--color-aws-soft', t.soft)
    root.style.setProperty('--color-aws-deep', t.deep)
  }
  return t.id
}

export const savedTheme = () => {
  try {
    return localStorage.getItem(KEY) || 'violet'
  } catch {
    return 'violet'
  }
}
export function setTheme(id) {
  applyTheme(id)
  try {
    localStorage.setItem(KEY, id)
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new Event('aws:theme'))
}

if (typeof window !== 'undefined') applyTheme(savedTheme())
