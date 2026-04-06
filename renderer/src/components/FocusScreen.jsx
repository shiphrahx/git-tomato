import React from 'react';
import { TomatoSprite, getTomatoState } from './TomatoSprite';

// Flatten all commits from dayCommits into a flat list with repo name attached
function flatCommits(dayCommits) {
  if (!dayCommits?.repos) return [];
  const all = [];
  for (const r of dayCommits.repos) {
    for (const c of r.commits ?? []) {
      all.push({ ...c, repo: r.repo, remoteUrl: r.remoteUrl });
    }
  }
  // Sort newest first
  return all.sort((a, b) => b.timestamp - a.timestamp);
}

function isInSession(timestamp, sessionWindows) {
  return (sessionWindows ?? []).some(w => timestamp >= w.started_at && timestamp <= w.ended_at);
}

export function FocusScreen({
  timeLeft, totalSeconds, status, type,
  onStart, onPause, onReset, onSelectFocus, onSelectShortBreak, onSelectLongBreak, onConfig,
  todaySessions, todayCommits, todayXp,
}) {
  const progress = totalSeconds > 0 ? timeLeft / totalSeconds : 1;
  const spriteState = getTomatoState(progress);
  const isRunning = status === 'running';

  const mins = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const secs = (timeLeft % 60).toString().padStart(2, '0');

  const focusSessions = (todaySessions ?? []).filter(s => s.type === 'focus');
  const totalFocusMin = focusSessions.reduce((sum, s) => sum + s.duration_minutes, 0);
  const repos = todayCommits?.repos ?? [];
  const sessionWindows = todayCommits?.sessionWindows ?? [];
  const totalCommits = repos.reduce((sum, r) => sum + r.commits.length, 0);
  const todayLines = todayXp?.totalLines ?? 0;
  const xpToday = todayXp?.xp ?? 0;

  const commits = flatCommits(todayCommits);

  const phaseLabel = type === 'focus'
    ? '▶ Deep Focus Mode'
    : type === 'shortBreak'
    ? '— Short Break'
    : '— Long Break';

  // Session counter: completed focus sessions + 1 current, capped at 4
  const completedFocus = focusSessions.length;
  const currentSession = completedFocus + 1;
  const totalSessionsInSet = 4;
  const sessionTypeLabel = type === 'focus' ? 'Deep Focus' : type === 'shortBreak' ? 'Short Break' : 'Long Break';

  // Energy / time-remaining percentage
  const pct = Math.round(progress * 100);
  const energyLabel = pct > 66 ? 'High' : pct > 33 ? 'Medium' : 'Low';

  return (
    <div className="focus-layout">
      {/* ── LEFT: main timer card ── */}
      <div className="focus-main">
        <div className="card focus-timer-card">
          {/* Header bar */}
          <div className="focus-card-header">
            <span className="focus-card-header__title">git-tomato v0.1</span>
            <div className="focus-card-header__status">
              <div className="focus-card-header__dot" />
              <span className="focus-card-header__active">Active</span>
            </div>
          </div>

          {/* FIX 2 — Session counter */}
          <div className="focus-session-line">
            {sessionTypeLabel}
          </div>

          {/* Tomato mascot + energy label + HP bar (FIX 3) */}
          <div className="focus-tomato-group">
            <div className={`focus-tomato${isRunning ? ' focus-tomato--bobbing' : ''}`}>
              <TomatoSprite state={spriteState} />
            </div>
            <div className="focus-energy-label">⚡ Energy: {energyLabel}</div>
            <div className="bar-wrap focus-energy__bar">
              <div className="bar-fill focus-energy__fill" style={{ width: `${pct}%` }} />
            </div>
          </div>

          {/* Timer digits */}
          <div className="focus-digits num">{mins}:{secs}</div>

          {/* Phase label */}
          <div className={`focus-phase${isRunning ? '' : ' focus-phase--idle'}`}
               style={isRunning ? {} : { animationPlayState: 'paused', opacity: 0.5 }}>
            {phaseLabel}
          </div>

          {/* FIX 4 — Session dots */}
          <div className="focus-dots">
            {Array.from({ length: totalSessionsInSet }, (_, i) => {
              const done = i < completedFocus;
              const now  = i === completedFocus && type === 'focus';
              return (
                <div
                  key={i}
                  className={`dot${done ? ' done' : now ? ' now' : ''}`}
                />
              );
            })}
          </div>

          {/* FIX 5 — Time Remaining bar */}
          <div className="focus-time-remaining">
            <div className="lbl">Time Remaining</div>
            <div className="bar-wrap" style={{ height: '7px' }}>
              <div className="bar-fill" style={{ width: `${pct}%`, background: 'var(--accent)' }} />
            </div>
          </div>

          {/* Controls */}
          <div className="focus-controls">
            <div className="focus-modes">
              <button
                className={`focus-mode-btn${type === 'focus' ? ' focus-mode-btn--active' : ''}`}
                onClick={onSelectFocus}
                disabled={isRunning}
              >Focus</button>
              <button
                className={`focus-mode-btn${type === 'shortBreak' ? ' focus-mode-btn--active' : ''}`}
                onClick={onSelectShortBreak}
                disabled={isRunning}
              >Short</button>
              <button
                className={`focus-mode-btn${type === 'longBreak' ? ' focus-mode-btn--active' : ''}`}
                onClick={onSelectLongBreak}
                disabled={isRunning}
              >Long</button>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button
                className="btn btn-coral"
                onClick={isRunning ? onPause : onStart}
              >
                {isRunning ? '⏸ Pause' : '▶ Resume'}
              </button>
              <button className="btn btn-dim" onClick={onReset}>
                ↻ Restart
              </button>
              <button className="focus-action-btn" onClick={onConfig} title="Settings">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT: side panel ── */}
      <div className="focus-side">
        {/* Quick stats */}
        <div className="focus-stats">
          <div className="card focus-stat">
            <span className="focus-stat__val num">{focusSessions.length}</span>
            <span className="focus-stat__lbl">Pomodoros</span>
          </div>
          <div className="card focus-stat">
            <span className="focus-stat__val num">{totalCommits}</span>
            <span className="focus-stat__lbl">Commits</span>
          </div>
          <div className="card focus-stat">
            <span className="focus-stat__val num">{todayLines}</span>
            <span className="focus-stat__lbl">Lines</span>
          </div>
        </div>

        {/* XP card */}
        <div className="card card--gold focus-xp-card">
          <div className="focus-xp__label">XP Today</div>
          <div className="focus-xp__gained num">+{xpToday}</div>
          <div className="bar-wrap" style={{ height: '9px', marginTop: '4px' }}>
            <div className="bar-fill" style={{ width: `${Math.min(100, xpToday / 5)}%`, background: 'var(--gold)' }} />
          </div>
          <div className="focus-xp__bar-row">
            <span className="focus-xp__bar-label">{xpToday} XP</span>
            <span className="focus-xp__bar-next">Today's haul</span>
          </div>
        </div>

        {/* Git activity feed */}
        <div className="card focus-git">
          <div className="focus-git__title">Git Activity — Today</div>
          <div className="focus-git__scroll">
            {commits.length === 0 ? (
              <div className="focus-git__empty">No commits yet today.</div>
            ) : (
              commits.map(c => {
                const duringSession = isInSession(c.timestamp, sessionWindows);
                return (
                  <div key={c.hash} className="focus-commit">
                    <code
                      className={`focus-commit__hash${c.remoteUrl ? ' focus-commit__hash--link' : ''}`}
                      onClick={() => c.remoteUrl && window.electronAPI?.openUrl(`${c.remoteUrl}/commit/${c.hash}`)}
                      title={c.remoteUrl ? 'Open on GitHub' : undefined}
                    >
                      {c.hash.slice(0, 7)}
                    </code>
                    <div className="focus-commit__body">
                      <span className="focus-commit__msg">{c.message}</span>
                      <span className="focus-commit__meta">
                        <span style={{ color: 'var(--muted)' }}>{c.repo}</span>
                        {duringSession && <span style={{ color: 'var(--accent)' }}>🍅</span>}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
