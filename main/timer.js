const { ipcMain, Notification } = require('electron');
const EventEmitter = require('events');
const { CHANNELS } = require('./ipc');
const scanner = require('./scanner');
const store = require('./store');
const xp = require('./xp');
const { analyseCommits, analyseCommitsRich } = require('./commitAnalyser');
const { evaluateStreak } = require('./streaks');
const { evaluateBadges } = require('./badges');
const { evaluateQuests, sendQuestNotifications, expireStaleSlates } = require('./quests');
const { sendSessionCompleteNotification } = require('./notifications');
const { LEVELS } = require('./levels');

// Emits 'tick' and 'sessionComplete' for main/index.js to subscribe to
const timerEvents = new EventEmitter();

const DEFAULT_DURATIONS = {
  focus: 25 * 60,
  break: 5 * 60,
};

let state = {
  status: 'idle',       // 'idle' | 'running' | 'paused'
  type: 'focus',        // 'focus' | 'break'
  timeLeft: DEFAULT_DURATIONS.focus,
  startedAt: null,      // ms timestamp, set on first start of this session
  sessionRowId: null,   // sessions.id of the current in_progress row
  intervalId: null,
  pollId: null,
  seenHashes: new Set(),
  settings: { ...DEFAULT_DURATIONS },
  repoPaths: [],
};

let mainWindow = null;
let handlersRegistered = false;

function setWindow(win) {
  mainWindow = win;
}

function sendToAll(channel, payload) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send(channel, payload);
  }
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
  sendToAll(CHANNELS.TIMER_TICK, payload);
  timerEvents.emit('tick', payload);
}

function pollCommits() {
  if (state.status !== 'running' || !state.startedAt) return;
  const since = new Date(state.startedAt).toISOString();
  const repos = scanner.getCommitsSince(since, state.repoPaths);
  const newCommits = [];
  for (const repo of repos) {
    for (const commit of repo.commits) {
      if (!state.seenHashes.has(commit.hash)) {
        state.seenHashes.add(commit.hash);
        newCommits.push({ repo: repo.repo, remoteUrl: repo.remoteUrl, ...commit });
      }
    }
  }
  if (newCommits.length > 0) {
    sendToAll(CHANNELS.COMMITS_LIVE, newCommits);
  }
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
  clearInterval(state.pollId);
  state.intervalId = null;
  state.pollId = null;
  state.status = 'idle';

  const endedAt = Date.now();
  const startedAt = state.startedAt;
  const sessionRowId = state.sessionRowId;
  const completedType = state.type;

  // Scan git repos (synchronous — runs in main process, acceptable)
  const repos = scanner.getCommitsSince(new Date(startedAt).toISOString(), state.repoPaths);

  // Transition session row to xp_pending
  store.completeSession({ id: sessionRowId, endedAt, repos });

  // Award XP only for naturally completed focus sessions (C-1)
  let xpResult = null;
  let newBadgeSlugs = [];
  let newCompletedQuests = [];
  if (completedType === 'focus') {
    // Run rich commit analysis once — used by both XP (via commitBonuses) and badges
    const richCommits = analyseCommitsRich(state.repoPaths, startedAt, endedAt);
    const commitBonuses = analyseCommits(state.repoPaths, startedAt, endedAt);
    // H-5, H-6: only qualifying sessions (at least one commit bonus) update streak state
    // C-1: evaluate streak before awarding XP so dailyStreak and isComeback feed in
    const qualifyingCommitCount = commitBonuses.length;
    let streakResult = { dailyStreak: 0, weeklyStreak: 0, isComeback: false, gapDays: 0, previousDailyStreak: 0, weekBecameProductiveNow: false };
    if (qualifyingCommitCount > 0) {
      streakResult = evaluateStreak(qualifyingCommitCount, endedAt);
    }
    xpResult = xp.awardSessionXp(sessionRowId, commitBonuses, streakResult.dailyStreak, streakResult.isComeback);
    xpResult.streakResult = streakResult;

    // B-1: evaluate badges after XP and Streaks have both finished
    const completedSession = store.getSessionById(sessionRowId);
    newBadgeSlugs = evaluateBadges({
      session: completedSession,
      richCommits,
      xpResult,
      streakResult,
    });

    // D-1: evaluate quests after XP and Badges
    const { newlyCompleted: completedQuests } = evaluateQuests({
      session: completedSession,
      richCommits,
      streakState: store.getStreakState(),
    });
    newCompletedQuests = completedQuests;

    // G-4: streak broken notification — fires once when streak resets after a gap
    // isComeback means previousDailyStreak > 0 AND gap >= 2 → streak was broken
    if (streakResult.isComeback && streakResult.previousDailyStreak >= 1 && Notification.isSupported()) {
      new Notification({
        title: 'Streak ended',
        body: `Your ${streakResult.previousDailyStreak}-day streak ended`,
      }).show();
    }

    // G-5: comeback notification (E-2 triggered)
    if (streakResult.isComeback && Notification.isSupported()) {
      new Notification({
        title: 'Welcome back',
        body: `You were away for ${streakResult.gapDays} day${streakResult.gapDays !== 1 ? 's' : ''}`,
      }).show();
    }

    // G-6: weekly streak achieved notification
    if (streakResult.weekBecameProductiveNow && Notification.isSupported()) {
      new Notification({
        title: 'Week complete',
        body: `${streakResult.weeklyStreak}-week streak`,
      }).show();
    }

    // F-4: staggered level-up notifications
    let levelUpCount = 0;
    if (xpResult && xpResult.levelAfter > xpResult.levelBefore) {
      const levelUps = [];
      for (let i = xpResult.levelBefore + 1; i <= xpResult.levelAfter; i++) {
        levelUps.push({ from: LEVELS[i - 1].title, to: LEVELS[i].title });
      }
      levelUps.forEach(({ from, to }, idx) => {
        setTimeout(() => {
          if (Notification.isSupported()) {
            new Notification({ title: 'Level up', body: `${from} → ${to}` }).show();
          }
        }, idx * 2000);
      });
      levelUpCount = levelUps.length;
    }

    // E-2: badge unlock notifications — staggered 1.5s, after level-up notifications
    if (newBadgeSlugs.length > 0 && Notification.isSupported()) {
      const { BADGE_BY_SLUG } = require('./badgeDefs');
      const levelUpDuration = levelUpCount * 2000;
      newBadgeSlugs.forEach((slug, idx) => {
        const badge = BADGE_BY_SLUG[slug];
        if (!badge) return;
        setTimeout(() => {
          new Notification({ title: badge.name, body: badge.description }).show();
        }, levelUpDuration + idx * 1500);
      });
    }

    // F-3: quest completion notifications — staggered 1s, after all badge notifications
    if (newCompletedQuests.length > 0) {
      const levelUpDuration = levelUpCount * 2000;
      const badgeDuration = newBadgeSlugs.length * 1500;
      sendQuestNotifications(newCompletedQuests, levelUpDuration + badgeDuration);
    }

    const newXpState = store.getXpState();
    newXpState.levelTitle = LEVELS[newXpState.levelIndex].title;
    timerEvents.emit('xpStateUpdated', newXpState);
  } else {
    // Break sessions: just mark done, no XP
    store.markSessionXpDone(sessionRowId);

    const newXpState = store.getXpState();
    newXpState.levelTitle = LEVELS[newXpState.levelIndex].title;
    timerEvents.emit('xpStateUpdated', newXpState);
  }

  const session = {
    id: sessionRowId,
    startedAt,
    endedAt,
    durationMinutes: Math.round(state.settings[completedType] / 60),
    type: completedType,
    repos,
    xpResult,
    newBadgeSlugs, // E-3: newly unlocked badge slugs for session-end summary
    newCompletedQuests, // F-4: quests completed this session
  };

  sendToAll(CHANNELS.SESSION_COMPLETE, session);

  sendSessionCompleteNotification(session);
  timerEvents.emit('sessionComplete', session);

  // Reset to focus timer after any completed session — don't auto-switch to break
  state.type = 'focus';
  state.timeLeft = state.settings.focus;
  state.startedAt = null;
  state.sessionRowId = null;

  pushTick(); // push idle state with next timer loaded
}

function registerHandlers() {
  if (handlersRegistered) return;
  handlersRegistered = true;

  ipcMain.on(CHANNELS.TIMER_START, () => {
    if (state.status === 'running') return;
    if (!state.startedAt) {
      state.startedAt = Date.now();
      state.seenHashes = new Set();
      state.sessionRowId = store.beginSession({
        startedAt: state.startedAt,
        type: state.type,
        durationMinutes: Math.round(state.settings[state.type] / 60),
      });
    }
    state.status = 'running';
    state.intervalId = setInterval(tick, 1000);
    state.pollId = setInterval(pollCommits, 10000);
    pollCommits(); // immediate first poll
    pushTick();
  });

  ipcMain.on(CHANNELS.TIMER_PAUSE, () => {
    if (state.status !== 'running') return;
    clearInterval(state.intervalId);
    clearInterval(state.pollId);
    state.intervalId = null;
    state.pollId = null;
    state.status = 'paused';
    if (state.sessionRowId) store.incrementSessionPauseCount(state.sessionRowId);
    pushTick();
  });

  ipcMain.on(CHANNELS.TIMER_RESET, () => {
    clearInterval(state.intervalId);
    clearInterval(state.pollId);
    state.intervalId = null;
    state.pollId = null;
    // Abort the in_progress session row if one exists (no XP — C-1)
    if (state.sessionRowId) {
      store.getDb()
        .prepare(`UPDATE sessions SET status = 'aborted' WHERE id = ?`)
        .run(state.sessionRowId);
    }
    state.status = 'idle';
    state.startedAt = null;
    state.sessionRowId = null;
    state.seenHashes = new Set();
    state.timeLeft = state.settings[state.type];
    pushTick();
  });
}

// Allow renderer to request current state on load
function getState() {
  return { timeLeft: state.timeLeft, status: state.status, type: state.type, totalSeconds: state.settings[state.type] };
}

module.exports = { setWindow, registerHandlers, updateSettings, getState, timerEvents };
