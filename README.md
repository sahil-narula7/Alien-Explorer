# Alien Explorer

A browser-based educational space adventure game that teaches Maths, Science, Logic, Reasoning, and Applied thinking through interactive quiz missions.

## Overview

Alien Explorer puts the player in command of the starship *Odyssey*, which has landed on the *Planet of Ruin*. Five alien crew members each guide the player through a learning mission in their specialist domain. The player answers quiz questions, earns XP, levels up, and tracks their accuracy across sessions — all without creating an account or installing anything.

The game runs entirely in the browser. Progress is saved locally using `localStorage`.

## Live Demo

**http://alien-explorer-hackathon-2026.s3-website-us-east-1.amazonaws.com/**

Hosted on Amazon S3 static website hosting. No login required.

## Features

- Five distinct learning domains across 25 questions
- Three-level progressive hints per question
- Two-attempt limit per question — prevents random guessing
- XP awarded on first-attempt correct answers only
- Level progression with increasing XP thresholds
- First-attempt accuracy tracked globally and per crew member
- Persistent player profile — name, XP, level, missions, and crew progress survive page refresh
- Logout support — clears the session and replays the story introduction
- Responsive layout — works on desktop, tablet, and mobile
- Synthesised sound effects via the Web Audio API (no audio files)
- Sound toggle that persists across sessions
- Animated scenes built with Framer Motion

## Learning Crew

| Crew Member  | Domain                       | Focus                                             |
|--------------|------------------------------|---------------------------------------------------|
| Sam          | Mathematics                  | Division, multiplication, addition, word problems |
| Vela Zorn    | Science                      | Percentages, exponential growth, averages         |
| Krix-7       | Logic & Systems              | Sequences, ordering rules, deductive reasoning    |
| Luma         | Reasoning & Critical Thinking | Distance/rate, probability, logical inference     |
| Orion Vale   | Applied / Mixed Challenges   | Real-world maths, perimeter, speed, pacing        |

## Gameplay Flow

```
Story / Introduction
  → Captain Designation (name entry)
    → Dashboard
      → Select crew member
        → Planet of Ruin
          → Quiz Mission (5 questions)
            → Progressive hints on wrong answers
            → XP awarded on first-attempt correct
            → Mission complete screen
              → Dashboard (progress updated)
```

Returning players skip the story and go directly to the Dashboard.

## Tech Stack

| Technology     | Usage                                              |
|----------------|----------------------------------------------------|
| React 19       | UI framework, component tree, state management     |
| Vite 8         | Build tool and development server                  |
| Framer Motion  | Scene transitions and component animations         |
| Web Audio API  | Procedural sound effects (no audio files)          |
| localStorage   | Persistent player profile                          |
| Amazon S3      | Static website hosting and asset delivery          |
| CSS-in-JS      | Inline styles and injected keyframe animations     |

## Project Structure

```
alien-explorer/
├── public/
│   └── favicon.png
├── src/
│   ├── assets/              # (empty after cleanup)
│   ├── components/
│   │   ├── StarField.jsx    # Animated background starfield
│   │   ├── XPAnimation.jsx  # Floating XP gain animation
│   │   └── ZyroCharacter.jsx# Alien tutor character with speech bubble
│   ├── context/
│   │   └── GameContext.jsx  # Global state, reducer, localStorage persistence
│   ├── hooks/
│   │   └── useSound.js      # Web Audio API sound engine
│   ├── scenes/
│   │   ├── IntroScene.jsx
│   │   ├── StoryScene.jsx
│   │   ├── CrewScene.jsx
│   │   ├── LaunchScene.jsx
│   │   ├── SpaceScene.jsx
│   │   ├── PlanetArrivalScene.jsx
│   │   ├── NameEntryScene.jsx
│   │   ├── DashboardScene.jsx
│   │   ├── PlanetExploreScene.jsx
│   │   └── MissionScene.jsx
│   ├── App.jsx              # Scene router
│   ├── main.jsx             # React entry point
│   └── index.css            # Global reset and shared utilities
├── index.html
├── vite.config.js
├── package.json
└── SUBMISSION.md            # Hackathon submission document
```

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Production Build

```bash
npm run build
```

Output is written to `dist/`. The build produces:
- `dist/index.html`
- `dist/assets/index-*.js` (bundled application)
- `dist/assets/index-*.css`
- `dist/favicon.png`

## Deployment

The production build is deployed to **Amazon S3 static website hosting**:

```bash
aws s3 sync dist/ s3://alien-explorer-hackathon-2026/ --delete \
  --cache-control "public,max-age=31536000,immutable" \
  --exclude "*.html"

aws s3 cp dist/index.html s3://alien-explorer-hackathon-2026/index.html \
  --content-type "text/html" \
  --cache-control "public,max-age=0,must-revalidate"
```

**Current deployment:** Amazon S3 static website (HTTP). CloudFront / HTTPS is not currently configured.

## Player Persistence

Player progress is stored in `localStorage` under the key `alienExplorerPlayer`. The profile includes:

- `playerId` — unique identifier generated on first play
- `captain` — name, level, XP, skills, accuracy counters
- `crewProgress` — per-crew missions, XP, accuracy
- `settings` — sound enabled/disabled
- `profileCreatedAt` / `updatedAt` — timestamps

The save guard in `GameContext.jsx` only writes to localStorage when both `playerId` and `captain.name` are set, preventing default state from overwriting a valid saved profile on mount.

## Development with Kiro

This project was built using **Kiro** (AWS AI coding agent) as the primary development tool. Kiro was used for:

- Application architecture and scene routing
- Game mechanics (quiz engine, XP system, accuracy tracking)
- All scene and component implementation
- localStorage persistence design
- Responsive layout fixes (CSS Grid, mobile scroll)
- Sound synthesis (Web Audio API)
- Bug diagnosis and targeted fixes
- AWS S3 deployment and verification

## Testing

No automated test suite is configured. The following were verified manually during development:

- First-time user flow: intro → name entry → dashboard
- Returning user: refresh restores name, XP, level, crew progress
- Logout: clears profile, returns to intro
- Refresh after logout: stays on intro
- All five crew missions selectable and completable
- Two-attempt limit per question
- Progressive hints on wrong answers
- XP awarded only on first-attempt correct answers
- Production build: `npm run build` completes with no errors

## License

No license has been specified for this project.
