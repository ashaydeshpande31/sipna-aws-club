// ============================================================
//  TEAM  (read from src/data/team.json)
//
//  The easiest way to change the team is the admin page:  /admin
//  You can also edit  src/data/team.json  by hand:
//   1) Put the photo in   src/assets/team/   (lowercase, no spaces, e.g. arpita.jpg)
//   2) Add a block to "members" (or "core") in team.json and write the file name in "photo".
//
//  The order of the blocks is the order they appear on the site.
//  Leave a link as "" if the person doesn't have it (its icon is hidden).
//  The filter chips (Technical, Design, Events ...) are picked from the
//  position text automatically. Add "domain": "Technical" to force one.
// ============================================================

import data from './team.json'
import { getTeamPhoto } from '../lib/teamPhoto'

const photoFiles = import.meta.glob('../assets/team/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}', {
  eager: true,
  query: '?url',
  import: 'default',
})
const byName = {}
for (const [path, url] of Object.entries(photoFiles)) byName[path.split('/').pop().toLowerCase()] = url

const withImg = ({ photo, ...p }) => ({ ...p, img: byName[String(photo || '').trim().toLowerCase()] || '' })

// Group photo (wide banner at the top of the Team section).
// Replace the photo in src/assets/team-photo/ . No photo there = the banner stays hidden.
export const TEAM_PHOTO = {
  src: getTeamPhoto(),
  caption: data.photo?.caption ?? 'The Sipna AWS Club family',
  date: data.photo?.date ?? '',
  focus: data.photo?.focus ?? 'center 30%',
}

export const LEADER = withImg(data.leader)
export const CORE_TEAM = data.core.map(withImg)
export const MEMBERS = data.members.map(withImg)

// ============================================================
//  Helpers (no need to edit below this line)
// ============================================================

export const ALL_PEOPLE = [LEADER, ...CORE_TEAM, ...MEMBERS]

const DOMAIN_RULES = [
  ['Technical', /tech/i],
  ['Design', /design/i],
  ['Events', /event/i],
  ['Marketing & Media', /market|publicity|content|social|sponsor/i],
  ['Management', /manage/i],
]

export const DOMAIN_ORDER = [
  'Technical',
  'Design',
  'Events',
  'Marketing & Media',
  'Management',
  'General',
]

export function getDomain(person) {
  if (person.domain) return person.domain
  for (const [name, rule] of DOMAIN_RULES) if (rule.test(person.position)) return name
  return 'General'
}

export function getInitials(name) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}
