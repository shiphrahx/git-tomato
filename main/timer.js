const { ipcMain } = require('electron');
const EventEmitter = require('events');
const { CHANNELS } = require('./ipc');
const scanner = require('./scanner');
const store = require('./store');
const { sendSessionCompleteNotification } = require('./notifications');

// Emits 'tick' and 'sessionComplete' for main/index.js to subscribe to
const timerEvents = new EventEmitter();

const DEFAULT_DURATIONS = {
  focus: 25 * 60,
  break: 5 * 60,
};

let state = {
  status: 'idle',     // 'idle' | 'running' | 'paused'
  type: 'focus',      // 'focus' | 'break'
  timeLeft: DEFAULT_DURATIONS.focus,
  startedAt: null,    // ms timestamp, set on first start of this session
  intervalId: null,
  settings: { ...DEFAULT_DURATIONS },
  repoPaths: [],
};

let mainWindow = null;
let handlersRegistered = false;

function setWindow(win) {
  mainWindow = win;
}

function updateSettings(settings) {
  if (settings.focusDuration) state.settings.focus = settings.focusDuration * 60;
  if (settings.shortBreak) state.settings.break = settings.shortBreak * 60;
  if (settings.repoPaths) state.repoPaths = settings.repoPaths;
  // Reset timeLeft if not running and push update to renderer
  if (state.status === 'idle') {
    state.timeLeft = state.settings[state.type];
    pushTick();
  }
}

function pushTick() {
  const payload = { timeLeft: state.timeLeft, status: state.status, type: state.type, totalSeconds: state.settings[state.type] };
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send(CHANNELS.TIMER_TICK, payload);
  }
  timerEvents.emit('tick', payload);
}

function tick() {
  if (state.status !== 'running') return;
  state.timeLeft -= 1;
  pushTick();
  if (state.timeLeft <= 0) {
    completeSession();
  }
}

function completeSession() {
  clearInterval(state.intervalId);
  state.intervalId = null;
  state.status = 'idle';

  const endedAt = Date.now();
  const startedAt = state.startedAt;

  // Scan git repos (synchronous — runs in main process, acceptable)
  const repos = scanner.getCommitsSince(new Date(startedAt).toISOString(), state.repoPaths);

  const session = {
    startedAt,
    endedAt,
    durationMinutes: Math.round(state.settings[state.type] / 60),
    type: state.type,
    repos,
  };

  store.saveSession(session);

  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send(CHANNELS.SESSION_COMPLETE, session);
  }

  sendSessionCompleteNotification(session);
  timerEvents.emit('sessionComplete', session);

  // Auto-transition to next type, but don't auto-start
  const nextType = state.type === 'focus' ? 'break' : 'focus';
  state.type = nextType;
  state.timeLeft = state.settings[nextType];
  state.startedAt = null;

  pushTick(); // push idle state with next timer loaded
}

function registerHandlers() {
  if (handlersRegistered) return;
  handlersRegistered = true;

  ipcMain.on(CHANNELS.TIMER_START, () => {
    if (state.status === 'running') return;
    if (!state.startedAt) {
      state.startedAt = Date.now();
    }
    state.status = 'running';
    state.intervalId = setInterval(tick, 1000);
    pushTick();
  });

  ipcMain.on(CHANNELS.TIMER_PAUSE, () => {
    if (state.status !== 'running') return;
    clearInterval(state.intervalId);
    state.intervalId = null;
    state.status = 'paused';
    pushTick();
  });

  ipcMain.on(CHANNELS.TIMER_RESET, () => {
    clearInterval(state.intervalId);
    state.intervalId = null;
    state.status = 'idle';
    state.startedAt = null;
    state.timeLeft = state.settings[state.type];
    pushTick();
  });
}

// Allow renderer to request current state on load
function getState() {
  return { timeLeft: state.timeLeft, status: state.status, type: state.type, totalSeconds: state.settings[state.type] };
}

module.exports = { setWindow, registerHandlers, updateSettings, getState, timerEvents };
