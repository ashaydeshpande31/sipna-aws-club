// ============================================================
//  OFFICIAL NOTICES  (the /news page and the bar at the very top of the site)
//  Edit here, push to GitHub, done. Newest first. Dates are YYYY-MM-DD.
// ============================================================

// The thin bar at the top of every page. Set text to '' to hide it completely.
export const ANNOUNCEMENT = {
  text: 'Join our WhatsApp community to get every event update first.',
  linkLabel: 'Join now',
  linkTo: '/join', // a page of this site (like /news) or a full https:// link
}

// kind: 'Notice' | 'Event' | 'Update' | 'Achievement'  (any word works, it is shown as a tag)
export const NEWS = [
  {
    date: '2026-11-18',
    kind: 'Update',
    title: 'The new Sipna AWS Club website is live',
    text: 'Every section now has its own page, with an events archive, FAQ, a contact page and a faster experience on phones.',
  },
  {
    date: '2026-07-01',
    kind: 'Notice',
    title: 'Sipna AWS Club started',
    text: 'The AWS Student Builder Group at Sipna COET began its journey to bring hands-on cloud learning to every student.',
    // optional: link: '/about', linkLabel: 'Read more',
  },
]
