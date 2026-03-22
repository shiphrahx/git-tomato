import React from 'react';
import { BADGES as BADGE_DEFS } from './Badges';

const LEVEL_TITLES = ['Seedling', 'Committer', 'Shipper', 'Maintainer', 'Staff', 'Principal', 'Legend'];

const EVENT_LABELS = {
  SESSION_COMPLETE: 'Session completed',
  COMMIT_BONUS: 'Commit bonus',
  FIRST_SESSION_OF_DAY: 'First session today',
  STREAK_BONUS: 'Streak bonus',
  COMEBACK_BONUS: 'Comeback bonus',
};

function StatPill({ label, value }) {
  return (
    <div className="sc-stat">
      <span className="sc-stat__value">{value}</span>
      <span className="sc-stat__label">{label}</span>
    </div>
  );
}

export function SessionComplete({ session, onDismiss }) {
  if (!session) return null;

  const totalCommits = session.repos
    ? session.repos.reduce((sum, r) => sum + (r.commits?.length ?? 0), 0)
    : 0;

  const allCommits = session.repos
    ? session.repos.flatMap(r =>
        (r.commits ?? []).map(c => ({ ...c, repo: r.repo, remoteUrl: r.remoteUrl }))
      )
    : [];

  const xpResult = session.xpResult ?? null;
  const didLevelUp = xpResult && xpResult.levelAfter > xpResult.levelBefore;
  const newLevelTitle = didLevelUp ? (LEVEL_TITLES[xpResult.levelAfter] ?? `Level ${xpResult.levelAfter}`) : null;

  const xpEvents = xpResult?.events
    ? xpResult.events.filter(e => e.eventType !== 'LEVEL_UP' && EVENT_LABELS[e.eventType])
    : [];

  // E-3: newly unlocked badge slugs
  const newBadgeSlugs = session.newBadgeSlugs ?? [];
  const newBadges = newBadgeSlugs
    .map(slug => BADGE_DEFS.find(b => b.slug === slug))
    .filter(Boolean);

  // F-4: quests completed this session
  const newCompletedQuests = session.newCompletedQuests ?? [];

  return (
    <div className="sc">
      <div className="sc__header">
        <div className="sc__icon">✓</div>
        <h2 className="sc__title">Session complete</h2>
        <p className="sc__subtitle">
          {session.durationMinutes ?? session.duration_minutes ?? 0} min focus session
        </p>
      </div>

      {didLevelUp && (
        <div className="sc__levelup-banner">
          <div className="sc__levelup-title">Level up!</div>
          <div className="sc__levelup-name">→ {newLevelTitle}</div>
        </div>
      )}

      <div className="sc__stats">
        <StatPill label="Commits" value={totalCommits} />
        <StatPill label="XP earned" value={xpResult?.xpGained ?? '—'} />
        <StatPill label="Badges" value={newBadges.length > 0 ? `+${newBadges.length}` : '—'} />
      </div>

      {xpResult && (
        <div className="sc__xp-breakdown">
          <div className="sc__section-title">XP breakdown</div>
          {xpEvents.map((e, i) => (
            <div key={i} className="sc__xp-row">
              <span className="sc__xp-label">{EVENT_LABELS[e.eventType]}</span>
              <span className="sc__xp-amount">+{e.xpAmount}</span>
            </div>
          ))}
          <div className="sc__total-xp">Total XP: {xpResult.newTotalXp}</div>
        </div>
      )}

      {/* E-3: badge unlock summary */}
      {newBadges.length > 0 && (
        <div className="sc__badges">
          <div className="sc__section-title">Badges unlocked</div>
          {newBadges.map(badge => (
            <div key={badge.slug} className="sc__badge-row">
              <span className="sc__badge-icon">🏅</span>
              <span className="sc__badge-name">{badge.name}</span>
            </div>
          ))}
        </div>
      )}

      {/* F-4: quest completions */}
      {newCompletedQuests.length > 0 && (
        <div className="sc__quests">
          <div className="sc__section-title">Quests completed</div>
          {newCompletedQuests.map(q => (
            <div key={q.slug} className="sc__quest-row">
              <span className="sc__quest-icon">⚔</span>
              <span className="sc__quest-name">{q.name}</span>
              <span className="sc__quest-xp">+{q.xpReward} XP</span>
            </div>
          ))}
        </div>
      )}

      {allCommits.length > 0 && (
        <div className="sc__commits">
          <div className="sc__section-title">Commits this session</div>
          <div className="sc__commit-list">
            {allCommits.map((c, i) => (
              <div key={i} className="sc__commit">
                <span className="sc__commit-hash">{c.hash?.slice(0, 7)}</span>
                <span className="sc__commit-msg">{c.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {allCommits.length === 0 && (
        <div className="sc__no-commits">No commits detected this session.</div>
      )}

      <button className="btn btn--primary sc__close" onClick={onDismiss}>
        Done
      </button>
    </div>
  );
}
