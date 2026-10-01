# Alien Explorer

A browser-based educational space adventure game that teaches **Maths, Science, Logic, Reasoning, and Applied Thinking** through interactive quiz missions.

### Live Demo

**[Play Alien Explorer](http://alien-explorer-hackathon-2026.s3-website-us-east-1.amazonaws.com/)**

## Overview

Alien Explorer puts the player in command of the starship *Odyssey*, which has landed on the *Planet of Ruin*. Five alien crew members guide the player through learning missions in their specialist domains.

Players answer questions, earn XP, level up, and track accuracy across missions — without creating an account or installing an application.

The game runs entirely in the browser, with player progress persisted locally using `localStorage`.

## Features

- Five learning domains across 25 questions
- Three-level progressive hints
- Two-attempt limit per question
- XP awarded on first-attempt correct answers
- Level progression with increasing XP thresholds
- Global and crew-specific first-attempt accuracy
- Persistent player profile
- Captain name, XP, level, mission, and crew progress persistence
- Logout and new-player flow
- Responsive desktop, tablet, and mobile layouts
- Procedural sound effects using the Web Audio API
- Persistent sound toggle
- Animated scenes using Framer Motion
- No account or installation required

## 👨‍🚀 Learning Crew

| Crew Member | Domain | Focus |
|---|---|---|
| **Sam** | Mathematics | Division, multiplication, addition, word problems |
| **Vela Zorn** | Science | Percentages, exponential growth, averages |
| **Krix-7** | Logic & Systems | Sequences, ordering rules, deductive reasoning |
| **Luma** | Reasoning & Critical Thinking | Distance/rate, probability, logical inference |
| **Orion Vale** | Applied / Mixed Challenges | Real-world maths, perimeter, speed, pacing |

## Gameplay Flow

```text
Story / Introduction
        ↓
Captain Designation
        ↓
Dashboard
        ↓
Select Crew Member
        ↓
Planet of Ruin
        ↓
Quiz Mission
        ↓
Hints / Attempts
        ↓
XP & Accuracy Update
        ↓
Mission Complete
        ↓
Dashboard
```

Returning players with a saved profile skip the introduction and continue from the dashboard.

## 🛠️ Tech Stack

| Technology | Usage |
|---|---|
| React 19 | UI, components, and state management |
| Vite 8 | Build tool and development server |
| Framer Motion | Scene transitions and animations |
| Web Audio API | Procedural sound effects |
| `localStorage` | Persistent player profile |
| Amazon S3 | Static website hosting |
| CSS-in-JS | Inline styles and injected animations |

## 📁 Project Structure

```text
alien-explorer/
├── public/
│   └── favicon.png
├── src/
│   ├── components/
│   │   ├── StarField.jsx
│   │   ├── XPAnimation.jsx
│   │   └── ZyroCharacter.jsx
│   ├── context/
│   │   └── GameContext.jsx
│   ├── hooks/
│   │   └── useSound.js
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
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── vite.config.js
├── package.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js
- npm

### Installation

```bash
npm install
```

### Development Server

```bash
npm run dev
```

Open:

```text
http://localhost:5173
```

## 📦 Production Build

Create a production build with:

```bash
npm run build
```

The output is generated in the `dist/` directory.

## ☁️ AWS Deployment

The current production deployment uses **Amazon S3 static website hosting**.

Example deployment commands:

```bash
aws s3 sync dist/ s3://alien-explorer-hackathon-2026/ --delete   --cache-control "public,max-age=31536000,immutable"   --exclude "*.html"

aws s3 cp dist/index.html s3://alien-explorer-hackathon-2026/index.html   --content-type "text/html"   --cache-control "public,max-age=0,must-revalidate"
```

### Current deployment

- **Service:** Amazon S3
- **Region:** `us-east-1`
- **Hosting:** S3 static website hosting
- **CloudFront:** Not currently configured
- **HTTPS:** Not currently configured

## 💾 Player Persistence

Player data is stored in the browser under:

```text
alienExplorerPlayer
```

The saved profile includes:

- `playerId`
- Captain name
- Level
- XP
- Skills
- Accuracy counters
- Crew progress
- Sound settings
- Profile timestamps

The application only writes the saved player profile when the required player identity information is available, helping prevent the initial default state from overwriting an existing profile.

## 🤖 Development with Kiro

Alien Explorer was developed using **Kiro**, an AWS AI coding agent.

Kiro was used for:

- Application architecture and scene routing
- Game mechanics
- Quiz and XP systems
- Accuracy tracking
- Scene and component implementation
- `localStorage` persistence
- Responsive layout fixes
- Mobile scrolling
- Web Audio sound synthesis
- Bug diagnosis and targeted fixes
- AWS S3 deployment and verification

The development workflow focused on inspecting the existing implementation, making targeted changes, and verifying the resulting behavior.

## 🧪 Testing

There is currently no automated test suite.

The following flows were manually verified:

- First-time user flow
- Captain name entry
- Returning-player persistence
- Refresh behavior
- Logout and profile reset
- All five crew missions
- Two-attempt question system
- Progressive hints
- First-attempt XP
- Accuracy tracking
- Sound toggle
- Responsive layouts
- Mobile mission scrolling
- Production build with `npm run build`

## 📌 Project Status

Alien Explorer is a completed hackathon project and is currently deployed as a public Amazon S3 static website.

## 📄 License

No license has currently been specified for this project.
