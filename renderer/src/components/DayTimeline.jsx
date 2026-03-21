import React, { useState, useEffect } from 'react';
import { RepoCommitList } from './RepoCommitList';

function getTodayStr() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function DayTimeline() {
  const [sessions, setSessions] = useState([]);
  const [repos, setRepos] = useState([]);
  const [sessionWindows, setSessionWindows] = useState([]);

  async function loadToday() {
    if (!window.electronAPI) return;
    const today = getTodayStr();
    const [sessionData, dayCommits] = await Promise.all([
      window.electronAPI.getSessions(today),
      window.electronAPI.getDayCommits(today),
    ]);
    setSessions(sessionData);
    setRepos(dayCommits.repos);
    setSessionWindows(dayCommits.sessionWindows);
  }

  useEffect(() => { loadToday(); }, []);

  useEffect(() => {
    if (!window.electronAPI) return;
    const cleanup = window.electronAPI.onSessionComplete(() => loadToday());
    return cleanup;
  }, []);

  const focusSessions = sessions.filter(s => s.type === 'focus');
  const totalFocusMinutes = focusSessions.reduce((sum, s) => sum + s.duration_minutes, 0);
  const totalCommits = repos.reduce((sum, r) => sum + r.commits.length, 0);

  if (repos.length === 0 && sessions.length === 0) {
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
        <RepoCommitList repos={repos} sessionWindows={sessionWindows} />
      </div>
    </div>
  );
}
