import React, { useState, useEffect } from 'react';
import { useTimer } from './hooks/useTimer';
import { Timer } from './components/Timer';
import { Controls } from './components/Controls';
import { DayTimeline } from './components/DayTimeline';
import { WeekDigest } from './components/WeekDigest';
import { Settings } from './components/Settings';
import { SessionComplete } from './components/SessionComplete';
import { Profile } from './components/Profile';
import { BADGES as BADGE_DEFS } from './components/Badges';

const TOTAL_BADGES = BADGE_DEFS.length; // 25

// Settings window loads the same renderer with ?view=settings
const isSettingsWindow = new URLSearchParams(window.location.search).get('view') === 'settings';

const TABS = [
  { id: 'timer',   label: 'Timer',   icon: '⏱' },
  { id: 'today',   label: 'Today',   icon: '📅' },
  { id: 'week',    label: 'Week',    icon: '📊' },
  { id: 'profile', label: 'Profile', icon: '👤' },
];

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

  // E-4, E-5: badge unlock state for header
  const [badgeUnlocks, setBadgeUnlocks] = useState([]);
  const [questSlate, setQuestSlate] = useState(undefined);

  useEffect(() => {
    if (!window.electronAPI) return;

    // Load initial badge unlocks and quest slate eagerly
    window.electronAPI.getBadgeUnlocks().then(records => {
      setBadgeUnlocks(records ?? []);
    });
    window.electronAPI.getQuestSlate().then(s => setQuestSlate(s ?? null));

    // Subscribe to badge and quest updates
    const unsubBadges = window.electronAPI.onBadgesUpdated((records) => {
      setBadgeUnlocks(records ?? []);
    });
    const unsubQuests = window.electronAPI.onQuestsUpdated(s => setQuestSlate(s ?? null));

    return () => { unsubBadges(); unsubQuests(); };
  }, []);

  // When a session completes, capture it and switch to the session-complete screen
  useEffect(() => {
    if (!window.electronAPI) return;
    const cleanup = window.electronAPI.onSessionComplete((session) => {
      setCompletedSession(session);
      setTab('timer'); // ensure we're on timer tab so sc screen shows
    });
    return cleanup;
  }, []);

  function handleDismissComplete() {
    setCompletedSession(null);
  }

  function reset() {
    setCompletedSession(null);
    resetTimer();
  }

  const showSessionComplete = tab === 'timer' && completedSession !== null;

  // E-4: badge count
  const unlockedCount = badgeUnlocks.length;

  // E-5: most recently unlocked badge
  const mostRecent = badgeUnlocks.length > 0
    ? badgeUnlocks.reduce((a, b) => (a.unlocked_at > b.unlocked_at ? a : b))
    : null;
  const mostRecentDef = mostRecent
    ? BADGE_DEFS.find(b => b.slug === mostRecent.slug)
    : null;

  return (
    <div className="app-shell">
      <div className="panel">
        {/* E-4, E-5: badge header strip */}
        {(unlockedCount > 0 || mostRecentDef) && (
          <div className="badge-header">
            <span className="badge-header__count">🏅 {unlockedCount} / {TOTAL_BADGES}</span>
            {mostRecentDef && (
              <span className="badge-header__recent">{mostRecentDef.name}</span>
            )}
          </div>
        )}

        <div className="panel__body">
          {tab === 'timer' && !showSessionComplete && (
            <div className="screen screen--timer">
              <div className="screen__timer-inner">
                <p className="timer-type-label">{type === 'focus' ? 'Focus' : type === 'longBreak' ? 'Long Break' : 'Short Break'}</p>
                <Timer timeLeft={timeLeft} totalSeconds={totalSeconds} status={status} />
                <div className="panel__controls">
                  <Controls status={status} type={type} onStart={start} onPause={pause} onReset={reset} onSelectFocus={stop} onSelectShortBreak={startShortBreak} onSelectLongBreak={startLongBreak} onConfig={() => window.electronAPI?.openSettings()} />
                </div>
              </div>
            </div>
          )}

          {showSessionComplete && (
            <div className="screen screen--sc">
              <SessionComplete session={completedSession} onDismiss={handleDismissComplete} />
            </div>
          )}

          {tab === 'today' && (
            <div className="screen screen--today">
              <DayTimeline questSlate={questSlate} />
            </div>
          )}

          {tab === 'week' && (
            <div className="screen screen--week">
              <WeekDigest />
            </div>
          )}

          {tab === 'profile' && (
            <div className="screen screen--profile">
              <Profile />
            </div>
          )}


        </div>

        {/* Bottom tab bar */}
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
