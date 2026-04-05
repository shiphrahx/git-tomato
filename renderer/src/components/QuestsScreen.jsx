import React, { useState } from 'react';
import { BADGES as BADGE_DEFS } from './Badges';

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

function localDateStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
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

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function QuestsScreen({ questSlate, badgeUnlocks = [] }) {
  const [now] = useState(Date.now());

  const quests = questSlate?.quests ?? [];
  const todayStr = localDateStr(new Date());
  const weekDays = getWeekDays();
  const today = localDateStr(new Date());

  // Recent badges (last 5 unlocked)
  const recentBadges = [...badgeUnlocks]
    .sort((a, b) => (b.unlocked_at > a.unlocked_at ? 1 : -1))
    .slice(0, 5)
    .map(u => ({ ...u, def: BADGE_DEFS.find(b => b.slug === u.slug) }))
    .filter(u => u.def);

  return (
    <div className="quests-screen">
      <div className="quests-screen__header">
        <span className="quests-screen__title">Daily Quests</span>
        {questSlate && (
          <span className="quests-screen__countdown num">Resets in {formatCountdown(now)}</span>
        )}
      </div>

      <div className="quests-screen__body">
        {/* Left: quest list */}
        <div>
          {questSlate === undefined && (
            <p className="quests__placeholder-text">Loading...</p>
          )}
          {questSlate === null && (
            <p className="quests__placeholder-text">
              Quests will appear after your first session today.
            </p>
          )}
          {quests.map(q => {
            const name = formatQuestName(q);
            const isComplete = q.status === 'complete';
            const isExpired = q.status === 'expired';
            const isBinary = isBinaryQuest(q.slug);
            const xp = q.xpReward ?? TIER_XP[q.tier];

            return (
              <div
                key={q.slug}
                className={`q-item${isComplete ? ' done' : ''}${!isComplete && !isExpired ? ' active' : ''}`}
              >
                <div className="q-item__top">
                  <span className="q-item__name">{name}</span>
                  <span className="q-item__xp">+{xp} XP</span>
                </div>
                <div className="q-item__progress-row">
                  {isComplete && (
                    <span className="q-item__done-label">✓ Complete!</span>
                  )}
                  {isExpired && (
                    <span style={{ fontFamily: 'var(--font-num)', fontSize: '14px', color: 'var(--muted)', opacity: 0.6 }}>Expired</span>
                  )}
                  {!isComplete && !isExpired && !isBinary && q.targetValue > 0 && (
                    <span className="q-item__progress-val">{q.progress ?? 0} / {q.targetValue}</span>
                  )}
                  {!isComplete && !isExpired && isBinary && (
                    <span className="q-item__progress-val" style={{ opacity: 0.35 }}>—</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: streak + badges */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* Weekly streak */}
          <div className="card quests-streak">
            <div className="quests-streak__title">Weekly Streak</div>
            <div className="quests-streak__days">
              {weekDays.map(d => {
                const dayOfWeek = new Date(d + 'T00:00:00').getDay();
                const label = DAY_LABELS[dayOfWeek];
                const isToday = d === today;
                // A "done" day has had a session — we can't know here without fetching,
                // so we leave done detection to future iteration; just show today marker
                return (
                  <div key={d} className="wday">
                    <span className="wday-name">{label}</span>
                    <div className={`wday-dot${isToday ? ' today' : ''}`} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent badges */}
          <div className="card quests-badges">
            <div className="quests-badges__title">Recent Badges</div>
            {recentBadges.length === 0 ? (
              <p style={{ fontSize: '6px', color: 'var(--muted)', lineHeight: 2 }}>
                No badges yet. Keep going!
              </p>
            ) : (
              recentBadges.map(u => (
                <div key={u.slug} className="badge-row">
                  <div className="badge-ico">🏅</div>
                  <div className="badge-info">
                    <div className="badge-name">{u.def.name}</div>
                    <div className="badge-desc">{u.def.description}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
