import React, { useState, useEffect } from 'react';
import { RepoCommitList } from './RepoCommitList';

function localDateStr(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function getWeekDays() {
  const days = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    days.push(localDateStr(d));
  }
  return days;
}

function shortDayLabel(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  const today = localDateStr(new Date());
  if (dateStr === today) return 'Today';
  return d.toLocaleDateString('en-US', { weekday: 'short' });
}

export function WeekDigest() {
  const [weekData, setWeekData] = useState(null);

  async function loadWeek() {
    if (!window.electronAPI) return;
    const days = getWeekDays();
    const results = await Promise.all(
      days.map(async d => {
        const [sessions, dayCommits] = await Promise.all([
          window.electronAPI.getSessions(d),
          window.electronAPI.getDayCommits(d),
        ]);
        return { date: d, sessions, repos: dayCommits.repos, sessionWindows: dayCommits.sessionWindows };
      })
    );
    setWeekData(results);
  }

  useEffect(() => { loadWeek(); }, []);

  useEffect(() => {
    if (!window.electronAPI) return;
    const cleanup = window.electronAPI.onSessionComplete(() => loadWeek());
    return cleanup;
  }, []);

  if (!weekData) {
    return <div className="settings-loading">Loading…</div>;
  }

  const totalFocusMinutes = weekData.reduce((sum, { sessions }) =>
    sum + sessions.filter(s => s.type === 'focus').reduce((s2, s) => s2 + s.duration_minutes, 0), 0);

  const totalCommits = weekData.reduce((sum, { repos }) =>
    sum + repos.reduce((s2, r) => s2 + r.commits.length, 0), 0);

  const maxMinutes = Math.max(...weekData.map(({ sessions }) =>
    sessions.filter(s => s.type === 'focus').reduce((sum, s) => sum + s.duration_minutes, 0)
  ), 1);

  // Collect all repos across the week — merge commits and session windows per repo
  const repoMap = {};
  const allSessionWindows = [];
  weekData.forEach(({ repos, sessions, sessionWindows }) => {
    const focusMinutes = sessions.filter(s => s.type === 'focus')
      .reduce((sum, s) => sum + s.duration_minutes, 0);
    if (sessionWindows) allSessionWindows.push(...sessionWindows);
    repos.forEach(r => {
      if (!repoMap[r.repo]) repoMap[r.repo] = { repo: r.repo, remoteUrl: r.remoteUrl, commits: [], minutes: 0 };
      // De-duplicate commits by hash across days
      const seen = new Set(repoMap[r.repo].commits.map(c => c.hash));
      r.commits.forEach(c => { if (!seen.has(c.hash)) repoMap[r.repo].commits.push(c); });
      repoMap[r.repo].minutes += focusMinutes;
    });
  });
  const repos = Object.values(repoMap).sort((a, b) => b.commits.length - a.commits.length);

  const hasAnyData = weekData.some(({ sessions, repos }) => sessions.length > 0 || repos.length > 0);

  return (
    <div className="week-digest">
      <div className="week-digest__summary">
        <span>{totalFocusMinutes} min focused</span>
        <span>{totalCommits} commit{totalCommits !== 1 ? 's' : ''}</span>
      </div>

      <div className="week-digest__scroll">
        {!hasAnyData ? (
          <div className="timeline-empty">
            <div className="timeline-empty__icon">🍅</div>
            <div>No sessions this week.</div>
            <div className="timeline-empty__hint">Start a Pomodoro to get going!</div>
          </div>
        ) : (
          <>
            <div className="week-chart">
              {weekData.map(({ date, sessions, repos: dayRepos }) => {
                const focusMin = sessions.filter(s => s.type === 'focus')
                  .reduce((sum, s) => sum + s.duration_minutes, 0);
                const commits = dayRepos.reduce((sum, r) => sum + r.commits.length, 0);
                const heightPct = (focusMin / maxMinutes) * 100;
                const isToday = date === localDateStr(new Date());

                return (
                  <div key={date} className="week-chart__col">
                    <div className="week-chart__bar-wrap">
                      <div
                        className={`week-chart__bar${isToday ? ' week-chart__bar--today' : ''}`}
                        style={{ height: `${heightPct}%` }}
                        title={`${focusMin} min`}
                      />
                    </div>
                    <div className={`week-chart__label${isToday ? ' week-chart__label--today' : ''}`}>
                      {shortDayLabel(date)}
                    </div>
                    {commits > 0 && (
                      <div className="week-chart__commits">{commits}</div>
                    )}
                  </div>
                );
              })}
            </div>

            {repos.length > 0 && (
              <div className="week-repos">
                <div className="week-repos__title">Repositories</div>
                <RepoCommitList repos={repos} sessionWindows={allSessionWindows} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
