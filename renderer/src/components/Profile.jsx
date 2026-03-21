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

export function Profile() {
  const [stats, setStats] = useState(null);

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
    load();
  }, []);

  if (!stats) {
    return <div className="settings-loading">Loading…</div>;
  }

  const hours = Math.floor(stats.totalFocusMinutes / 60);
  const mins = stats.totalFocusMinutes % 60;
  const focusLabel = hours > 0
    ? (mins > 0 ? `${hours}h ${mins}m` : `${hours}h`)
    : `${mins}m`;

  return (
    <div className="profile">
      <div className="profile__level-card">
        <div className="profile__level-badge">🌱</div>
        <div className="profile__level-info">
          <div className="profile__level-title">Seedling</div>
          <div className="profile__level-xp">0 XP — level system coming soon</div>
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
