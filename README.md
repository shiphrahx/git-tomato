# 🍅 git-tomato

**Time your work. Prove it with commits.**

A desktop app that runs a Pomodoro timer and automatically links each focus session to your git commits. At the end of every session it scans your repos and shows exactly what you shipped during that block. Over time you build a commit heatmap, XP level, daily streaks, and badge collection — all driven by real coding output, not self-reported effort.

---

## What it does

Most Pomodoro apps tell you how long you worked. git-tomato tells you what you built.

Start a focus session, code, and when the timer ends git-tomato scans your configured repositories and attaches every commit made during that window to the session. No manual logging. The Stats tab then gives you a full picture of the day: commit heatmap, XP earned, lines changed, daily quests, and your badge collection.

---

## Features

### Timer
- **Pomodoro timer** with Focus, Short Break, and Long Break modes
- Pixel-art tomato mascot that degrades as time runs out
- Energy bar, session dots, and time-remaining bar
- Start / Pause / Resume / Restart controls
- Timer runs in the main process — keeps ticking even when the window is hidden

### Git integration
- **Automatic commit scanning** at session end — no setup required for standard repo locations
- Commits are linked to the session window they were made in
- Lines-changed tracking per session (additions + deletions)
- Anti-gaming qualifier: sessions with fewer than 5 lines changed don't award XP
- Warning shown in Config if `git` is not found on PATH

### Progression
- **XP system** — earn XP for qualifying focus sessions, scaled by commit volume
- **7 levels**: Seedling → Committer → Shipper → Maintainer → Staff → Principal → Legend
- **Daily streak** — consecutive productive days tracked with at-risk detection
- **Weekly streak** — visualised as a 7-day dot row in the Focus tab
- **24 achievement badges** with pixel-art SVG icons (earned badges shown first, locked shown greyed)
- **Daily quests** — generated fresh each day, resets at midnight

### Stats tab
- **12-week commit heatmap** — cell intensity based on commit count, hover to see date + count
- 4-column metrics: Pomodoros, Commits, Lines, Repos
- XP level card with animated progress bar
- Daily quests with live progress tracking
- Commits by repo, expandable per session
- Full badge grid

### Config tab (inline, no popup)
- Focus duration, short break, long break (minutes)
- Watched repository paths (leave empty to auto-discover)
- GitHub personal access token — stored encrypted via Electron `safeStorage`
- App version displayed in footer
- Duration changes take effect on the next session; running timers are not interrupted

### Platform
- **Windows**: native `.ico` tray icon, taskbar integration
- **macOS**: `Template` PNG tray icon (auto-inverts for light/dark menu bar)
- Themes: Morning (light) and Twilight (dark), auto-selected by time of day with manual override
- Persistent storage in SQLite (WAL mode, closed cleanly on quit)

---

## Architecture

```
main/
├── index.js          — Electron entry, BrowserWindow, tray, IPC wiring
├── ipc.js            — IPC channel name constants (single source of truth)
├── preload.js        — contextBridge security layer (no nodeIntegration)
├── timer.js          — setInterval engine, owns the clock
├── scanner.js        — git log runner, repo discovery, git availability check
├── store.js          — SQLite persistence (better-sqlite3, WAL mode)
├── xp.js             — XP award engine, level computation
├── commitAnalyser.js — diff analysis, line counting, anti-gaming qualifier
├── badges.js         — badge evaluation, unlock tracking
├── badgeDefs.js      — badge definitions (24 badges)
├── quests.js         — daily quest slate generation and evaluation
├── questDefs.js      — quest definitions
├── streaks.js        — streak update logic
├── streakDefs.js     — daily/weekly streak rules and at-risk detection
├── levels.js         — level thresholds
└── notifications.js  — desktop notifications at session end

renderer/src/
├── App.jsx                 — root, tab routing, theme, ErrorBoundary
├── components/
│   ├── FocusScreen.jsx     — timer card + side panel (streak, XP, git feed)
│   ├── DayTimeline.jsx     — Stats tab (heatmap, metrics, quests, badges)
│   ├── Settings.jsx        — Config tab (inline, not a popup)
│   ├── SessionComplete.jsx — post-session XP animation screen
│   ├── BackgroundScene.jsx — animated morning/twilight background SVG
│   ├── TomatoSprite.jsx    — pixel-art tomato state images
│   ├── Timer.jsx           — SVG countdown ring with gradient + glow
│   ├── CommitCard.jsx      — single commit row
│   ├── RepoCommitList.jsx  — grouped commit list by repo
│   ├── SessionCard.jsx     — expandable session + commit list
│   ├── Badges.jsx          — badge definitions and metadata
│   ├── badgeIcons.jsx      — pixel-art SVG badge icons
│   └── QuestsScreen.jsx    — quest panel component
├── hooks/
│   └── useTimer.js         — IPC hook, syncs renderer to main-process timer
└── index.css               — all styles (CSS custom properties for theming)

assets/
├── tray_icons/
│   ├── windows/tray.ico              — Windows tray (multi-resolution ICO)
│   └── macos/tray_22Template.png     — macOS tray (auto-inverts, 22pt)
└── tomato-*.png                      — sprite frames for the tomato mascot
```

---

## Getting started

### Prerequisites

- Node.js 20+
- Git (must be on PATH, or installed at a standard Windows location)
- Windows Build Tools (Windows only — needed for `better-sqlite3`)

```bash
# Windows: install build tools if you haven't already (run as admin)
npm install --global windows-build-tools
```

### Install

```bash
git clone https://github.com/shiphrahx/git-tomato.git
cd git-tomato

npm install
npx electron-rebuild
npm --prefix renderer install
```

### Run in development

```bash
npm run dev
```

Vite starts on `localhost:5173`, Electron connects to it, and a detached DevTools window opens automatically. Click the tray icon to open the panel.

### Build for distribution

```bash
npm run build
```

Output goes to `dist/`. Produces an NSIS installer on Windows, `.app` on macOS.

---

## Repo discovery

By default git-tomato scans these directories in your home folder for `.git` repos:

```
~/projects  ~/code  ~/dev  ~/src  ~/workspace
```

Any repo found there is included automatically. Add custom paths in the Config tab.

---

## XP and levels

| Level | Title | XP required |
|-------|-------|-------------|
| 1 | Seedling | 0 |
| 2 | Committer | 100 |
| 3 | Shipper | 300 |
| 4 | Maintainer | 700 |
| 5 | Staff | 1 500 |
| 6 | Principal | 3 000 |
| 7 | Legend | 6 000 |

XP is awarded at session end. Sessions with fewer than 5 lines changed are disqualified. XP scales with commit volume and includes a diminishing-returns curve to prevent farming.

---

## License

MIT
