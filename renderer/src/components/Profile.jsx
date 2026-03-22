import React, { useState, useEffect } from 'react';

const LEVEL_BADGES  = ['🌱', '🔨', '🚢', '🔧', '⭐', '🎯', '🏆'];
const LEVEL_TITLES  = ['Seedling', 'Committer', 'Shipper', 'Maintainer', 'Staff', 'Principal', 'Legend'];
const PRODUCTIVE_DAYS_REQUIRED = 5;

// Badge definitions (mirrored from main/badgeDefs.js)
const BADGES = [
  { slug: 'first_blood',        name: 'First blood',         description: 'Complete a session with at least one qualifying commit for the first time.',                        category: 'output' },
  { slug: 'firestarter',        name: 'Firestarter',         description: 'Produce 5 or more qualifying commits in a single session.',                                         category: 'output' },
  { slug: 'the_refactorer',     name: 'The refactorer',      description: 'Complete a session where every qualifying commit consists entirely of deletions.',                   category: 'output' },
  { slug: 'deleter',            name: 'Deleter',             description: 'Delete more lines than you add in a session, with at least 50 deleted lines.',                      category: 'output' },
  { slug: 'polyglot',           name: 'Polyglot',            description: 'Touch files with 4 or more distinct file extensions in a single session.',                         category: 'output' },
  { slug: 'century',            name: 'Century',             description: 'Reach 100 cumulative qualifying commits across all sessions.',                                       category: 'output' },
  { slug: 'deep_cut',           name: 'Deep cut',            description: 'Make a single qualifying commit with 200 or more total lines changed.',                             category: 'output' },
  { slug: 'creature_of_habit',  name: 'Creature of habit',   description: 'Reach a 7-day daily streak.',                                                                       category: 'consistency' },
  { slug: 'iron_week',          name: 'Iron week',           description: 'Complete productive sessions on all 7 days of a Monday–Sunday week.',                              category: 'consistency' },
  { slug: 'monthly_committer',  name: 'Monthly committer',   description: 'Reach a 30-day daily streak.',                                                                      category: 'consistency' },
  { slug: 'mono_tasker',        name: 'Mono-tasker',         description: 'Work on the same repository for 7 consecutive productive days.',                                    category: 'consistency' },
  { slug: 'comeback_kid',       name: 'Comeback kid',        description: 'Return to coding after a gap of 7 or more days and complete a qualifying session.',                 category: 'consistency' },
  { slug: 'early_bird',         name: 'Early bird',          description: 'Start a session before 08:00 and produce at least one qualifying commit.',                          category: 'time' },
  { slug: 'night_owl',          name: 'Night owl',           description: 'Start a session at or after 22:00 and produce at least one qualifying commit.',                     category: 'time' },
  { slug: 'deep_work',          name: 'Deep work',           description: 'Complete 4 or more productive sessions (with qualifying commits) in a single day.',                 category: 'time' },
  { slug: 'marathon',           name: 'Marathon',            description: 'Complete 8 or more Pomodoro sessions in a single day.',                                             category: 'time' },
  { slug: 'lunch_break_hacker', name: 'Lunch break hacker',  description: 'Start a session between 12:00 and 13:00 and produce at least one qualifying commit.',              category: 'time' },
  { slug: 'ghost_mode',         name: 'Ghost mode',          description: 'Complete a session without pausing the timer once.',                                                category: 'style' },
  { slug: 'greenfield',         name: 'Greenfield',          description: 'Make qualifying commits to 3 or more brand-new repositories within any rolling 7-day window.',     category: 'style' },
  { slug: 'silent_majority',    name: 'Silent majority',     description: 'Complete a session with 3+ qualifying commits where every commit message is 10 words or fewer.',   category: 'style' },
  { slug: 'the_cleaner',        name: 'The cleaner',         description: 'Delete at least twice as many lines as you add in a session, with at least 20 deleted lines.',     category: 'style' },
  { slug: 'level_up_unlocked',  name: 'Level up',            description: 'Level up for the first time (Seedling → Committer).',                                              category: 'mastery' },
  { slug: 'principal_engineer', name: 'Principal engineer',  description: 'Reach 3,000 total XP (level: Principal).',                                                         category: 'mastery' },
  { slug: 'ten_thousand_lines', name: 'Ten thousand lines',  description: 'Add 10,000 cumulative lines across all qualifying commits.',                                        category: 'mastery' },
  { slug: 'session_centurion',  name: 'Session centurion',   description: 'Complete 100 Pomodoro sessions.',                                                                   category: 'mastery' },
];

const CATEGORIES = ['output', 'consistency', 'time', 'style', 'mastery'];
const CATEGORY_LABELS = { output: 'Output', consistency: 'Consistency', time: 'Time', style: 'Style', mastery: 'Mastery' };

function relativeDate(isoStr) {
  const ms = Date.now() - new Date(isoStr).getTime();
  const days = Math.floor(ms / 86_400_000);
  if (days === 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months !== 1 ? 's' : ''} ago`;
  const years = Math.floor(days / 365);
  return `${years} year${years !== 1 ? 's' : ''} ago`;
}

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
  const [unlocks, setUnlocks] = useState({});

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
      const weekSessions = weekResults.flat();
      const weekCommits = weekSessions.reduce(
        (sum, s) => sum + (s.repos ? JSON.parse(typeof s.repos === 'string' ? s.repos : '[]').reduce(
          (s2, r) => s2 + (r.commits?.length ?? 0), 0
        ) : 0),
        0
      );
      setStats({ totalSessions, totalFocusMinutes, weekCommits });
    }

    async function loadBadges() {
      const records = await window.electronAPI.getBadgeUnlocks();
      const map = {};
      for (const r of (records ?? [])) map[r.slug] = r;
      setUnlocks(map);
    }

    load();
    window.electronAPI.getXpState().then(setXpState);
    window.electronAPI.getStreakState().then(setStreakState);
    loadBadges();

    const unsubXp = window.electronAPI.onXpStateUpdated((payload) => {
      setXpState(payload);
      if (payload.streakState) setStreakState(payload.streakState);
    });

    const unsubBadges = window.electronAPI.onBadgesUpdated((records) => {
      const map = {};
      for (const r of (records ?? [])) map[r.slug] = r;
      setUnlocks(map);
    });

    return () => { unsubXp(); unsubBadges(); };
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

  const dailyStreak = streakState?.dailyStreak ?? 0;
  const weeklyStreak = streakState?.weeklyStreak ?? 0;
  const longestDaily = streakState?.longestDailyStreak ?? 0;
  const longestWeekly = streakState?.longestWeeklyStreak ?? 0;
  const productiveDaysThisWeek = streakState?.productiveDaysThisWeek ?? 0;
  const isDailyAtRisk = streakState?.isDailyAtRisk ?? false;
  const isWeeklyAtRisk = streakState?.isWeeklyAtRisk ?? false;

  const unlockedCount = Object.keys(unlocks).length;

  return (
    <div className="profile">
      {/* Level card */}
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
          {isLegend && <div className="xp-legend-label">Total XP: {xpState.totalXp}</div>}
        </div>
      </div>

      {/* Streaks */}
      <div className="profile__section-title">Streaks</div>
      <div className="profile__stats">
        <div className={`profile__stat${isDailyAtRisk ? ' profile__stat--at-risk' : ''}`}>
          <span className="profile__stat-value">{dailyStreak}</span>
          <span className="profile__stat-label">Day streak{isDailyAtRisk ? ' ⚠' : ''}</span>
        </div>
        <div className={`profile__stat${isWeeklyAtRisk ? ' profile__stat--at-risk' : ''}`}>
          <span className="profile__stat-value">{weeklyStreak}</span>
          <span className="profile__stat-label">Week streak{isWeeklyAtRisk ? ' ⚠' : ''}</span>
        </div>
        <div className="profile__stat">
          <span className="profile__stat-value">{productiveDaysThisWeek}/{PRODUCTIVE_DAYS_REQUIRED}</span>
          <span className="profile__stat-label">Days this week</span>
        </div>
      </div>

      {/* Personal bests */}
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

      {/* All-time stats */}
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

      {/* Badges */}
      <div className="profile__section-title">
        Badges
        <span className="profile__badge-count">{unlockedCount} / {BADGES.length}</span>
      </div>
      <div className="profile__badges">
        {CATEGORIES.map(cat => {
          const catBadges = BADGES.filter(b => b.category === cat);
          return (
            <div key={cat} className="profile__badge-category">
              <div className="profile__badge-category-label">{CATEGORY_LABELS[cat]}</div>
              <div className="profile__badge-grid">
                {catBadges.map(b => {
                  const unlock = unlocks[b.slug];
                  const isUnlocked = !!unlock;
                  return (
                    <div
                      key={b.slug}
                      className={`profile__badge-item${isUnlocked ? ' profile__badge-item--unlocked' : ' profile__badge-item--locked'}`}
                      title={b.description}
                    >
                      <div className="profile__badge-item-icon">{isUnlocked ? '🏅' : '🔒'}</div>
                      <div className="profile__badge-item-body">
                        <div className="profile__badge-item-name">{b.name}</div>
                        {isUnlocked
                          ? <div className="profile__badge-item-date">Unlocked {relativeDate(unlock.unlocked_at)}</div>
                          : <div className="profile__badge-item-desc">{b.description}</div>
                        }
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
