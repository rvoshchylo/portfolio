# PortOS: Ruslan Voshchylo's portfolio

**Live:** https://rvoshchylo.github.io/portfolio/

A developer portfolio styled as a tiny desktop OS. A 3D device boots and logs in, then the camera dives into its screen and you land on a desktop with draggable windows, a dock and a working terminal.

The intro device matches the screen width:

| Width | Intro |
| --- | --- |
| < 768px | a phone lying face-down flips over and wakes |
| 768–1199px | a tablet's folio cover swings open like a book; the tablet follows the screen orientation |
| ≥ 1200px | a laptop lid opens while the camera orbits to the front |

**Stack:** React 18 · TypeScript · Vite · Tailwind CSS · Vitest · Playwright · GitHub Pages

## What's inside

| Window | What it shows |
| --- | --- |
| `about.exe` | Bio, stats, résumé download |
| `experience.exe` | SoftKit and VISO as a `git log --graph`, plus education; project chips deep-link into projects |
| `projects.exe` | Aksel, Gogeta, Teach Aid, Tripami: cards with metrics and a detail view per project |
| `skills.exe` | Five skill groups from the CV |
| `contact.exe` | Email, GitHub, LinkedIn, Telegram, plus a validated form that opens a pre-filled email draft |
| `terminal` | `help`, `whoami`, `ls`, `cat projects/aksel`, `open skills`, `resume`, `hire-me`… with history and tab completion |

Other details:

- The boot intro plays once per browser session. Click or press any key to skip it. `?boot` forces it, `?skip` disables it, and it is skipped automatically when the visitor prefers reduced motion.
- `#projects`, `#contact` and so on open that window directly, and the hash follows the focused window, so links are shareable.
- On phones, windows open full-screen and icons open with a single tap.
- Keyboard: `Esc` closes the focused window, `⌥T` opens a terminal, and double-clicking a titlebar maximizes it.

## Editing content

Everything (bio, jobs, projects, skills, links) lives in **`src/data/profile.ts`**. The résumé PDF is `public/Ruslan_Voshchylo_CV.pdf`; replace it with a file of the same name.

## Development

```bash
npm install
npm run dev          # http://localhost:5173
npm test             # unit tests (window manager, terminal, contact form)
npm run test:e2e     # Playwright: boot, every window, drag/minimize, terminal, mobile
npm run build        # production build to dist/
```

## Deploy

Every push to `main` runs the type check, the unit tests and the e2e tests, then deploys `dist/` to GitHub Pages (`.github/workflows/deploy.yml`). One-time setup: **Settings → Pages → Source: GitHub Actions**.

The build uses a relative base, so it works both as `https://<user>.github.io/` and as `https://<user>.github.io/<repo>/`.
