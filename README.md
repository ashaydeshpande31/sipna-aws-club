# Sipna AWS Club Website

Official website of the **Sipna AWS Club** (AWS Student Builder Group, Sipna COET, Amravati).
Live: https://sipnaaws-club.vercel.app

## Built with

React 19, Vite, Tailwind CSS, GSAP (scroll animations), Lenis (smooth scroll), Three.js (3D background).
Hosted on Vercel. Every `git push` to `main` goes live automatically.

## What is on the site

Hero, stats, mission and vision, benefits, event journey with photos and videos, Hall of Fame (winners with prizes),
upcoming event with countdown, team with group photo, AWS learning path, join section (opens the WhatsApp community),
and a hidden terminal (type `aws` anywhere).

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build, must end with "built"
```

## Edit it (only 2 places each)

| What | Photos / videos | Data |
| --- | --- | --- |
| Team member | `src/assets/team/` | `src/data/team.js` |
| Team group photo | `src/assets/team-photo/` | `TEAM_PHOTO` in `src/data/team.js` |
| Past event | `src/assets/events/<event-id>/` (`1.jpg`, `2.jpg`, `video.mp4`) | `PAST` in `src/data/events.js` (same `id` as the folder) |
| Hall of Fame | `src/assets/winners/` | `HOF` in `src/data/events.js` |
| Links, footer credit, text | n/a | `src/data/site.js` |

## Publish a change

```bash
git add .
git commit -m "what you changed"
git push
```

Then check Vercel, Deployments, for **Ready**.
