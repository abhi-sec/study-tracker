# 🍅 AI Study Tracker — Pomodoro Edition

An AI-powered study tracker that uses the Pomodoro technique to analyse study time and patterns, track sessions, and award achievement badges.

## Features

- **Pomodoro Timer** — 25-min focus / 5-min short break / 15-min long break cycles with circular progress ring, phase selector, and pomodoro counter
- **Study Statistics** — Today's study time, total accumulated time, total sessions, longest session, and day streak
- **16 Achievement Badges** — Bronze → Platinum tiers for total hours (1h, 5h, 10h, 25h, 50h, 100h), streak milestones (3d, 7d, 30d), sessions (10, 25, 100), and special badges (Early Bird, Night Owl, Marathon Studier)
- **AI Pattern Analysis** — Algorithmic insights: consistency score, trend detection (improving/declining/stable), hourly heatmap, 14-day study chart, milestone ETAs, and personalized recommendations
- **Session History** — Persistent log of all completed sessions with timestamps
- **LocalStorage persistence** — All data survives page reloads
- **Toast notifications** — Animated alerts when a new badge is earned

## Screenshots

| Timer | Stats |
|---|---|
| ![Timer](https://github.com/user-attachments/assets/0281be69-bdfa-4b8b-84f9-db24b2629607) | ![Stats](https://github.com/user-attachments/assets/5f20e3da-9f4f-4a68-9bf1-702df506f018) |

| Badges | AI Insights |
|---|---|
| ![Badges](https://github.com/user-attachments/assets/fb9e2968-e4bb-4fb1-b75b-5cf52ae1dad1) | *(unlocks after first session)* |

## Tech Stack

- **React 18** + **Vite 5** — fast dev/build toolchain
- **CSS Modules** — scoped styling, no runtime CSS-in-JS
- **Vitest** + **@testing-library/react** — unit & component tests

## Getting Started

```bash
npm install
npm run dev       # development server
npm run build     # production build
npm run test      # run all tests
```
