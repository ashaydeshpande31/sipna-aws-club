// Minimal service worker: it only makes the site installable ("Add to Home screen").
// It does NOT cache anything, so visitors always get the newest version of the site.
self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()))
self.addEventListener('fetch', () => {})
