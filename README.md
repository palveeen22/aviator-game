# Aviator Game — Next.js + PixiJS

An Aviator crash game clone built with **Next.js 14**, **PixiJS 7**, **Zustand**, and **Web Audio API** for procedural sounds. Follows **Feature-Sliced Design (FSD)** architecture.

## Quick Start

```bash
# Clone Project 
git clone https://github.com/palveeen22/aviator-demo.git
cd aviator-demo

# Install dependencies
pnpm install

# Run development server
pnpm dev

# Open in browser
open http://localhost:3000
```

## How to Play

1. Enter your **bet amount** in the BET field (default 10¢, starting balance 1000¢)
2. Click **BET** to lock in your bet during the 5-second countdown
3. The plane takes off — the multiplier starts climbing from 1.00x
4. Click **CASH OUT** (or press **Space**) before the plane flies away
5. Set **AUTO @** to automatically cash out at a target multiplier
6. If you don't cash out in time — you lose your bet

## Project Structure (Feature-Sliced Design)

```
src/
├── app/                            # Next.js App Router
│   ├── layout.tsx
│   ├── page.tsx                    # Loads GameLayout with ssr: false
│   └── globals.css
│
├── widgets/
│   └── game-layout/ui/
│       └── GameLayout.tsx          # Main composition — boots engine, sound, keyboard
│
├── features/
│   ├── bet/ui/
│   │   └── BetPanel.tsx            # Bet input, quick-bet buttons, cash out CTA
│   └── sound/model/
│       └── useSoundEngine.ts       # Web Audio API sound engine
│
├── entities/
│   └── game/
│       ├── model/
│       │   ├── store.ts            # Zustand store — single source of truth
│       │   └── engine.ts           # Game state machine (countdown → fly → crash)
│       └── ui/
│           ├── Header.tsx          # Logo, balance display, mute toggle
│           ├── HistoryBar.tsx      # Previous round crash multipliers
│           ├── GameCanvas.tsx      # PixiJS canvas + HUD overlays
│           └── ResultToast.tsx     # Win / lose notification toast
│
└── shared/
    ├── types/game.ts               # TypeScript interfaces
    ├── lib/crashPoint.ts           # Crash point math, multiplier curve, flight path
    └── hooks/usePixiCanvas.ts      # PixiJS lifecycle + render loop
```

## Architecture

### Game State Machine

```
idle → countdown (5s) → flying → crashed → countdown → ...
```

The game loop runs via `requestAnimationFrame` inside `useGameEngine`. All state is synced to the Zustand store so every component reacts to changes automatically.

### PixiJS Rendering

- PixiJS is initialized with a dynamic import (SSR-safe for Next.js)
- The canvas is mounted to the DOM via a `containerRef`
- The render loop runs independently from React's re-render cycle
- `reactStrictMode: false` in `next.config.js` prevents PixiJS double-mount in development

### Crash Point Distribution

- **3%** chance of an instant crash at 1.00x
- **97%** exponential distribution: `cp = 0.99 / (1 - r)`
- House edge ~3%
- Max crash point capped at 200x

### Sound System (Web Audio API)

All sounds are procedurally generated — no audio files required.

| State | Sound |
|-------|-------|
| Lobby (idle / countdown) | Low 65 Hz drone + LFO wobble + random pentatonic chimes |
| Win (cash out) | Ascending C5 → E5 → G5 → C6 arpeggio + C7 shimmer |
| Lose (plane crash) | White noise burst + descending sawtooth 260 → 38 Hz |

Audio context starts suspended and resumes on the first user interaction (browser autoplay policy).

## Tech Stack

| Library | Version | Purpose |
|---------|---------|---------|
| Next.js | 14.2 | React framework (App Router) |
| React | 18 | UI |
| PixiJS | 7.4 | GPU-accelerated canvas rendering |
| Zustand | 4.5 | State management |
| Tailwind CSS | 3.4 | Styling + custom animations |
| TypeScript | 5 | Type safety |
| Web Audio API | native | Procedural sound effects |

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Space` | Place bet (during countdown) or Cash out (during flight) |
# aviator-demo
# aviator-game
