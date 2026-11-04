# Sipna AWS Club website

React + Vite + Tailwind + GSAP + Lenis + Three.js. Purple AWS Student Builder Group look.

## Run it

```bash
npm install
npm run dev       # opens on http://localhost:5173
npm run build     # production build into /dist
```

Needs Node 20.19 or newer.

## Deploy on Vercel

1. Push this folder to a GitHub repository.
2. On vercel.com choose **Add New, Project**, pick the repository. Vercel detects Vite by itself.
3. Press **Deploy**.
4. After you know the final link, replace `https://sipnaawsclub.vercel.app` in `index.html`,
   `public/robots.txt` and `public/sitemap.xml` (this is what WhatsApp and LinkedIn show in the link preview).

## Editing: always 2 places

### Add or change a team member

1. **Photo** goes in `src/assets/team/` (lowercase, no spaces, e.g. `arpita.jpg`).
2. **Data** goes in `src/data/team.js`: add one `import` line at the top, then one block in `MEMBERS`
   (or `CORE_TEAM`).

```js
import arpita from '../assets/team/arpita.jpg'

{
  name: 'Arpita Kale',
  position: 'Team Member (Design)',
  department: IT,
  year: '2nd Year',
  img: arpita,
  socials: { linkedin: 'https://...', github: '', instagram: 'https://...' },
},
```

The order you write the blocks is the order on the website. A link left as `''` hides that icon.
The filter chips (Technical, Design, Events ...) are chosen from the position text automatically.

### Add a past event

1. **Photos and video** go in a new folder `src/assets/events/<event-id>/`
   - photos: `1.jpg`, `2.jpg`, `3.jpg` ...
   - video (optional): `video.mp4` (keep it under about 25 MB, or use a YouTube link instead)
2. **Data** goes in `src/data/events.js`: add one block to `PAST` with the **same** `id` as the folder.

```js
{
  id: 'cloud-quiz',               // folder: src/assets/events/cloud-quiz/
  title: 'Cloud Quiz',
  category: 'Competition',
  date: '20 Dec 2026',
  description: 'A fast quiz on AWS basics.',
  participants: 85,
  highlights: ['40 teams', 'Prizes for top 3'],
  youtube: '',                    // optional, a YouTube link works instead of video.mp4
},
```

Photos, the video player, the film reel card, the journey timeline, the stats counters and the
terminal all pick the event up automatically.

### Add a competition or hackathon to the Hall of Fame

1. **Photos** of the winners go in `src/assets/winners/` (e.g. `ritesh.jpg`).
2. **Data** goes in `src/data/events.js`: add a block to `HOF` and write the file name in `photo`.

```js
{
  id: 'hackathon',
  event: 'Hackathon',
  date: '10 Jan 2027',
  places: [
    { rank: 1, name: 'Team Cloudbusters', detail: 'Ritesh, Parth, Ansh', photo: 'cloudbusters.jpg' },
    { rank: 2, name: '...', detail: '...', photo: '...' },
    { rank: 3, name: '...', detail: '...', photo: '...' },
  ],
},
```

With two or more blocks, tabs (Coding Competition / Hackathon) appear by themselves.
The small tags are Winner, 1st Runner Up and 2nd Runner Up. Add `label: '...'` to a place to change one.

### Everything else (all in `src/data/`)

| What | File |
| --- | --- |
| Upcoming event + countdown (fill `date` and it switches on) | `events.js` → `UPCOMING_EVENT` |
| Hall of Fame podium (winner, 1st and 2nd runner up, with photos) | `events.js` → `HOF` |
| Student portfolio showcase | `events.js` → `SHOWCASE` |
| Join form link, WhatsApp link, social links, founded date, footer credit | `site.js` → `SITE` |
| Hero, Mission, Vision, Benefits, learning path, FAQ text | `site.js` |

The stat numbers (members, events, months active) are calculated from these files.

## Things to fill before showing it

- [ ] Event photos and videos, plus real dates, attendee counts and highlights
- [ ] Coding competition winners
- [ ] Upcoming event details
- [ ] Google Form link (`SITE.links.joinForm`), until then the button says "Registration opening soon"
- [ ] WhatsApp community link (hidden until set)
- [ ] Check the three social links in `site.js` are the real club accounts
- [ ] `founded: '2026-07-01'` in `site.js` is a guess, set the real date
- [ ] Domain in `index.html`, `robots.txt`, `sitemap.xml` after deploying

## Easter egg

Type `aws` anywhere on the page (or use the button in the footer) to open the cloud terminal.
Try `help`, `aws team ls`, `aws events ls`, `aws s3 ls`, `aws join`.
