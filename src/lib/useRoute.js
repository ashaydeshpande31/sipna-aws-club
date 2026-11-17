import { useEffect, useState } from 'react'

export const currentPath = () => window.location.pathname.replace(/\/+$/, '') || '/'

/** Returns the current page path and re-renders when it changes (links, back and forward buttons). */
export function useRoute() {
  const [path, setPath] = useState(currentPath)
  useEffect(() => {
    const on = () => setPath(currentPath())
    window.addEventListener('popstate', on)
    window.addEventListener('aws:route', on)
    return () => {
      window.removeEventListener('popstate', on)
      window.removeEventListener('aws:route', on)
    }
  }, [])
  return path
}
