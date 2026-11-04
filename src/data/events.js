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
    date: '3 August 2026', // e.g. '12 Aug 2026'  (keep the quotes)
    description:
      'The day Sipna AWS Club officially began: our first gathering of students curious about cloud computing.',
    participants: 150, // number of attendees, no quotes. 0 hides it
    highlights: ['Chief guest talk', 'Club roadmap revealed'], // e.g. ['Chief guest talk', 'Club roadmap revealed']
    instagram: 'https://www.instagram.com/reel/DbtNDtDzJZ8/?vrfl=MWI2cm9tdTVpaG9waw==', // optional YouTube link instead of video.mp4
  },
    {
    id: 'codorithm-2k26', // folder: src/assets/events/codorithm-2k26/
    title: 'Codorithm 2K26-A',
    category: 'Competition',
    date: '8 Sep 2026',
    description:
      'Our first competition, where students put their problem-solving skills to the test and battled for the podium.',
    participants: 193,
    highlights: [
      'Coding questions held on the HackerRank platform',
      '193 participants from different branches',
      '10:30 AM to 5:30 PM at the Department of Information Technology, Sipna COET',
      'Cash prizes of ₹11,000, ₹9,000 and ₹7,000 with memento and certificate',
    ],
    youtube: '',
  },
    {
    id: 'portfolio-hosting', // folder: src/assets/events/portfolio-hosting/
    title: 'Host Your Portfolio on AWS',
    category: 'Online Workshop',
    date: '1 Nov 2026',
    description:
      'A hands-on online workshop where students took their portfolio websites live on the internet using Amazon S3.',
    participants: 0, // put the real number of attendees here, 0 hides it
    highlights: [
      'Hosted a portfolio website using Amazon S3',
      'Configured static website hosting on AWS',
      'Deployed the website and got a live URL',
      'Speaker: Aishwary Gathe, DevRel @ meetio, Community Builder with 3+ years of experience',
      'Online on Google Meet at 8:00 PM',
      'E-certificates for participants who met the attendance requirement',
    ],
    youtube: '',
    instagram: '',
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
export const UPCOMING_EVENT = {
  title: '', // e.g. 'AWS Cloud Practitioner Kickoff'
  date: '', // ISO with India offset, e.g. '2026-12-12T10:00:00+05:30'
  durationHours: 2,
  venue: '', // e.g. 'Seminar Hall, Sipna COET'
  description: '',
  registerUrl: '', // Google Form link. Empty = falls back to the Join section
}
