const { app, ipcMain, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs');
const { menubar } = require('menubar');
const { CHANNELS } = require('./ipc');
const timer = require('./timer');
const store = require('./store');

const isDev = process.env.ELECTRON_DEV === '1';

const RENDERER_URL = isDev
  ? 'http://localhost:5173'
  : `file://${path.join(__dirname, '../renderer/dist/index.html')}`;

// Settings helpers (simple JSON file, no extra dep)
const SETTINGS_PATH = () => path.join(app.getPath('userData'), 'settings.json');

const DEFAULT_SETTINGS = {
  focusDuration: 25,
  shortBreak: 5,
  repoPaths: [],
};

function readSettings() {
  try {
    return JSON.parse(fs.readFileSync(SETTINGS_PATH(), 'utf8'));
  } catch (_) {
    return { ...DEFAULT_SETTINGS };
  }
}

function writeSettings(settings) {
  fs.writeFileSync(SETTINGS_PATH(), JSON.stringify(settings, null, 2));
}

let mb;

app.whenReady().then(() => {
  // Windows: needed for dev-mode desktop notifications
  if (process.platform === 'win32') {
    app.setAppUserModelId('com.git-tomato.app');
  }

  const iconPath = path.join(__dirname, '../assets/trayTemplate.png');
  const icon = nativeImage.createFromPath(iconPath);

  mb = menubar({
    index: RENDERER_URL,
    icon,
    browserWindow: {
      width: 380,
      height: 540,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        contextIsolation: true,
        nodeIntegration: false,
      },
      resizable: false,
      skipTaskbar: true,
    },
    preloadWindow: true,
    windowPosition: process.platform === 'win32' ? 'trayBottomCenter' : 'trayCenter',
  });

  mb.on('ready', () => {
    const tray = mb.tray;

    // Apply saved settings to timer
    const settings = readSettings();
    timer.updateSettings(settings);

    // Wire up timer
    timer.setWindow(mb.window);
    timer.registerHandlers();

    // Update tray title on every tick
    timer.timerEvents.on('tick', ({ timeLeft, status }) => {
      if (status === 'idle') {
        tray.setTitle('');
        tray.setToolTip('git-tomato');
      } else {
        const mins = Math.floor(timeLeft / 60).toString().padStart(2, '0');
        const secs = (timeLeft % 60).toString().padStart(2, '0');
        const label = `${mins}:${secs}`;
        // macOS supports tray title text; Windows uses tooltip
        if (process.platform === 'darwin') {
          tray.setTitle(label);
        }
        tray.setToolTip(`git-tomato — ${label}`);
      }
    });

    // Store handlers
    ipcMain.handle(CHANNELS.STORE_GET_SESSIONS, (_, { date } = {}) => {
      return date ? store.getSessionsForDate(date) : store.getAllSessions();
    });

    // Settings handlers
    ipcMain.handle(CHANNELS.SETTINGS_GET, () => readSettings());
    ipcMain.handle(CHANNELS.SETTINGS_SET, (_, settings) => {
      writeSettings(settings);
      timer.updateSettings(settings);
      return true;
    });

    // Timer state handler (renderer requests current state on load)
    ipcMain.handle('timer:getState', () => timer.getState());
  });

  // Open devtools in dev mode
  if (isDev) {
    mb.on('after-create-window', () => {
      mb.window.webContents.openDevTools({ mode: 'detach' });
    });
  }
});

// Keep the app running when the window is closed — the tray is our persistent presence
app.on('window-all-closed', () => {
  // Do nothing — tray app stays alive
});
