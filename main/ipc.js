// IPC channel name constants — single source of truth
// All main-process files import from here.
// Renderer-side strings are mirrored in preload.js.

const CHANNELS = {
  // Renderer → Main (ipcMain.on — fire and forget)
  TIMER_START: 'timer:start',
  TIMER_PAUSE: 'timer:pause',
  TIMER_RESET: 'timer:reset',

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
};

module.exports = { CHANNELS };
