<div align="center">

# 🍅 git-tomato

[![Release](https://img.shields.io/github/v/release/shiphrahx/git-tomato?style=flat-square&color=fbbf24&label=release)](https://github.com/shiphrahx/git-tomato/releases/latest)
[![Build](https://img.shields.io/github/actions/workflow/status/shiphrahx/git-tomato/release.yml?style=flat-square&label=build)](https://github.com/shiphrahx/git-tomato/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-22c55e?style=flat-square)](LICENSE)
[![GitHub Last Commit](https://img.shields.io/github/last-commit/shiphrahx/git-tomato?style=flat-square&color=8b5cf6)](https://github.com/shiphrahx/git-tomato/commits/main)

[![macOS](https://img.shields.io/badge/macOS-12%2B-000000?style=flat-square&logo=apple&logoColor=white)](https://github.com/shiphrahx/git-tomato/releases/latest)
[![Windows](https://img.shields.io/badge/Windows-10%2B-0078d4?style=flat-square&logo=windows&logoColor=white)](https://github.com/shiphrahx/git-tomato/releases/latest)
[![Electron](https://img.shields.io/badge/Electron-47848F?style=flat-square&logo=electron&logoColor=white)](https://www.electronjs.org)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org)

**Time your work. Prove it with commits.**

</div>


A desktop app that runs a Pomodoro timer and automatically links each focus session to your git commits. At the end of every session it scans your repos and shows exactly what you shipped during that block. Over time you build a commit heatmap, XP level, daily streaks, and badge collection.

| ![alt text](assets/demo.png) | ![alt text](assets/dark_demo.png) |
|---|---|

---

## What it does

Most Pomodoro apps tell you how long you worked. git-tomato tells you what you built.

Start a focus session, code, and when the timer ends git-tomato scans your configured repositories and attaches every commit made during that window to the session. The Stats tab then gives you a full picture of the day: commit heatmap, XP earned, lines changed, daily quests, and your badge collection.

<img src="assets/heatmap.png" width="700" alt="git-tomato icon"/>

## Features

### Timer
- **Pomodoro timer** with Focus, Short Break, and Long Break modes
- Pixel-art tomato mascot that degrades as time runs out
- Energy bar, session dots, and time-remaining bar

### Git integration
- **Automatic commit scanning** at session end — no setup required for standard repo locations
- Commits are linked to the session window they were made in
- Lines-changed tracking per session (additions + deletions)

### Progression
- **XP system** — earn XP for qualifying focus sessions, scaled by commit volume
- **7 levels**: Seedling → Committer → Shipper → Maintainer → Staff → Principal → Legend
- **Daily streak** — consecutive productive days tracked with at-risk detection
- **Weekly streak** — visualised as a 7-day dot row in the Focus tab
- **24 achievement badges** with pixel-art SVG icons (earned badges shown first, locked shown greyed)
- **Daily quests** — generated fresh each day, resets at midnight

<img src="assets/quests.png" width="700" alt="quests icon"/>

---

## Repo discovery

By default git-tomato scans these directories in your home folder for `.git` repos:

```
~/projects  ~/code  ~/dev  ~/src  ~/workspace
```

Any repo found there is included automatically. Add custom paths in the Config tab.

