import React, { useState, useEffect, Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(e) { return { error: e }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: '20px', color: 'var(--accent)', fontFamily: 'monospace', fontSize: '12px', whiteSpace: 'pre-wrap' }}>
          <div style={{ marginBottom: '8px', fontFamily: 'var(--font-ui)', fontSize: '10px' }}>RENDER ERROR</div>
          {String(this.state.error)}
          {'\n'}{this.state.error?.stack}
        </div>
      );
    }
    return this.props.children;
  }
}
import { useTimer } from './hooks/useTimer';
import { DayTimeline } from './components/DayTimeline';
import { WeekDigest } from './components/WeekDigest';
import { Settings } from './components/Settings';
import { SessionComplete } from './components/SessionComplete';
import { BackgroundScene } from './components/BackgroundScene';
import { FocusScreen } from './components/FocusScreen';
import { QuestsScreen } from './components/QuestsScreen';

// Settings window loads the same renderer with ?view=settings
const isSettingsWindow = new URLSearchParams(window.location.search).get('view') === 'settings';

const TABS = [
  { id: 'timer',  label: '[ Focus ]'  },
  { id: 'today',  label: '[ Stats ]'  },
  { id: 'quests', label: '[ Quests ]' },
];

function getThemeByTime() {
  const h = new Date().getHours();
  return (h >= 6 && h < 18) ? 'morning' : 'twilight';
}

function getInitialTheme() {
  // Manual override stored in localStorage; if none, derive from current time
  try {
    const stored = localStorage.getItem('gt-theme-manual');
    return stored || getThemeByTime();
  } catch { return getThemeByTime(); }
}

export default function App() {
  if (isSettingsWindow) {
    const theme = getInitialTheme();
    return (
      <div className="app-shell" data-theme={theme}>
        <BackgroundScene theme={theme} />
        <div className="panel">
          <div className="app-content app-content--settings">
            <Settings />
          </div>
        </div>
      </div>
    );
  }

  const { timeLeft, totalSeconds, status, type, start, pause, reset: resetTimer, stop, startShortBreak, startLongBreak } = useTimer();
  const [tab, setTab] = useState('timer');
  const [completedSession, setCompletedSession] = useState(null);
  const [theme, setTheme] = useState(getInitialTheme);

  const [badgeUnlocks, setBadgeUnlocks] = useState([]);
  const [questSlate, setQuestSlate] = useState(undefined);
  const [productiveDays, setProductiveDays] = useState([]);

  // Today tab data fetched eagerly
  const [todaySessions, setTodaySessions] = useState(undefined);
  const [todayCommits, setTodayCommits] = useState(undefined);
  const [todayXp, setTodayXp] = useState(undefined);
  const [xpState, setXpState] = useState(undefined);
  const [streakState, setStreakState] = useState(undefined);

  function getTodayStr() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  }

  async function loadTodayData() {
    if (!window.electronAPI) return;
    const today = getTodayStr();
    const [sessions, dayCommits, xp, xpSt, streakSt] = await Promise.all([
      window.electronAPI.getSessions(today),
      window.electronAPI.getDayCommits(today),
      window.electronAPI.getDayXp(today),
      window.electronAPI.getXpState(),
      window.electronAPI.getStreakState(),
    ]);
    setTodaySessions(sessions);
    setTodayCommits(dayCommits);
    setTodayXp(xp);
    setXpState(xpSt);
    setStreakState(streakSt);
  }

  useEffect(() => {
    if (!window.electronAPI) return;
    window.electronAPI.getBadgeUnlocks().then(records => setBadgeUnlocks(records ?? []));
    window.electronAPI.getQuestSlate().then(s => setQuestSlate(s ?? null));
    window.electronAPI.getProductiveDays().then(days => setProductiveDays((days ?? []).map(d => d.day)));
    loadTodayData();
    const unsubBadges = window.electronAPI.onBadgesUpdated(records => setBadgeUnlocks(records ?? []));
    const unsubQuests = window.electronAPI.onQuestsUpdated(s => setQuestSlate(s ?? null));
    return () => { unsubBadges(); unsubQuests(); };
  }, []);

  useEffect(() => {
    if (!window.electronAPI) return;
    const cleanup = window.electronAPI.onSessionComplete((session) => {
      setCompletedSession(session);
      setTab('timer');
      loadTodayData();
      window.electronAPI.getProductiveDays().then(days => setProductiveDays((days ?? []).map(d => d.day)));
    });
    return cleanup;
  }, []);

  // Apply theme to root element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  function toggleTheme() {
    setTheme(t => {
      const next = t === 'morning' ? 'twilight' : 'morning';
      // Only persist if user is manually overriding the time-based default
      try { localStorage.setItem('gt-theme-manual', next); } catch {}
      return next;
    });
  }

  function handleDismissComplete() { setCompletedSession(null); }
  function reset() { setCompletedSession(null); resetTimer(); }

  const showSessionComplete = tab === 'timer' && completedSession !== null;

  return (
    <div className="app-shell" data-theme={theme}>
      <BackgroundScene theme={theme} />

      <div className="panel">
        <div className="app-content">
          <div className="top-bar">
            <nav className="tab-bar">
              {TABS.map(t => (
                <button
                  key={t.id}
                  className={`tab-bar__item${tab === t.id && !(t.id === 'timer' && showSessionComplete) ? ' tab-bar__item--active' : ''}`}
                  onClick={() => {
                    if (t.id === 'timer') setCompletedSession(null);
                    setTab(t.id);
                  }}
                >
                  {t.label}
                </button>
              ))}
            </nav>
            <button className="theme-toggle" onClick={toggleTheme} title="Toggle theme">
              {theme === 'morning' ? '☀' : '☽'}
            </button>
          </div>

          <div className="panel__body">
            {tab === 'timer' && !showSessionComplete && (
              <div className="screen screen--timer">
                <FocusScreen
                  timeLeft={timeLeft}
                  totalSeconds={totalSeconds}
                  status={status}
                  type={type}
                  onStart={start}
                  onPause={pause}
                  onReset={reset}
                  onSelectFocus={stop}
                  onSelectShortBreak={startShortBreak}
                  onSelectLongBreak={startLongBreak}
                  onConfig={() => window.electronAPI?.openSettings()}
                  todaySessions={todaySessions}
                  todayCommits={todayCommits}
                  todayXp={todayXp}
                />
              </div>
            )}

            {showSessionComplete && (
              <div className="screen screen--sc">
                <SessionComplete session={completedSession} onDismiss={handleDismissComplete} />
              </div>
            )}

            {tab === 'today' && (
              <div className="screen screen--today">
                <ErrorBoundary>
                  <DayTimeline
                    questSlate={questSlate}
                    badgeUnlocks={badgeUnlocks}
                    sessions={todaySessions}
                    dayCommits={todayCommits}
                    dayXp={todayXp}
                    xpState={xpState}
                    streakState={streakState}
                  />
                </ErrorBoundary>
              </div>
            )}

            {tab === 'week' && (
              <div className="screen screen--week">
                <WeekDigest />
              </div>
            )}

            {tab === 'quests' && (
              <div className="screen screen--quests">
                <QuestsScreen questSlate={questSlate} badgeUnlocks={badgeUnlocks} productiveDays={productiveDays} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
