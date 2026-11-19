import { useCallback, useEffect, useState } from 'react'
import { api, Btn } from './ui.jsx'

// Actions that happen immediately (they do not need "Save & publish"): quiz leaderboard and analytics reset.

export default function Tools({ password, flags }) {
  const [board, setBoard] = useState(null)
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    try {
      setBoard(await api(password, { action: 'board' }))
    } catch (e) {
      setMsg(e.message)
    }
  }, [password])
  useEffect(() => {
    load()
  }, [load])

  const run = async (body, ask, done) => {
    if (!confirm(ask)) return
    setBusy(true)
    setMsg('')
    try {
      await api(password, body)
      setMsg(done)
      await load()
    } catch (e) {
      setMsg(e.message)
    }
    setBusy(false)
  }

  if (flags && flags.redis === false) {
    return <p className="rounded-xl border border-amber-300/30 bg-amber-300/5 p-4 text-sm text-white/75">Connect the free Upstash Redis database in Vercel (Storage tab) and redeploy. Then the leaderboard and visitor tools appear here.</p>
  }

  return (
    <div className="space-y-6">
      {msg && <p className="rounded-xl bg-ink-2 p-3 text-sm text-white/80">{msg}</p>}

      <section className="space-y-3 rounded-2xl border border-white/10 bg-panel p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-aws-soft">Quiz leaderboard</h3>
            <p className="mt-1 text-xs text-white/50">{board && board.configured ? `${board.players} players so far. Removing a name lets that name play again.` : 'Loading...'}</p>
          </div>
          <div className="flex gap-2">
            <Btn onClick={load} disabled={busy}>Refresh</Btn>
            <Btn kind="danger" disabled={busy || !board?.rows?.length} onClick={() => run({ action: 'boardReset' }, 'Delete the whole leaderboard? Everyone can play again. This cannot be undone.', 'Leaderboard cleared.')}>Reset all</Btn>
          </div>
        </div>
        {board && board.rows.length === 0 && <p className="text-sm text-white/40">Nobody has played yet.</p>}
        <ol className="space-y-1.5">
          {(board?.rows || []).map((r, i) => (
            <li key={r.key} className="flex items-center gap-3 rounded-lg bg-ink-2 px-3 py-2 text-sm">
              <span className="w-6 text-white/40">{i + 1}</span>
              <span className="min-w-0 flex-1 truncate text-white">{r.name}</span>
              <span className="tabular-nums text-white/70">{r.score} / 8</span>
              <button type="button" disabled={busy} onClick={() => run({ action: 'boardRemove', key: r.key }, `Remove ${r.name} from the leaderboard?`, `${r.name} removed.`)} className="text-xs text-red-300 hover:underline disabled:opacity-40">
                Remove
              </button>
            </li>
          ))}
        </ol>
      </section>

      <section className="space-y-3 rounded-2xl border border-red-400/20 bg-panel p-4 sm:p-5">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-red-300">Danger zone</h3>
        <p className="text-xs text-white/50">Clears all stored visitor numbers (for example after testing, before the real launch). The leaderboard is not touched.</p>
        <Btn kind="danger" disabled={busy} onClick={() => run({ action: 'statsReset' }, 'Delete ALL visitor statistics? This cannot be undone.', 'Visitor statistics cleared.')}>Reset visitor statistics</Btn>
      </section>
    </div>
  )
}
