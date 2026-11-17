import { StrictMode, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'

import '@fontsource-variable/sora'
import '@fontsource-variable/inter'
import '@fontsource/jetbrains-mono/400.css'
import '@fontsource/jetbrains-mono/500.css'
import './index.css'

import App from './App.jsx'

// /admin opens the admin page (loaded only when needed, so the public site stays light)
const Admin = lazy(() => import('./admin/Admin.jsx'))
const isAdmin = window.location.pathname.replace(/\/+$/, '') === '/admin'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {isAdmin ? (
      <Suspense fallback={null}>
        <Admin />
      </Suspense>
    ) : (
      <App />
    )}
  </StrictMode>,
)
