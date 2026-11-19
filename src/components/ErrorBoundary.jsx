import { Component } from 'react'

/** If something unexpected breaks, show a friendly screen with a reload button instead of a blank page. */
export default class ErrorBoundary extends Component {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch(error) {
    // a new version was deployed while this tab was open: the old chunk files are gone, a reload fixes it
    if (/Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically/i.test(String(error && error.message))) {
      try {
        if (!sessionStorage.getItem('aws-reloaded')) {
          sessionStorage.setItem('aws-reloaded', '1')
          window.location.reload()
        }
      } catch {
        /* ignore */
      }
    }
  }
  render() {
    if (!this.state.failed) return this.props.children
    return (
      <div style={{ minHeight: '100svh', display: 'grid', placeItems: 'center', background: '#0a0614', color: '#fff', padding: '2rem', textAlign: 'center', fontFamily: 'system-ui, sans-serif' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Something went wrong</h1>
          <p style={{ marginTop: '.5rem', color: 'rgba(255,255,255,.6)' }}>Please reload the page. If it keeps happening, tell the Sipna AWS Club team.</p>
          <button
            type="button"
            onClick={() => window.location.assign('/')}
            style={{ marginTop: '1.25rem', border: 0, borderRadius: 999, background: '#8c4fff', color: '#fff', padding: '.8rem 1.6rem', fontWeight: 600, cursor: 'pointer' }}
          >
            Reload the site
          </button>
        </div>
      </div>
    )
  }
}
