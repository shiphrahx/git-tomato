const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Timer commands — fire and forget
  timerStart: () => ipcRenderer.send('timer:start'),
  timerPause: () => ipcRenderer.send('timer:pause'),
  timerReset: () => ipcRenderer.send('timer:reset'),

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

  // Settings
  getSettings: () => ipcRenderer.invoke('settings:get'),
  setSettings: (settings) => ipcRenderer.invoke('settings:set', settings),

  // Open URL in default browser
  openUrl: (url) => ipcRenderer.invoke('shell:openUrl', url),
});
