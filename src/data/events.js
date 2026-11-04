// ============================================================
//  EVENTS  (past events, winners, student showcase, upcoming event)
//
//  NEW PAST EVENT = 2 places:
//   1) Make a folder:  src/assets/events/<id>/   and drop photos 1.jpg, 2.jpg, 3.jpg ...
//      (add video.mp4 there too, OR put a YouTube link in `youtube` below)
//   2) Add a block to PAST_EVENTS below with the same <id>.
// ============================================================

import { getEventMedia } from '../lib/eventMedia'
import { getWinnerPhoto } from '../lib/winnerPhotos'

const PAST = [
  {
    id: 'inauguration', // folder: src/assets/events/inauguration/
    title: 'Club Inauguration',
    category: 'Launch',
    date: '', // e.g. '12 Aug 2026'
    description:
      'The day Sipna AWS Club officially began: our first gathering of students curious about cloud computing.',
    participants: 0, // number of attendees (0 = hidden)
    highlights: [], // e.g. ['Chief guest talk', 'Club roadmap revealed']
    youtube: '', // optional YouTube link instead of video.mp4
  },
  {
    id: 'coding-competition', // folder: src/assets/events/coding-competition/
    title: 'Coding Competition',
    category: 'Competition',
    date: '',
    description:
      'Our first competition, where students put their problem-solving skills to the test and battled for the podium.',
    participants: 0,
    highlights: [],
    youtube: '',
  },
  {
    id: 'portfolio-hosting', // folder: src/assets/events/portfolio-hosting/
    title: 'Online Portfolio Hosting',
    category: 'Online Workshop',
    date: '',
    description:
      'A hands-on online session where students took their portfolio websites live on the internet.',
    participants: 0,
    highlights: [],
    youtube: '',
  },
]

// Photos and video are attached automatically from the folders above.
export const PAST_EVENTS = PAST.map((e) => ({ ...e, ...getEventMedia(e.id) }))

// ------------------------------------------------------------
//  HALL OF FAME  (podium with photos: winner, 1st runner up, 2nd runner up)
//
//  NEW COMPETITION OR HACKATHON = 2 places:
//   1) Put the winners' photos in   src/assets/winners/   (e.g. ritesh.jpg)
//   2) Add a block to HOF below and write the file name in `photo`.
//
//  `name` can be a person or a team name. `detail` is the small line under it
//  (e.g. 'IT, 3rd Year' or the team members). Leave a name empty to show
//  "To be announced". When there are 2 or more blocks, tabs appear automatically.
// ------------------------------------------------------------
const HOF = [
  {
    id: 'coding-competition',
    event: 'Coding Competition',
    date: '', // e.g. '15 Sep 2026'
    places: [
      { rank: 1, name: '', detail: '', photo: '' }, // Winner          photo: 'name.jpg'
      { rank: 2, name: '', detail: '', photo: '' }, // 1st Runner Up
      { rank: 3, name: '', detail: '', photo: '' }, // 2nd Runner Up
    ],
  },
  // Copy the block above for the next one, for example:
  // {
  //   id: 'hackathon',
  //   event: 'Hackathon',
  //   date: '10 Jan 2027',
  //   places: [
  //     { rank: 1, name: 'Team Cloudbusters', detail: 'Ritesh, Parth, Ansh', photo: 'cloudbusters.jpg' },
  //     { rank: 2, name: '...', detail: '...', photo: '...' },
  //     { rank: 3, name: '...', detail: '...', photo: '...' },
  //   ],
  // },
]

const DEFAULT_LABEL = { 1: 'Winner', 2: '1st Runner Up', 3: '2nd Runner Up' }

// Photos are attached automatically from src/assets/winners/
export const HALL_OF_FAME = HOF.map((c) => ({
  ...c,
  places: [1, 2, 3].map((rank) => {
    const p = c.places.find((x) => x.rank === rank) || {}
    return {
      rank,
      name: p.name || '',
      detail: p.detail || '',
      label: p.label || DEFAULT_LABEL[rank], // optional: add  label: '...'  to change the small tag
      photo: getWinnerPhoto(p.photo),
    }
  }),
}))

// ------------------------------------------------------------
//  STUDENT SHOWCASE  (portfolios hosted in the portfolio session)
//  Add one line per student. Leave the list empty to show placeholders.
// ------------------------------------------------------------
export const SHOWCASE = [
  // { name: 'Student Name', url: 'https://their-portfolio.com', tag: 'IT, 2nd Year' },
]

// ------------------------------------------------------------
//  UPCOMING EVENT
//  Fill these in and the countdown appears automatically.
//  Leave `date` empty to show a "next event coming soon" card instead.
// ------------------------------------------------------------
export const UPCOMING_EVENT = {
  title: '', // e.g. 'AWS Cloud Practitioner Kickoff'
  date: '', // ISO with India offset, e.g. '2026-12-12T10:00:00+05:30'
  durationHours: 2,
  venue: '', // e.g. 'Seminar Hall, Sipna COET'
  description: '',
  registerUrl: '', // Google Form link. Empty = falls back to the Join section
}
