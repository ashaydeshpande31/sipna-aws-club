import { useEffect, useState } from 'react'
import { Download } from 'lucide-react'

/** "Install app" button. Only appears when the phone's browser says the site can be installed. */
export default function InstallButton({ className = '' }) {
  const [evt, setEvt] = useState(null)
  useEffect(() => {
    const on = (e) => {
      e.preventDefault()
      setEvt(e)
    }
    const done = () => setEvt(null)
    window.addEventListener('beforeinstallprompt', on)
    window.addEventListener('appinstalled', done)
    return () => {
      window.removeEventListener('beforeinstallprompt', on)
      window.removeEventListener('appinstalled', done)
    }
  }, [])
  if (!evt) return null
  return (
    <button
      type="button"
      onClick={async () => {
        evt.prompt()
        try {
          await evt.userChoice
        } catch {
          /* ignore */
        }
        setEvt(null)
      }}
      className={`inline-flex items-center gap-2 rounded-full border border-aws/40 bg-aws/15 px-4 py-2 text-xs font-semibold text-white ${className}`}
    >
      <Download size={14} /> Install app
    </button>
  )
}
