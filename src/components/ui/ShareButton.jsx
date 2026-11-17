import { Share2 } from 'lucide-react'

/**
 * "Share" button. On phones it opens the native share sheet (WhatsApp, Instagram...).
 * On computers without that, it opens a WhatsApp message instead.
 */
export default function ShareButton({ title, text, url, label = 'Share', className = '' }) {
  const share = async () => {
    const link = url || `${window.location.origin}/`
    try {
      if (navigator.share) {
        await navigator.share({ title, text, url: link })
        return
      }
    } catch (e) {
      if (e && e.name === 'AbortError') return // person closed the share sheet
    }
    window.open(`https://wa.me/?text=${encodeURIComponent(`${text} ${link}`)}`, '_blank', 'noopener')
  }

  return (
    <button
      type="button"
      onClick={share}
      className={`inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-medium text-white/70 transition-colors hover:border-aws/60 hover:text-white ${className}`}
    >
      <Share2 size={14} className="text-aws-soft" />
      {label}
    </button>
  )
}
