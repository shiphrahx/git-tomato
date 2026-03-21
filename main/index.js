const { app, ipcMain, shell, nativeImage, screen, BrowserWindow, Tray, Menu } = require('electron');
const path = require('path');
const fs = require('fs');
const { CHANNELS } = require('./ipc');
const timer = require('./timer');
const store = require('./store');
const scanner = require('./scanner');

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
  githubToken: '',
};

function readSettings() {
  try {
    const saved = JSON.parse(fs.readFileSync(SETTINGS_PATH(), 'utf8'));
    // Merge with defaults so newly added fields are always present
    return { ...DEFAULT_SETTINGS, ...saved };
  } catch (_) {
    return { ...DEFAULT_SETTINGS };
  }
}

function writeSettings(settings) {
  fs.writeFileSync(SETTINGS_PATH(), JSON.stringify(settings, null, 2));
}

let mainWindow = null;
let settingsWindow = null;
let tray = null;

app.whenReady().then(() => {
  // Windows: needed for dev-mode desktop notifications
  if (process.platform === 'win32') {
    app.setAppUserModelId('com.git-tomato.app');
  }

  const iconPath = path.join(__dirname, '../assets/trayTemplate.png');
  const icon = nativeImage.createFromPath(iconPath);

  // Cap height to workArea on Windows
  const DESIRED_HEIGHT = 680;
  const { workArea } = screen.getPrimaryDisplay();
  const windowHeight = process.platform === 'win32'
    ? Math.min(DESIRED_HEIGHT, workArea.height)
    : DESIRED_HEIGHT;

  // Position top-right of work area by default
  const x = Math.round(workArea.x + workArea.width - 380 - 24);
  const y = Math.round(workArea.y + 24);

  mainWindow = new BrowserWindow({
    width: 380,
    height: windowHeight,
    x,
    y,
    title: 'git-tomato',
    backgroundColor: '#0f1115',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    resizable: true,
    skipTaskbar: false,
    frame: true,
  });

  mainWindow.loadURL(RENDERER_URL);
  mainWindow.setMenuBarVisibility(false);
  mainWindow.on('closed', () => { mainWindow = null; });

  // Tray icon for tooltip + right-click menu
  tray = new Tray(icon);
  tray.setToolTip('git-tomato');

  function openSettingsWindow() {
    if (settingsWindow && !settingsWindow.isDestroyed()) {
      settingsWindow.focus();
      return;
    }

    const settingsUrl = isDev
      ? 'http://localhost:5173?view=settings'
      : `file://${path.join(__dirname, '../renderer/dist/index.html')}?view=settings`;

    const { workArea: wa } = screen.getPrimaryDisplay();
    const winWidth = 480;
    const winHeight = 600;
    const sx = Math.round(wa.x + (wa.width - winWidth) / 2);
    const sy = Math.round(wa.y + (wa.height - winHeight) / 2);

    settingsWindow = new BrowserWindow({
      width: winWidth,
      height: winHeight,
      x: sx,
      y: sy,
      title: 'git-tomato — Settings',
      backgroundColor: '#0f1115',
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        contextIsolation: true,
        nodeIntegration: false,
      },
      resizable: false,
      skipTaskbar: false,
    });

    settingsWindow.loadURL(settingsUrl);
    settingsWindow.setMenuBarVisibility(false);
    settingsWindow.on('closed', () => { settingsWindow = null; });
  }

  // Right-click tray context menu
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Open git-tomato', click: showMainWindow },
    { label: 'Settings', click: openSettingsWindow },
    { type: 'separator' },
    { label: 'Quit git-tomato', click: () => app.quit() },
  ]);
  tray.on('right-click', () => tray.popUpContextMenu(contextMenu));
  function showMainWindow() {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.show();
      mainWindow.focus();
    } else {
      mainWindow = new BrowserWindow({
        width: 380,
        height: windowHeight,
        x,
        y,
        title: 'git-tomato',
        backgroundColor: '#0f1115',
        webPreferences: {
          preload: path.join(__dirname, 'preload.js'),
          contextIsolation: true,
          nodeIntegration: false,
        },
        resizable: true,
        skipTaskbar: false,
        frame: true,
      });
      mainWindow.loadURL(RENDERER_URL);
      mainWindow.setMenuBarVisibility(false);
      mainWindow.on('closed', () => { mainWindow = null; });
      timer.setWindow(mainWindow);
    }
  }

  tray.on('click', showMainWindow);
  tray.on('double-click', showMainWindow);

  // Apply saved settings to timer
  const settings = readSettings();
  timer.updateSettings(settings);

  // Wire up timer
  timer.setWindow(mainWindow);
  timer.registerHandlers();

  // Update tray tooltip on every tick
  timer.timerEvents.on('tick', ({ timeLeft, status }) => {
    if (status === 'idle') {
      tray.setToolTip('git-tomato');
    } else {
      const mins = Math.floor(timeLeft / 60).toString().padStart(2, '0');
      const secs = (timeLeft % 60).toString().padStart(2, '0');
      tray.setToolTip(`git-tomato — ${mins}:${secs}`);
    }
  });

  // Store handlers
  ipcMain.handle(CHANNELS.STORE_GET_SESSIONS, (_, { date } = {}) => {
    return date ? store.getSessionsForDate(date) : store.getAllSessions();
  });

  // Settings handlers
  ipcMain.handle(CHANNELS.SETTINGS_GET, () => readSettings());
  ipcMain.handle(CHANNELS.SETTINGS_SET, (_, s) => {
    writeSettings(s);
    timer.updateSettings(s);
    return true;
  });

  // Timer state handler (renderer requests current state on load)
  ipcMain.handle('timer:getState', () => timer.getState());

  // Open URL in default browser
  ipcMain.handle(CHANNELS.OPEN_URL, (_, url) => shell.openExternal(url));

  // All commits for a calendar day + session windows for that day
  ipcMain.handle(CHANNELS.STORE_GET_DAY_COMMITS, (_, { date } = {}) => {
    if (!date) return { repos: [], sessionWindows: [] };
    const settings = readSettings();
    const repos = scanner.getAllCommitsForDay(date, settings.repoPaths);
    const sessionWindows = store.getSessionWindowsForDate(date);
    return { repos, sessionWindows };
  });

  // Open devtools in dev mode
  if (isDev) {
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  }
});

// Keep the app running when the window is closed — tray keeps it alive
app.on('window-all-closed', () => {
  // Do nothing — tray app stays alive
});
