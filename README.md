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

## Edit it with the admin page

Open `/admin` on the live site (https://sipnaaws-club.vercel.app/admin) and log in.
You can add, edit, delete and reorder team members and past events, upload photos,
replace the team group photo and set the upcoming event. **Save & publish** commits to GitHub
and Vercel redeploys in about a minute.

It needs two Environment Variables in Vercel (Settings, Environment Variables), then a redeploy:

| Variable | What it is |
| --- | --- |
| `ADMIN_PASSWORD` | the password for `/admin` |
| `GITHUB_TOKEN` | fine-grained GitHub token for this repo only, with Contents: Read and write |

The admin page commits straight to `main`, so run `git pull` before you push from your laptop.
`npm run dev` does not serve `/api`, so saving only works on the deployed site (or `vercel dev`).

## Edit it by hand (only 2 places each)

| What | Photos / videos | Data |
| --- | --- | --- |
| Team member | `src/assets/team/` | `src/data/team.json` |
| Team group photo | `src/assets/team-photo/` | `photo` in `src/data/team.json` |
| Past event | `src/assets/events/<event-id>/` (`1.jpg`, `2.jpg`, `video.mp4`) | `src/data/pastEvents.json` (same `id` as the folder) |
| Upcoming event | n/a | `src/data/upcoming.json` |
| Hall of Fame | `src/assets/winners/` | `HOF` in `src/data/events.js` |
| Links, footer credit, text | n/a | `src/data/site.js` |

## Publish a change

```bash
git add .
git commit -m "what you changed"
git push
```

Then check Vercel, Deployments, for **Ready**.
