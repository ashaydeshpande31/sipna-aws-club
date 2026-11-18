// The pages of the site. Every old section now has its own page (its own address).
// "ids" are the old section ids: scrollToId('join') now simply opens the /join page.
export const PAGES = [
  { path: '/', ids: ['home'], label: 'Home' },
  { path: '/about', ids: ['about', 'benefits'], label: 'About' },
  { path: '/journey', ids: ['journey'], label: 'Journey' },
  { path: '/events', ids: ['events', 'winners'], label: 'Events' },
  { path: '/upcoming', ids: ['upcoming'], label: 'Upcoming' },
  { path: '/team', ids: ['team'], label: 'Team' },
  { path: '/learn', ids: ['learn'], label: 'Learn' },
  { path: '/connect', ids: ['connect'], label: 'Connect' },
  { path: '/faq', ids: ['faq'], label: 'FAQ' },
  { path: '/play', ids: ['play'], label: 'Play' },
  { path: '/news', ids: ['news'], label: 'News' },
  { path: '/privacy', ids: ['privacy'], label: 'Privacy Policy' },
  { path: '/terms', ids: ['terms'], label: 'Terms of Use' },
  { path: '/conduct', ids: ['conduct'], label: 'Code of Conduct' },
  { path: '/join', ids: ['join'], label: 'Join' },
]

export const pathForId = (id) => (PAGES.find((p) => p.ids.includes(id)) || PAGES[0]).path
export const pageFor = (path) => PAGES.find((p) => p.path === path)
