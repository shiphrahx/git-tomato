const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Timer commands — fire and forget
  timerStart: () => ipcRenderer.send('timer:start'),
  timerPause: () => ipcRenderer.send('timer:pause'),
  timerReset: () => ipcRenderer.send('timer:reset'),
  timerStop: () => ipcRenderer.send('timer:stop'),
  timerStartBreak: (type) => ipcRenderer.send('timer:startBreak', { type }),

  // Timer state push from main — returns a cleanup function
  onTimerTick: (callback) => {
    const handler = (_, data) => callback(data);
    ipcRenderer.on('timer:tick', handler);
    return () => ipcRenderer.removeListener('timer:tick', handler);
  },

  // Session complete push from main — returns a cleanup function
  onSessionComplete: (callback) => {
    const handler = (_, data) => callback(data);
    ipcRenderer.on('session:complete', handler);
    return () => ipcRenderer.removeListener('session:complete', handler);
  },

  // Live commit push during a running session — returns a cleanup function
  onLiveCommits: (callback) => {
    const handler = (_, data) => callback(data);
    ipcRenderer.on('commits:live', handler);
    return () => ipcRenderer.removeListener('commits:live', handler);
  },

  // Request current timer state on load (invoke pattern)
  getTimerState: () => ipcRenderer.invoke('timer:getState'),

  // Session store queries
  getSessions: (date) => ipcRenderer.invoke('store:getSessions', { date }),

  // All commits for a calendar day + session windows
  getDayCommits: (date) => ipcRenderer.invoke('store:getDayCommits', { date }),

  // XP earned on a calendar day
  getDayXp: (date) => ipcRenderer.invoke('store:getDayXp', { date }),

  // Settings
  openSettings: () => ipcRenderer.invoke('settings:open'),
  getSettings: () => ipcRenderer.invoke('settings:get'),
  setSettings: (settings) => ipcRenderer.invoke('settings:set', settings),

  // Open URL in default browser
  openUrl: (url) => ipcRenderer.invoke('shell:openUrl', url),

  // XP state
  getXpState: () => ipcRenderer.invoke('xp:getState'),
  onXpStateUpdated: (callback) => {
    const handler = (_, data) => callback(data);
    ipcRenderer.on('xp:stateUpdated', handler);
    return () => ipcRenderer.removeListener('xp:stateUpdated', handler);
  },

  // Streak state (D-1, D-2, D-3: at-risk is computed in renderer from this)
  getStreakState: () => ipcRenderer.invoke('streak:getState'),

  // Badge unlocks
  getBadgeUnlocks: () => ipcRenderer.invoke('badges:get'),
  onBadgesUpdated: (callback) => {
    const handler = (_, data) => callback(data);
    ipcRenderer.on('badges:updated', handler);
    return () => ipcRenderer.removeListener('badges:updated', handler);
  },

  // Daily quests
  getQuestSlate: () => ipcRenderer.invoke('quests:get'),
  getQuestHistory: () => ipcRenderer.invoke('quests:historyGet'),
  onQuestsUpdated: (callback) => {
    const handler = (_, data) => callback(data);
    ipcRenderer.on('quests:updated', handler);
    return () => ipcRenderer.removeListener('quests:updated', handler);
  },

  // Productive days (for weekly streak colouring)
  getProductiveDays: () => ipcRenderer.invoke('store:getProductiveDays'),

  // Git availability check
  checkGit: () => ipcRenderer.invoke('git:check'),

  // App version
  getAppVersion: () => ipcRenderer.invoke('app:version'),
});
