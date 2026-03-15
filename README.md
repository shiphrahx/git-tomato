# 🍅 git-tomato

**Time your work. Prove it with commits.**

A desktop menubar app that runs a Pomodoro timer and, at the end of each focus session, automatically checks your git log to show exactly what you committed during that block. End of day you get a timeline of sessions with their commits attached — time spent linked to actual output.

![git-tomato UI](.github/screenshot.png)

---

## What it does

Most Pomodoro apps tell you how long you worked. git-tomato tells you what you built.

When a focus session ends, it scans your configured git repos for commits made during that session and shows them alongside the timer. No manual logging. No context switching. Just open the menubar, start the timer, and get to work.

---

## Features

- **Menubar-native** — always visible, never buried in other windows
- **Automatic git scanning** — reads your commit log at session end, no setup required
- **Per-session commit list** — see exactly what you shipped during each Pomodoro
- **Daily timeline** — scrollable view of all sessions today with commits attached
- **Desktop notifications** — session complete message includes your commit count
- **Persistent history** — sessions stored in SQLite, survives restarts

---

## Architecture

```
Electron main process
├── timer.js        — setInterval engine, owns the clock (no browser throttling)
├── scanner.js      — git log runner, discovers repos automatically
├── store.js        — SQLite session persistence (better-sqlite3)
├── notifications.js — desktop notification at session end
└── index.js        — menubar setup, tray icon, IPC wiring

Electron renderer (React + Vite)
├── Timer.jsx       — SVG countdown ring with glow
├── Controls.jsx    — Start / Pause / Reset
├── CommitCard.jsx  — single commit with repo icon
├── CommitList.jsx  — commit list below the timer
├── DayTimeline.jsx — today's sessions (Today tab)
└── SessionCard.jsx — one session + its commits, expandable

IPC bridge (main/preload.js)
└── contextBridge   — secure boundary, no nodeIntegration
```

The timer runs in the main process — not the renderer — so it keeps ticking even when the menubar window is hidden or minimised.

---

## Getting started

### Prerequisites

- Node.js 20+
- Git
- Windows Build Tools (Windows only — needed for `better-sqlite3`)

```bash
# Windows: install build tools if you haven't already (run as admin)
npm install --global windows-build-tools
```

### Install

```bash
git clone https://github.com/shiphrahx/git-tomato.git
cd git-tomato

# Install root dependencies
npm install

# Rebuild native modules for Electron
npx electron-rebuild

# Install renderer dependencies
npm --prefix renderer install
```

### Run in development

```bash
npm run dev
```

Vite starts on `localhost:5173`, then Electron launches and connects to it. A detached DevTools window opens automatically.

Click the tray icon (system tray, bottom-right on Windows) to open the panel.

### Build for distribution

```bash
npm run build
```

Output goes to `dist/`. Produces an NSIS installer on Windows, `.app` on macOS.

---

## Repo discovery

By default git-tomato scans these directories in your home folder for `.git` repos:

```
~/projects
~/code
~/dev
~/src
~/workspace
```

Any repo found there is automatically included in the git scan at session end. You can configure custom paths in Settings.

---

## Project structure

```
git-tomato/
├── main/
│   ├── index.js          — Electron entry, menubar, tray
│   ├── ipc.js            — IPC channel name constants
│   ├── timer.js          — timer engine
│   ├── scanner.js        — git integration
│   ├── store.js          — SQLite persistence
│   ├── notifications.js  — desktop notifications
│   └── preload.js        — contextBridge security layer
├── renderer/
│   ├── src/
│   │   ├── components/   — React UI components
│   │   ├── hooks/        — useTimer IPC hook
│   │   ├── App.jsx
│   │   └── index.css
│   ├── index.html
│   └── vite.config.js
├── scripts/
│   ├── gen-icon.js       — generates tray PNG asset
│   └── launch-electron.js — dev launcher
└── assets/
    └── trayTemplate.png  — menubar tray icon
```

---

## License

MIT
