import React, { useState } from 'react';
import { useTimer } from './hooks/useTimer';
import { Timer } from './components/Timer';
import { Controls } from './components/Controls';
import { CommitList } from './components/CommitList';
import { DayTimeline } from './components/DayTimeline';
import { WeekDigest } from './components/WeekDigest';
import { Settings } from './components/Settings';

// Settings window loads the same renderer with ?view=settings
const isSettingsWindow = new URLSearchParams(window.location.search).get('view') === 'settings';

// Format ms of focus time as "Xh Ym" or "Xm"
function formatFocusTime(totalMinutes) {
  if (totalMinutes < 60) return `${totalMinutes}m`;
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export default function App() {
  if (isSettingsWindow) {
    return (
      <div className="app-shell app-shell--settings">
        <Settings />
      </div>
    );
  }

  const { timeLeft, totalSeconds, status, type, start, pause, reset } = useTimer();
  const [view, setView] = useState('timer');
  const [completedSessions, setCompletedSessions] = useState([]);

  // Listen for real session completions
  React.useEffect(() => {
    if (!window.electronAPI) return;
    const cleanup = window.electronAPI.onSessionComplete((session) => {
      setCompletedSessions(prev => [...prev, session]);
    });
    return cleanup;
  }, []);

  // totalSeconds comes from main process (reflects actual configured duration)

  // Gather commits from all completed sessions this session
  const displayCommits = completedSessions.flatMap(s =>
    s.repos.flatMap(r => r.commits.map(c => ({ repo: r.repo, message: c.message })))
  );

  // Total focus minutes from completed sessions
  const focusMinutes = completedSessions
    .filter(s => s.type === 'focus')
    .reduce((sum, s) => sum + s.durationMinutes, 0);

  const headerLabel = focusMinutes > 0
    ? `Today's Focus — ${formatFocusTime(focusMinutes)}`
    : "Today's Focus";

  return (
    <div className="app-shell">
      <div className="panel">
        {/* Nav tabs */}
        <div className="panel__nav">
          <button
            className={`panel__tab${view === 'timer' ? ' panel__tab--active' : ''}`}
            onClick={() => setView('timer')}
          >
            Timer
          </button>
          <button
            className={`panel__tab${view === 'timeline' ? ' panel__tab--active' : ''}`}
            onClick={() => setView('timeline')}
          >
            Today
          </button>
          <button
            className={`panel__tab${view === 'week' ? ' panel__tab--active' : ''}`}
            onClick={() => setView('week')}
          >
            Week
          </button>
        </div>

        {view === 'timer' ? (
          <div className="panel__body">
            {/* Fixed upper section: header + ring + controls */}
            <div className="panel__timer-fixed">
              <h1 className="panel__heading">{headerLabel}</h1>
              <div className="panel__timer">
                <Timer timeLeft={timeLeft} totalSeconds={totalSeconds} status={status} />
              </div>
              <div className="panel__controls">
                <Controls status={status} onStart={start} onPause={pause} onReset={reset} />
              </div>
              <div className="panel__connector" />
            </div>

            {/* Scrollable commit list */}
            <div className="panel__commit-scroll">
              <CommitList commits={displayCommits} />
            </div>
          </div>
        ) : view === 'timeline' ? (
          <div className="panel__body panel__body--timeline">
            <DayTimeline />
          </div>
        ) : (
          <div className="panel__body panel__body--timeline">
            <WeekDigest />
          </div>
        )}
      </div>
    </div>
  );
}
