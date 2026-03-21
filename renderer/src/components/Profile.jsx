import React, { useState, useEffect } from 'react';

const LEVEL_BADGES  = ['🌱', '🔨', '🚢', '🔧', '⭐', '🎯', '🏆'];
const LEVEL_TITLES  = ['Seedling', 'Committer', 'Shipper', 'Maintainer', 'Staff', 'Principal', 'Legend'];
const PRODUCTIVE_DAYS_REQUIRED = 5;

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

export function Profile() {
  const [stats, setStats] = useState(null);
  const [xpState, setXpState] = useState(null);
  const [streakState, setStreakState] = useState(null);

  useEffect(() => {
    if (!window.electronAPI) return;

    async function load() {
      const all = await window.electronAPI.getSessions();
      const days = getWeekDays();
      const weekResults = await Promise.all(
        days.map(d => window.electronAPI.getSessions(d))
      );

      const focusSessions = all.filter(s => s.type === 'focus');
      const totalSessions = focusSessions.length;
      const totalFocusMinutes = focusSessions.reduce((sum, s) => sum + s.duration_minutes, 0);

      // Total commits this week (rough approximation from session repos)
      const weekSessions = weekResults.flat();
      const weekCommits = weekSessions.reduce(
        (sum, s) => sum + (s.repos ? JSON.parse(typeof s.repos === 'string' ? s.repos : '[]').reduce(
          (s2, r) => s2 + (r.commits?.length ?? 0), 0
        ) : 0),
        0
      );

      setStats({ totalSessions, totalFocusMinutes, weekCommits });
    }

    async function loadXp() {
      const state = await window.electronAPI.getXpState();
      setXpState(state);
    }

    async function loadStreak() {
      const state = await window.electronAPI.getStreakState();
      setStreakState(state);
    }

    load();
    loadXp();
    loadStreak();

    const unsub = window.electronAPI.onXpStateUpdated((payload) => {
      setXpState(payload);
      if (payload.streakState) setStreakState(payload.streakState);
    });
    return unsub;
  }, []);

  if (!stats || !xpState) {
    return <div className="settings-loading">Loading…</div>;
  }

  const hours = Math.floor(stats.totalFocusMinutes / 60);
  const mins = stats.totalFocusMinutes % 60;
  const focusLabel = hours > 0
    ? (mins > 0 ? `${hours}h ${mins}m` : `${hours}h`)
    : `${mins}m`;

  const badge = LEVEL_BADGES[xpState.levelIndex] ?? '🌱';
  const isLegend = xpState.xpToNextLevel == null;
  const progressPct = isLegend
    ? 100
    : Math.min(100, Math.round((xpState.xpSinceLevel / xpState.xpToNextLevel) * 100));

  // Streak display values
  const dailyStreak = streakState?.dailyStreak ?? 0;
  const weeklyStreak = streakState?.weeklyStreak ?? 0;
  const longestDaily = streakState?.longestDailyStreak ?? 0;
  const longestWeekly = streakState?.longestWeeklyStreak ?? 0;
  const productiveDaysThisWeek = streakState?.productiveDaysThisWeek ?? 0;
  const isDailyAtRisk = streakState?.isDailyAtRisk ?? false;
  const isWeeklyAtRisk = streakState?.isWeeklyAtRisk ?? false;

  return (
    <div className="profile">
      <div className="profile__level-card">
        <div className="profile__level-badge">{badge}</div>
        <div className="profile__level-info">
          <div className="profile__level-title">{xpState.levelTitle ?? LEVEL_TITLES[xpState.levelIndex] ?? `Level ${xpState.levelIndex}`}</div>
          <div className="profile__level-xp">{xpState.totalXp} XP total</div>
          {!isLegend && (
            <div className="xp-bar">
              <div className="xp-bar__fill" style={{ width: `${progressPct}%` }} />
            </div>
          )}
          {!isLegend && (
            <div className="profile__xp-meta">
              <span>{xpState.xpSinceLevel} / {xpState.xpToNextLevel} XP to next level</span>
              <span>{progressPct}%</span>
            </div>
          )}
          {isLegend && (
            <div className="xp-legend-label">Total XP: {xpState.totalXp}</div>
          )}
        </div>
      </div>

      {/* G-1, G-2: Streak section */}
      <div className="profile__section-title">Streaks</div>
      <div className="profile__stats">
        <div className={`profile__stat${isDailyAtRisk ? ' profile__stat--at-risk' : ''}`}>
          <span className="profile__stat-value">{dailyStreak}</span>
          <span className="profile__stat-label">
            Day streak{isDailyAtRisk ? ' ⚠' : ''}
          </span>
        </div>
        <div className={`profile__stat${isWeeklyAtRisk ? ' profile__stat--at-risk' : ''}`}>
          <span className="profile__stat-value">{weeklyStreak}</span>
          <span className="profile__stat-label">
            Week streak{isWeeklyAtRisk ? ' ⚠' : ''}
          </span>
        </div>
        <div className="profile__stat">
          <span className="profile__stat-value">{productiveDaysThisWeek}/{PRODUCTIVE_DAYS_REQUIRED}</span>
          <span className="profile__stat-label">Days this week</span>
        </div>
      </div>

      {/* G-3: Longest streaks */}
      <div className="profile__section-title">Personal bests</div>
      <div className="profile__stats">
        <div className="profile__stat">
          <span className="profile__stat-value">{longestDaily}</span>
          <span className="profile__stat-label">Longest day streak</span>
        </div>
        <div className="profile__stat">
          <span className="profile__stat-value">{longestWeekly}</span>
          <span className="profile__stat-label">Longest week streak</span>
        </div>
      </div>

      <div className="profile__section-title">All-time stats</div>
      <div className="profile__stats">
        <div className="profile__stat">
          <span className="profile__stat-value">{stats.totalSessions}</span>
          <span className="profile__stat-label">Sessions</span>
        </div>
        <div className="profile__stat">
          <span className="profile__stat-value">{focusLabel}</span>
          <span className="profile__stat-label">Focus time</span>
        </div>
      </div>
    </div>
  );
}
