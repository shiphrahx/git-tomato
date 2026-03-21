import React, { useState, useEffect } from 'react';

const LEVEL_BADGES  = ['🌱', '🔨', '🚢', '🔧', '⭐', '🎯', '🏆'];
const LEVEL_TITLES  = ['Seedling', 'Committer', 'Shipper', 'Maintainer', 'Staff', 'Principal', 'Legend'];

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

      // Streak: count consecutive days with at least one focus session up to today
      const sessionDays = new Set(
        focusSessions.map(s => localDateStr(new Date(s.started_at)))
      );
      let streak = 0;
      const today = new Date();
      for (let i = 0; i < 365; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        if (sessionDays.has(localDateStr(d))) {
          streak++;
        } else {
          break;
        }
      }

      // Total commits this week (rough approximation from session repos)
      const weekSessions = weekResults.flat();
      const weekCommits = weekSessions.reduce(
        (sum, s) => sum + (s.repos ? JSON.parse(typeof s.repos === 'string' ? s.repos : '[]').reduce(
          (s2, r) => s2 + (r.commits?.length ?? 0), 0
        ) : 0),
        0
      );

      setStats({ totalSessions, totalFocusMinutes, streak, weekCommits });
    }

    async function loadXp() {
      const state = await window.electronAPI.getXpState();
      setXpState(state);
    }

    load();
    loadXp();

    const unsub = window.electronAPI.onXpStateUpdated((state) => {
      setXpState(state);
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
        <div className="profile__stat">
          <span className="profile__stat-value">{stats.streak}</span>
          <span className="profile__stat-label">Day streak</span>
        </div>
      </div>
    </div>
  );
}
