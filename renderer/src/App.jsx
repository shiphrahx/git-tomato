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

function toRepos(commits) {
  const map = {};
  for (const c of commits) {
    if (!map[c.repo]) map[c.repo] = { repo: c.repo, remoteUrl: c.remoteUrl, commits: [] };
    map[c.repo].commits.push({ hash: c.hash, message: c.message, author: c.author });
  }
  return Object.values(map);
}

function mergeCommits(repos, newCommits) {
  const map = {};
  for (const r of repos) map[r.repo] = { ...r, commits: [...r.commits] };
  for (const c of newCommits) {
    if (!map[c.repo]) map[c.repo] = { repo: c.repo, remoteUrl: c.remoteUrl, commits: [] };
    if (!map[c.repo].commits.find(x => x.hash === c.hash)) {
      map[c.repo].commits.push({ hash: c.hash, message: c.message, author: c.author });
    }
  }
  return Object.values(map);
}

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

  const { timeLeft, totalSeconds, status, type, start, pause, reset: resetTimer } = useTimer();

  function reset() {
    setCompletedSessions(prev => prev.filter(s => !s._live));
    resetTimer();
  }
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

  // Listen for live commits polled during a running session
  React.useEffect(() => {
    if (!window.electronAPI) return;
    const cleanup = window.electronAPI.onLiveCommits((newCommits) => {
      setCompletedSessions(prev => {
        // Append as a synthetic in-progress session entry so displayCommits picks them up
        const live = prev.find(s => s._live);
        if (live) {
          return prev.map(s => s._live
            ? { ...s, repos: mergeCommits(s.repos, newCommits) }
            : s
          );
        }
        return [...prev, { _live: true, type: 'focus', durationMinutes: 0, repos: toRepos(newCommits) }];
      });
    });
    return cleanup;
  }, []);

  // totalSeconds comes from main process (reflects actual configured duration)

  // Gather commits from all completed sessions this session
  const displayCommits = completedSessions.flatMap(s =>
    s.repos.flatMap(r => r.commits.map(c => ({ repo: r.repo, message: c.message, hash: c.hash, remoteUrl: r.remoteUrl })))
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
              {displayCommits.length > 0 && <div className="panel__connector" />}
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
