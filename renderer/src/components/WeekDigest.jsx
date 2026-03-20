import React, { useState, useEffect } from 'react';

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

  useEffect(() => {
    if (!window.electronAPI) return;
    const days = getWeekDays();
    Promise.all(days.map(d => window.electronAPI.getSessions(d).then(s => ({ date: d, sessions: s }))))
      .then(results => setWeekData(results));
  }, []);

  useEffect(() => {
    if (!window.electronAPI) return;
    const cleanup = window.electronAPI.onSessionComplete(() => {
      const days = getWeekDays();
      Promise.all(days.map(d => window.electronAPI.getSessions(d).then(s => ({ date: d, sessions: s }))))
        .then(results => setWeekData(results));
    });
    return cleanup;
  }, []);

  if (!weekData) {
    return <div className="settings-loading">Loading…</div>;
  }

  const totalFocusMinutes = weekData.reduce((sum, { sessions }) =>
    sum + sessions.filter(s => s.type === 'focus').reduce((s2, s) => s2 + s.duration_minutes, 0), 0);

  const totalCommits = weekData.reduce((sum, { sessions }) =>
    sum + sessions.reduce((s2, s) => s2 + s.repos.reduce((s3, r) => s3 + r.commits.length, 0), 0), 0);

  const maxMinutes = Math.max(...weekData.map(({ sessions }) =>
    sessions.filter(s => s.type === 'focus').reduce((sum, s) => sum + s.duration_minutes, 0)
  ), 1);

  // Collect all repos across the week
  const repoMap = {};
  weekData.forEach(({ sessions }) => {
    sessions.filter(s => s.type === 'focus').forEach(s => {
      s.repos.forEach(r => {
        if (!repoMap[r.repo]) repoMap[r.repo] = { commits: 0, minutes: 0 };
        repoMap[r.repo].commits += r.commits.length;
        repoMap[r.repo].minutes += s.duration_minutes;
      });
    });
  });
  const repos = Object.entries(repoMap).sort((a, b) => b[1].commits - a[1].commits);

  const hasAnyData = weekData.some(({ sessions }) => sessions.length > 0);

  return (
    <div className="week-digest">
      {/* Summary bar */}
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
            {/* Daily bar chart */}
            <div className="week-chart">
              {weekData.map(({ date, sessions }) => {
                const focusMin = sessions.filter(s => s.type === 'focus')
                  .reduce((sum, s) => sum + s.duration_minutes, 0);
                const commits = sessions.reduce((sum, s) =>
                  sum + s.repos.reduce((r, repo) => r + repo.commits.length, 0), 0);
                const heightPct = (focusMin / maxMinutes) * 100;
                const isToday = date === new Date().toISOString().slice(0, 10);

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

            {/* Repo breakdown */}
            {repos.length > 0 && (
              <div className="week-repos">
                <div className="week-repos__title">Repositories</div>
                {repos.map(([repo, { commits, minutes }]) => (
                  <div key={repo} className="week-repos__row">
                    <span className="week-repos__name">{repo}</span>
                    <span className="week-repos__meta">{commits} commit{commits !== 1 ? 's' : ''} · {minutes} min</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
