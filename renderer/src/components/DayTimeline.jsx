import React, { useState, useEffect } from 'react';
import { RepoCommitList } from './RepoCommitList';
import { BADGES as BADGE_DEFS } from './Badges';

function getTodayStr() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function StatCard({ icon, value, label }) {
  return (
    <div className="dp-stat">
      <div className="dp-stat__value">
        <span className="dp-stat__plus">+</span>{value}
      </div>
      <div className="dp-stat__label">{label}</div>
    </div>
  );
}

export function DayTimeline() {
  const [sessions, setSessions] = useState([]);
  const [repos, setRepos] = useState([]);
  const [sessionWindows, setSessionWindows] = useState([]);
  const [todayXp, setTodayXp] = useState(0);
  const [todayLines, setTodayLines] = useState(0);
  const [badgeUnlocks, setBadgeUnlocks] = useState([]);

  async function loadToday() {
    if (!window.electronAPI) return;
    const today = getTodayStr();
    const [sessionData, dayCommits, xp, badges] = await Promise.all([
      window.electronAPI.getSessions(today),
      window.electronAPI.getDayCommits(today),
      window.electronAPI.getDayXp(today),
      window.electronAPI.getBadgeUnlocks(),
    ]);
    setSessions(sessionData);
    setRepos(dayCommits.repos);
    setSessionWindows(dayCommits.sessionWindows);
    setTodayXp(xp?.xp ?? 0);
    setTodayLines(xp?.totalLines ?? 0);
    setBadgeUnlocks(badges ?? []);
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
  const totalLines = todayLines;

  // Badges unlocked today
  const todayStr = getTodayStr();
  const todayBadges = badgeUnlocks
    .filter(u => u.unlocked_at && u.unlocked_at.startsWith(todayStr))
    .map(u => BADGE_DEFS.find(b => b.slug === u.slug))
    .filter(Boolean);

  const isEmpty = repos.length === 0 && sessions.length === 0;

  if (isEmpty) {
    return (
      <div className="dp dp--empty">
        <div className="dp-empty__icon">🍅</div>
        <div className="dp-empty__title">No sessions yet today.</div>
        <div className="dp-empty__hint">Start a Pomodoro to get going!</div>
      </div>
    );
  }

  return (
    <div className="dp">
      {/* Header */}
      <div className="dp__header">
        <span className="dp__title">Daily Progress</span>
        {todayXp > 0 && (
          <span className="dp__xp">+{todayXp} XP</span>
        )}
      </div>

      {/* Stat cards */}
      <div className="dp__stats">
        <StatCard value={totalFocusMinutes} label="Focus min" />
        <StatCard value={totalCommits} label={totalCommits === 1 ? 'Commit' : 'Commits'} />
        <StatCard value={totalLines} label="Lines" />
      </div>

      {/* Badges earned today */}
      {todayBadges.length > 0 && (
        <div className="dp__section">
          <div className="dp__section-title">Badges earned</div>
          <div className="dp__badges">
            {todayBadges.map(badge => (
              <div key={badge.slug} className="dp-badge">
                <span className="dp-badge__icon">🏅</span>
                <div className="dp-badge__body">
                  <span className="dp-badge__name">{badge.name}</span>
                  <span className="dp-badge__desc">{badge.description}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Commits by repo */}
      {repos.length > 0 && (
        <div className="dp__section dp__section--commits">
          <div className="dp__section-title">Commits</div>
          <RepoCommitList repos={repos} sessionWindows={sessionWindows} />
        </div>
      )}
    </div>
  );
}
