import React, { useState, useEffect } from 'react';
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
  { id: 'timer',  label: 'Focus',  icon: '🍅' },
  { id: 'today',  label: 'Stats',  icon: '📊' },
  { id: 'week',   label: 'Week',   icon: '📅' },
  { id: 'quests', label: 'Quests', icon: '⚔' },
];

function getInitialTheme() {
  try { return localStorage.getItem('gt-theme') || 'twilight'; } catch { return 'twilight'; }
}

export default function App() {
  if (isSettingsWindow) {
    return (
      <div className="app-shell app-shell--settings">
        <Settings />
      </div>
    );
  }

  const { timeLeft, totalSeconds, status, type, start, pause, reset: resetTimer, stop, startShortBreak, startLongBreak } = useTimer();
  const [tab, setTab] = useState('timer');
  const [completedSession, setCompletedSession] = useState(null);
  const [theme, setTheme] = useState(getInitialTheme);

  const [badgeUnlocks, setBadgeUnlocks] = useState([]);
  const [questSlate, setQuestSlate] = useState(undefined);

  // Today tab data fetched eagerly
  const [todaySessions, setTodaySessions] = useState(undefined);
  const [todayCommits, setTodayCommits] = useState(undefined);
  const [todayXp, setTodayXp] = useState(undefined);

  function getTodayStr() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  }

  async function loadTodayData() {
    if (!window.electronAPI) return;
    const today = getTodayStr();
    const [sessions, dayCommits, xp] = await Promise.all([
      window.electronAPI.getSessions(today),
      window.electronAPI.getDayCommits(today),
      window.electronAPI.getDayXp(today),
    ]);
    setTodaySessions(sessions);
    setTodayCommits(dayCommits);
    setTodayXp(xp);
  }

  useEffect(() => {
    if (!window.electronAPI) return;
    window.electronAPI.getBadgeUnlocks().then(records => setBadgeUnlocks(records ?? []));
    window.electronAPI.getQuestSlate().then(s => setQuestSlate(s ?? null));
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
    });
    return cleanup;
  }, []);

  // Apply theme to root element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem('gt-theme', theme); } catch {}
  }, [theme]);

  function toggleTheme() {
    setTheme(t => t === 'morning' ? 'twilight' : 'morning');
  }

  function handleDismissComplete() { setCompletedSession(null); }
  function reset() { setCompletedSession(null); resetTimer(); }

  const showSessionComplete = tab === 'timer' && completedSession !== null;

  return (
    <div className="app-shell" data-theme={theme}>
      <BackgroundScene theme={theme} />

      <div className="panel">
        <button className="theme-toggle" onClick={toggleTheme} title="Toggle theme">
          {theme === 'morning' ? '[ ☀ ]' : '[ ☽ ]'}
        </button>

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
              <DayTimeline
                questSlate={questSlate}
                badgeUnlocks={badgeUnlocks}
                sessions={todaySessions}
                dayCommits={todayCommits}
                dayXp={todayXp}
              />
            </div>
          )}

          {tab === 'week' && (
            <div className="screen screen--week">
              <WeekDigest />
            </div>
          )}

          {tab === 'quests' && (
            <div className="screen screen--quests">
              <QuestsScreen questSlate={questSlate} badgeUnlocks={badgeUnlocks} />
            </div>
          )}
        </div>

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
              <span className="tab-bar__icon">{t.icon}</span>
              <span className="tab-bar__label">{t.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
