import React, { useState, useEffect } from 'react';
import { RepoCommitList } from './RepoCommitList';
import { BADGES as BADGE_DEFS } from './Badges';
import { BadgeIcon } from './badgeIcons';

// Mirror of main/levels.js
const LEVELS = [
  { index: 0, title: 'Seedling',   totalXpRequired: 0     },
  { index: 1, title: 'Committer',  totalXpRequired: 100   },
  { index: 2, title: 'Shipper',    totalXpRequired: 300   },
  { index: 3, title: 'Maintainer', totalXpRequired: 700   },
  { index: 4, title: 'Staff',      totalXpRequired: 1500  },
  { index: 5, title: 'Principal',  totalXpRequired: 3000  },
  { index: 6, title: 'Legend',     totalXpRequired: 6000  },
];

function getTodayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
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

function formatQuestName(q) {
  return (q.nameTemplate ?? '')
    .replace('{n}', q.targetValue ?? '')
    .replace('{time}', q.targetValue != null ? `${String(q.targetValue).padStart(2,'0')}:00` : '');
}

// Determine level info from total XP
function getLevelInfo(totalXp) {
  let levelIdx = 0;
  for (let i = 0; i < LEVELS.length - 1; i++) {
    if (totalXp >= LEVELS[i].totalXpRequired) levelIdx = i;
    else break;
  }
  const level = LEVELS[levelIdx];
  const nextLevel = LEVELS[Math.min(levelIdx + 1, LEVELS.length - 1)];
  const xpIntoLevel = totalXp - level.totalXpRequired;
  const xpNeeded = nextLevel.totalXpRequired - level.totalXpRequired;
  const pct = xpNeeded > 0 ? Math.min(100, (xpIntoLevel / xpNeeded) * 100) : 100;
  return { level, nextLevel, levelNum: levelIdx + 1, totalXp, xpIntoLevel, xpNeeded, pct };
}

const HM_CLASSES = ['', 'hm1', 'hm2', 'hm3', 'hm4'];

function HeatmapGrid({ sessions }) {
  // Build 12 weeks of day cells
  const today = new Date();
  today.setHours(0,0,0,0);
  const days = [];
  for (let i = 83; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    days.push(key);
  }
  // Count sessions and commits per day using local date
  const counts = {};
  const commitCounts = {};
  (sessions ?? []).forEach(s => {
    if (s.type !== 'focus') return;
    const d = new Date(s.started_at);
    const day = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    counts[day] = (counts[day] || 0) + 1;
    const repos = Array.isArray(s.repos) ? s.repos : [];
    const sessionCommits = repos.reduce((sum, r) => sum + (r.commits?.length ?? 0), 0);
    commitCounts[day] = (commitCounts[day] || 0) + sessionCommits;
  });
  return (
    <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap', marginTop: '8px' }}>
      {days.map(d => {
        const n = counts[d] || 0;
        const c = commitCounts[d] || 0;
        const cls = c === 0 ? 'hm' : c <= 1 ? 'hm hm1' : c <= 3 ? 'hm hm2' : c <= 5 ? 'hm hm3' : 'hm hm4';
        const label = n > 0 ? `${d} — ${c} commit${c !== 1 ? 's' : ''}` : d;
        return <div key={d} className={cls} title={label} />;
      })}
    </div>
  );
}

export function DayTimeline({ questSlate, badgeUnlocks = [], sessions, allSessions = [], dayCommits, dayXp, xpState, streakState }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(t);
  }, []);

  const repos = dayCommits?.repos ?? [];
  const sessionWindows = dayCommits?.sessionWindows ?? [];
  const totalXpEver = xpState?.totalXp ?? 0;
  const todayXp = dayXp?.xp ?? 0;
  const todayLines = dayXp?.totalLines ?? 0;

  const todayStr = getTodayStr();
  const focusSessions = (sessions ?? []).filter(s => s.type === 'focus');
  const totalFocusMin = focusSessions.reduce((sum, s) => sum + s.duration_minutes, 0);
  const totalCommits = repos.reduce((sum, r) => sum + r.commits.length, 0);

  // Level info
  const lvl = totalXpEver > 0 ? getLevelInfo(totalXpEver) : getLevelInfo(0);
  const streak = streakState?.dailyStreak ?? streakState?.streakState?.dailyStreak ?? 0;

  // Badges unlocked today
  const todayBadges = badgeUnlocks
    .filter(u => u.unlocked_at?.startsWith(todayStr))
    .map(u => ({ ...u, def: BADGE_DEFS.find(b => b.slug === u.slug) }))
    .filter(u => u.def);

  // All unlocked badges for the grid
  const unlockedSlugs = new Set(badgeUnlocks.map(u => u.slug));

  // Quests
  const quests = questSlate?.quests ?? [];

  return (
    <div className="dash">
      {/* ── Level + Streak header ── */}
      <div className="card card--gold dash-level">
        <div className="dash-level__box">
          <div className="num dash-level__num">{lvl ? lvl.levelNum : 1}</div>
          <div className="dash-level__lbl">LVL</div>
        </div>
        <div className="dash-level__info">
          <div className="dash-level__name">{lvl ? lvl.level.title : 'Seedling'}</div>
          <div className="lbl" style={{ marginBottom: '6px' }}>
            XP — Level {lvl ? lvl.levelNum : 1} → {lvl ? lvl.levelNum + 1 : 2}
          </div>
          <div className="bar-wrap" style={{ height: '9px' }}>
            <div className="bar-fill" style={{ width: `${lvl ? lvl.pct : 0}%`, background: 'var(--gold)' }} />
          </div>
          <div className="dash-level__xp-row">
            <span style={{ fontSize: '13px', color: 'var(--muted)' }}>{totalXpEver.toLocaleString()} XP</span>
            <span style={{ fontSize: '13px', color: 'var(--gold)' }}>
              {lvl ? (lvl.xpNeeded - lvl.xpIntoLevel).toLocaleString() : '—'} to Level {lvl ? lvl.levelNum + 1 : 2}
            </span>
          </div>
        </div>
        <div className="dash-streak">
          <div className="dash-streak__fire" style={{ fontSize: '14px', animation: 'blink 0.9s step-end infinite alternate' }}>🔥</div>
          <div className="num dash-streak__num">{streak}</div>
          <div className="lbl" style={{ margin: 0 }}>day streak</div>
        </div>
      </div>

      {/* ── 4-column metrics ── */}
      <div className="dash-metrics">
        {[
          { val: focusSessions.length, label: 'Pomodoros', delta: `▲ +${focusSessions.length} today`, positive: true },
          { val: totalCommits, label: 'Commits', delta: `▲ +${totalCommits} today`, positive: true },
          { val: todayLines >= 1000 ? `${(todayLines/1000).toFixed(1)}K` : todayLines, label: 'Lines', delta: `▲ +${todayLines} today`, positive: true },
          { val: repos.length, label: 'Repos', delta: `${repos.length} active`, positive: true },
        ].map(({ val, label, delta, positive }) => (
          <div key={label} className="card dash-metric">
            <div className="num dash-metric__val">{val}</div>
            <div className="lbl" style={{ marginTop: '3px' }}>{label}</div>
            <div className="num" style={{ fontSize: '17px', color: positive ? 'var(--sage)' : 'var(--accent)', marginTop: '5px' }}>{delta}</div>
          </div>
        ))}
      </div>

      {/* ── Heatmap (full width) ── */}
      <div className="card" style={{ padding: '14px' }}>
        <div className="sec-title">Focus Heatmap — 12 Weeks</div>
        <HeatmapGrid sessions={allSessions} />
        <div style={{ display: 'flex', gap: '5px', alignItems: 'center', marginTop: '8px' }}>
          <span style={{ fontSize: '8px', color: 'var(--muted)' }}>Less</span>
          {['hm','hm hm1','hm hm2','hm hm3','hm hm4'].map((c,i) => (
            <div key={i} className={c} style={{ width: '12px', height: '12px' }} />
          ))}
          <span style={{ fontSize: '8px', color: 'var(--muted)' }}>More</span>
        </div>
      </div>

      {/* ── Daily quests ── */}
      <div className="card" style={{ padding: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', paddingBottom: '10px', borderBottom: '1px dashed rgba(90,55,130,0.10)' }}>
          <span className="sec-title" style={{ margin: 0 }}>Daily Quests</span>
          {questSlate && (
            <span className="num" style={{ fontSize: '14px', color: 'var(--muted)' }}>Resets in {formatCountdown(now)}</span>
          )}
        </div>

        {questSlate === undefined && <p className="quests__placeholder-text">Loading...</p>}
        {questSlate === null && <p className="quests__placeholder-text">Quests appear after your first session today.</p>}

        {quests.map(q => {
          const name = formatQuestName(q);
          const isComplete = q.status === 'complete';
          const isExpired = q.status === 'expired';
          const isBinary = isBinaryQuest(q.slug);
          const xp = q.xpReward ?? { standard: 20, stretch: 35, elite: 50 }[q.tier];
          const pct = isComplete ? 100 : (!isBinary && q.targetValue > 0) ? Math.min(100, ((q.progress ?? 0) / q.targetValue) * 100) : 0;

          return (
            <div key={q.slug} className={`q-item${isComplete ? ' done' : ''}${!isComplete && !isExpired ? ' active' : ''}`}>
              <div className="q-item__top">
                <span className="q-item__name">{name}</span>
                <span className="q-item__xp">+{xp} XP</span>
              </div>
              {q.desc && <div className="q-item__desc">{q.desc}</div>}
              <div className="bar-wrap" style={{ height: '6px', marginBottom: '3px' }}>
                <div className="bar-fill" style={{
                  width: `${pct}%`,
                  background: isComplete ? 'var(--sage)' : !isComplete && !isExpired ? 'var(--accent)' : 'var(--water)',
                }} />
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

      {/* ── Commits by repo ── */}
      {repos.length > 0 && (
        <div className="card" style={{ padding: '14px' }}>
          <div className="sec-title">Commits Today</div>
          <RepoCommitList repos={repos} sessionWindows={sessionWindows} />
        </div>
      )}

      {/* ── Badge grid ── */}
      <div className="card" style={{ padding: '14px' }}>
        <div className="sec-title">Badges Earned</div>
        <div className="dash-badge-grid">
          {BADGE_DEFS.slice(0, 6).map(b => {
            const earned = unlockedSlugs.has(b.slug);
            return (
              <div key={b.slug} className={`gb${earned ? ' earned' : ' locked'}`}>
                <div className="gb-ico"><BadgeIcon slug={b.slug} locked={!earned} /></div>
                <div className="gb-name">{b.name}</div>
                <div className="gb-xp num">{b.xp ?? 50} XP</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
