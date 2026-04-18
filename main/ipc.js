// IPC channel name constants — single source of truth
// All main-process files import from here.
// Renderer-side strings are mirrored in preload.js.

const CHANNELS = {
  // Renderer → Main (ipcMain.on — fire and forget)
  TIMER_START: 'timer:start',
  TIMER_PAUSE: 'timer:pause',
  TIMER_RESET: 'timer:reset',
  TIMER_STOP: 'timer:stop',
  TIMER_START_BREAK: 'timer:startBreak', // payload: { durationSeconds }

  // Main → Renderer (webContents.send — push)
  TIMER_TICK: 'timer:tick',
  SESSION_COMPLETE: 'session:complete',

  // Renderer → Main (ipcMain.handle — invoke/promise)
  STORE_GET_SESSIONS: 'store:getSessions',
  SETTINGS_GET: 'settings:get',
  SETTINGS_SET: 'settings:set',

  // Main → Renderer (live commit push during session)
  COMMITS_LIVE: 'commits:live',

  // Renderer → Main (open URL in default browser)
  OPEN_URL: 'shell:openUrl',

  // Renderer → Main (all commits for a calendar day, with session windows)
  STORE_GET_DAY_COMMITS: 'store:getDayCommits',

  // XP state — invoke + push
  XP_STATE_GET: 'xp:getState',
  XP_STATE_UPDATED: 'xp:stateUpdated',

  // Streak state — invoke
  STREAK_STATE_GET: 'streak:getState',

  // Badge unlocks — invoke + push
  BADGES_GET: 'badges:get',
  BADGES_UPDATED: 'badges:updated',

  // XP earned for a calendar day
  STORE_GET_DAY_XP: 'store:getDayXp',

  // Daily quests — invoke + push
  QUESTS_GET: 'quests:get',
  QUESTS_UPDATED: 'quests:updated',
  QUESTS_HISTORY_GET: 'quests:historyGet',

  // Productive days (for weekly streak colouring)
  STORE_GET_PRODUCTIVE_DAYS: 'store:getProductiveDays',

  // Git availability check
  GIT_CHECK: 'git:check',

  // App version
  APP_VERSION: 'app:version',
};

module.exports = { CHANNELS };
