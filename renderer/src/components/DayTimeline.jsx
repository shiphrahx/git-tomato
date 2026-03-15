import React, { useState, useEffect } from 'react';
import { SessionCard } from './SessionCard';

function getTodayStr() {
  return new Date().toISOString().slice(0, 10); // 'YYYY-MM-DD'
}

export function DayTimeline() {
  const [sessions, setSessions] = useState([]);

  async function loadToday() {
    if (!window.electronAPI) return;
    const today = getTodayStr();
    const data = await window.electronAPI.getSessions(today);
    setSessions(data);
  }

  // Load on mount
  useEffect(() => {
    loadToday();
  }, []);

  // Reload whenever a session completes
  useEffect(() => {
    if (!window.electronAPI) return;
    const cleanup = window.electronAPI.onSessionComplete(() => loadToday());
    return cleanup;
  }, []);

  const focusSessions = sessions.filter(s => s.type === 'focus');
  const totalFocusMinutes = focusSessions.reduce((sum, s) => sum + s.duration_minutes, 0);
  const totalCommits = sessions.reduce(
    (sum, s) => sum + s.repos.reduce((r, repo) => r + repo.commits.length, 0),
    0
  );

  if (sessions.length === 0) {
    return (
      <div className="timeline-empty">
        <div className="timeline-empty__icon">🍅</div>
        <div>No sessions yet today.</div>
        <div className="timeline-empty__hint">Start a Pomodoro to get going!</div>
      </div>
    );
  }

  return (
    <div className="day-timeline">
      <div className="day-timeline__summary">
        <span>{totalFocusMinutes} min focused</span>
        <span>{totalCommits} commit{totalCommits !== 1 ? 's' : ''}</span>
      </div>
      <div className="day-timeline__list">
        {sessions.map(s => (
          <SessionCard key={s.id} session={s} />
        ))}
      </div>
    </div>
  );
}
