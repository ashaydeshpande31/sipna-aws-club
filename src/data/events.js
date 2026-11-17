// ============================================================
//  EVENTS  (past events, winners, student showcase, upcoming event)
//
//  Past events and the upcoming event are edited from the admin page (/admin)
//  or by hand in  src/data/pastEvents.json  and  src/data/upcoming.json
//  NEW PAST EVENT by hand = 2 places:
//   1) Make a folder:  src/assets/events/<id>/   and drop photos 1.jpg, 2.jpg, 3.jpg ...
//      (add video.mp4 there too, OR put a YouTube link in "youtube")
//   2) Add a block to pastEvents.json with the same <id>.
// ============================================================

import { getEventMedia } from '../lib/eventMedia'
import { getWinnerPhoto } from '../lib/winnerPhotos'
import PAST from './pastEvents.json'
import UPCOMING from './upcoming.json'

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
    event: 'Codorithm 2K26-A',
    date: '8 Sep 2026',
    places: [
      {
        rank: 1,
        name: 'Aniruddh Umbarkar & Umer Khan',
        detail: '',
        photo: 'winner.jpg',
        prize: '₹11,000 Cash Prize',
        extras: ['Memento', 'Certificate'],
      },
      {
        rank: 2,
        name: 'Pranav Mavle',
        detail: '',
        photo: 'second.jpg',
        prize: '₹9,000 Cash Prize',
        extras: ['Memento', 'Certificate'],
      },
      {
        rank: 3,
        name: 'Rishi Maskare',
        detail: '',
        photo: 'third.jpg',
        prize: '₹7,000 Cash Prize',
        extras: ['Memento', 'Certificate'],
      },
    ],
  },
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
      focus: p.focus || 'center',
      prize: p.prize || '',
      extras: p.extras || [],
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
export const UPCOMING_EVENT = UPCOMING
