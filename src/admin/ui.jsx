export async function api(password, body) {
  const res = await fetch('/api/admin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
    body: JSON.stringify(body),
  })
  let data = {}
  try {
    data = await res.json()
  } catch {
    /* not json */
  }
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status}). Is the API deployed?`)
  return data
}


export const clone = (x) => JSON.parse(JSON.stringify(x))
export const same = (a, b) => JSON.stringify(a) === JSON.stringify(b)

// ---------- small UI pieces ----------
export const input =
  'w-full rounded-lg border border-white/10 bg-ink-2 px-3 py-2 text-sm text-white outline-none placeholder:text-white/30 focus:border-aws'

export function Field({ label, hint, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium uppercase tracking-wider text-white/60">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-white/40">{hint}</span>}
    </label>
  )
}

export function Btn({ kind = 'ghost', className = '', ...p }) {
  const styles = {
    primary: 'bg-aws text-white hover:bg-aws-deep disabled:opacity-40',
    ghost: 'border border-white/15 text-white/80 hover:bg-white/5 disabled:opacity-40',
    danger: 'border border-red-400/30 text-red-300 hover:bg-red-500/10 disabled:opacity-40',
  }
  return (
    <button
      type="button"
      {...p}
      className={`rounded-lg px-3 py-2 text-sm font-medium transition ${styles[kind]} ${className}`}
    />
  )
}

export function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 sm:p-8">
      <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-panel p-5 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <button type="button" onClick={onClose} className="text-2xl leading-none text-white/50 hover:text-white">
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

