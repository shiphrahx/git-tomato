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

// --- Quest helpers ---
const TIER_LABELS = { standard: 'Standard', stretch: 'Stretch', elite: 'Elite' };
const TIER_XP = { standard: 20, stretch: 35, elite: 50 };

function formatQuestName(q) {
  return (q.nameTemplate ?? '')
    .replace('{n}', q.targetValue ?? '')
    .replace('{time}', q.targetValue != null ? `${String(q.targetValue).padStart(2, '0')}:00` : '');
}

function formatCountdown(nowMs) {
  const d = new Date(nowMs);
  const midnight = new Date(d);
  midnight.setHours(24, 0, 0, 0);
  const diffMs = midnight.getTime() - nowMs;
  const h = Math.floor(diffMs / 3600000);
  const m = Math.floor((diffMs % 3600000) / 60000);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function isBinaryQuest(slug) {
  return ['deletion_day', 'beat_yesterday', 'golden_hour', 'consistency_window', 'morning_session', 'streak_extend'].includes(slug);
}

function QuestCard({ quest }) {
  const name = formatQuestName(quest);
  const isComplete = quest.status === 'complete';
  const isExpired = quest.status === 'expired';
  const isBinary = isBinaryQuest(quest.slug);

  return (
    <div className={`quest-card quest-card--${quest.status} quest-card--${quest.tier}`}>
      <div className="quest-card__header">
        <span className={`quest-card__tier quest-card__tier--${quest.tier}`}>
          {TIER_LABELS[quest.tier]}
        </span>
        <span className="quest-card__xp">+{quest.xpReward ?? TIER_XP[quest.tier]} XP</span>
      </div>
      <div className="quest-card__name">{name}</div>
      <div className="quest-card__footer">
        {isComplete && (
          <span className="quest-card__status quest-card__status--complete">✓ Complete</span>
        )}
        {isExpired && (
          <span className="quest-card__status quest-card__status--expired">Expired</span>
        )}
        {!isComplete && !isExpired && !isBinary && quest.targetValue > 0 && (
          <span className="quest-card__progress">
            {quest.progress ?? 0} / {quest.targetValue}
          </span>
        )}
        {!isComplete && !isExpired && isBinary && (
          <span className="quest-card__progress quest-card__progress--binary">—</span>
        )}
      </div>
    </div>
  );
}

function DailyQuests({ initialSlate }) {
  const [now, setNow] = useState(Date.now());
  const slate = initialSlate;

  useEffect(() => {
    if (!window.electronAPI) return;
    const ticker = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(ticker);
  }, []);

  return (
    <div className="dp__section">
      <div className="dp__section-header">
        <span className="dp__section-title">Daily Quests</span>
        {slate && (
          <span className="quests__countdown">Resets in {formatCountdown(now)}</span>
        )}
      </div>

      {slate === undefined && (
        <p className="quests__placeholder-text">Loading...</p>
      )}

      {slate === null && (
        <p className="quests__placeholder-text">
          Quests will be generated after your first session of the day.
        </p>
      )}

      {slate && (slate.quests ?? []).map(q => (
        <QuestCard key={q.slug} quest={q} />
      ))}
    </div>
  );
}

export function DayTimeline({ questSlate }) {
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

  const isEmpty = sessions.length === 0;

  if (isEmpty) {
    return (
      <div className="dp">
        <div className="dp--empty">
          <div className="dp-empty__icon">🍅</div>
          <div className="dp-empty__title">No sessions yet today.</div>
          <div className="dp-empty__hint">Start a Pomodoro to get going!</div>
        </div>
        <DailyQuests initialSlate={questSlate} />
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

      {/* Daily quests */}
      <DailyQuests initialSlate={questSlate} />

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
