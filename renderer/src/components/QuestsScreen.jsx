import React, { useState } from 'react';
import { BADGES as BADGE_DEFS } from './Badges';
import { BadgeIcon } from './badgeIcons';

const TIER_XP = { standard: 20, stretch: 35, elite: 50 };

function formatQuestName(q) {
  return (q.nameTemplate ?? '')
    .replace('{n}', q.targetValue ?? '')
    .replace('{time}', q.targetValue != null ? `${String(q.targetValue).padStart(2, '0')}:00` : '');
}

function formatCountdown(nowMs) {
  const midnight = new Date(nowMs);
  midnight.setHours(24, 0, 0, 0);
  const diff = midnight.getTime() - nowMs;
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function isBinaryQuest(slug) {
  return ['deletion_day','beat_yesterday','golden_hour','consistency_window','morning_session','streak_extend'].includes(slug);
}

function localDateStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function getWeekDays() {
  const today = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    return localDateStr(d);
  });
}

const DAY_LABELS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

export function QuestsScreen({ questSlate, badgeUnlocks = [], productiveDays = [] }) {
  const [now] = useState(Date.now());

  const quests = questSlate?.quests ?? [];
  const today = localDateStr(new Date());
  const weekDays = getWeekDays();

  // Recent badges (last 5 unlocked)
  const recentBadges = [...badgeUnlocks]
    .sort((a, b) => (b.unlocked_at > a.unlocked_at ? 1 : -1))
    .slice(0, 5)
    .map(u => ({ ...u, def: BADGE_DEFS.find(b => b.slug === u.slug) }))
    .filter(u => u.def);

  return (
    <div className="quests-layout">
      {/* ── LEFT: daily quests card ── */}
      <div className="card quests-daily-card" style={{ padding: '16px', overflowY: 'auto', minHeight: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', paddingBottom: '10px', borderBottom: '1px dashed rgba(90,55,130,0.10)' }}>
          <span className="sec-title" style={{ margin: 0 }}>Daily Quests</span>
          <span style={{ fontSize: '14px', color: 'var(--muted)' }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </span>
        </div>

        {questSlate === undefined && <p className="quests__placeholder-text">Loading...</p>}
        {questSlate === null && (
          <p className="quests__placeholder-text">Quests will appear after your first session today.</p>
        )}

        {quests.map(q => {
          const name = formatQuestName(q);
          const isComplete = q.status === 'complete';
          const isExpired = q.status === 'expired';
          const isBinary = isBinaryQuest(q.slug);
          const xp = q.xpReward ?? TIER_XP[q.tier];
          const pct = isComplete ? 100
            : (!isBinary && q.targetValue > 0) ? Math.min(100, ((q.progress ?? 0) / q.targetValue) * 100)
            : 0;
          const barColor = isComplete ? 'var(--sage)' : !isExpired ? 'var(--accent)' : 'var(--water)';

          return (
            <div key={q.slug} className={`q-item${isComplete ? ' done' : ''}${!isComplete && !isExpired ? ' active' : ''}`}>
              <div className="q-item__top">
                <span className="q-item__name" style={{ color: isComplete ? 'var(--sage)' : 'var(--text)' }}>
                  {name}
                </span>
                <span className="q-item__xp" style={{
                  color: isComplete ? 'var(--sage)' : 'var(--gold)',
                  background: isComplete ? 'rgba(38,120,40,0.1)' : 'rgba(176,120,24,0.08)',
                  borderColor: isComplete ? 'rgba(38,120,40,0.22)' : 'rgba(176,120,24,0.2)',
                }}>+{xp} XP</span>
              </div>
              {q.desc && <div className="q-item__desc">{q.desc}</div>}
              <div className="bar-wrap" style={{ height: '6px', marginBottom: '3px', marginTop: '4px' }}>
                <div className="bar-fill" style={{ width: `${pct}%`, background: barColor }} />
              </div>
              <div className="q-item__progress-row">
                {isComplete && <span className="q-item__done-label">✓ Complete!</span>}
                {isExpired && <span style={{ fontFamily: 'var(--font-num)', fontSize: '11px', color: 'var(--muted)', opacity: 0.6 }}>Expired</span>}
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

      {/* ── RIGHT: streak + recent badges ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflow: 'hidden', minHeight: 0 }}>
        {/* Weekly streak */}
        <div className="card quests-streak">
          <div className="sec-title" style={{ marginBottom: '10px' }}>Weekly Streak</div>
          <div className="quests-streak__days">
            {weekDays.map(d => {
              const dayOfWeek = new Date(d + 'T12:00:00').getDay();
              const isToday = d === today;
              const isProductive = productiveDays.includes(d);
              const isPast = d < today;
              const boxColor = isProductive
                ? 'var(--sage)'
                : isPast
                  ? '#c0392b'
                  : undefined;
              return (
                <div key={d} className="wday">
                  <span className="wday-name">{DAY_LABELS[dayOfWeek]}</span>
                  <div
                    className={`wday-dot${isToday ? ' today' : ''}`}
                    style={boxColor ? { background: boxColor, borderColor: boxColor } : undefined}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent badges */}
        <div className="card quests-badges" style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
          <div className="sec-title" style={{ marginBottom: '10px' }}>Recent Badges</div>
          {recentBadges.length === 0 ? (
            <p style={{ fontSize: '9px', color: 'var(--muted)', lineHeight: 2 }}>No badges yet. Keep going!</p>
          ) : (
            recentBadges.map(u => (
              <div key={u.slug} className="badge-row">
                <div className="badge-ico"><BadgeIcon slug={u.slug} /></div>
                <div className="badge-info">
                  <div className="badge-name">{u.def.name}</div>
                  <div className="badge-desc">{u.def.description}</div>
                </div>
                <div className="badge-xp num">+{u.def.xp ?? 50} xp</div>
              </div>
            ))
          )}
        </div>

        {/* Countdown */}
        {questSlate && (
          <div style={{ textAlign: 'center', fontSize: '9px', color: 'var(--muted)', paddingBottom: '4px' }}>
            Resets in <span className="num" style={{ fontSize: '14px' }}>{formatCountdown(now)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
