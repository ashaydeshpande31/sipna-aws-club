import S from '../data/settings.json'

// Pages the admin can switch off (/admin > Site controls). Home, About, Join and the legal pages always stay.
export const HIDEABLE = ['/events', '/upcoming', '/team', '/learn', '/connect', '/faq', '/play', '/news']
const OFF = new Set((S.hiddenPages || []).filter((p) => HIDEABLE.includes(p)))
export const isHidden = (path) => OFF.has(path)

// The pages of the site. Every old section now has its own page (its own address).
// "ids" are the old section ids: scrollToId('join') now simply opens the /join page.
export const PAGES = [
  { path: '/', desc: 'Sipna AWS Club at Sipna COET, Amravati. Learn Amazon Web Services, join hands-on cloud workshops and connect with student builders.', ids: ['home', 'journey'], label: 'Home' },
  { path: '/about', desc: 'Our mission, vision and what you get from joining Sipna AWS Club: AWS learning, hands-on workshops, community and career growth.', ids: ['about', 'benefits'], label: 'About' },
  { path: '/events', desc: 'Photos, videos and winners from past Sipna AWS Club events, workshops and competitions at Sipna COET.', ids: ['events', 'winners'], label: 'Events' },
  { path: '/upcoming', desc: 'The next Sipna AWS Club event: date, venue and how to take part.', ids: ['upcoming'], label: 'Upcoming' },
  { path: '/team', desc: 'Meet the students who run Sipna AWS Club at Sipna COET, Amravati.', ids: ['team'], label: 'Team' },
  { path: '/learn', desc: 'A simple learning path from AWS cloud basics to certification, with free resources.', ids: ['learn'], label: 'Learn' },
  { path: '/connect', desc: 'Contact Sipna AWS Club: send a message, find our address, or reach us on WhatsApp, Instagram and LinkedIn.', ids: ['connect'], label: 'Connect' },
  { path: '/faq', desc: 'Answers to common questions about joining Sipna AWS Club.', ids: ['faq'], label: 'FAQ' },
  { path: '/play', desc: 'Play the AWS cloud quiz and the architecture puzzle by Sipna AWS Club, and see the leaderboard.', ids: ['play'], label: 'Play' },
  { path: '/news', desc: 'Official news and announcements from the Sipna AWS Club core team.', ids: ['news'], label: 'News' },
  { path: '/privacy', desc: 'How the Sipna AWS Club website handles your information.', ids: ['privacy'], label: 'Privacy Policy' },
  { path: '/terms', desc: 'Terms of use for the Sipna AWS Club website.', ids: ['terms'], label: 'Terms of Use' },
  { path: '/conduct', desc: 'The Sipna AWS Club code of conduct for events and community spaces.', ids: ['conduct'], label: 'Code of Conduct' },
  { path: '/join', desc: 'Join Sipna AWS Club and get every update about workshops and events.', ids: ['join'], label: 'Join' },
]

export const pathForId = (id) => (PAGES.find((p) => p.ids.includes(id)) || PAGES[0]).path
export const pageFor = (path) => {
  const p = PAGES.find((x) => x.path === path)
  return p && !OFF.has(p.path) ? p : undefined // a switched-off page behaves like a page that does not exist
}
export const linkVisible = (id) => !OFF.has(pathForId(id))
