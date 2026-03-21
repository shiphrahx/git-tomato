import React from 'react';

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

  return (
    <div className="sc">
      <div className="sc__header">
        <div className="sc__icon">✓</div>
        <h2 className="sc__title">Session complete</h2>
        <p className="sc__subtitle">
          {session.durationMinutes ?? session.duration_minutes ?? 0} min focus session
        </p>
      </div>

      <div className="sc__stats">
        <StatPill label="Commits" value={totalCommits} />
        <StatPill label="XP earned" value="—" />
        <StatPill label="Badges" value="—" />
      </div>

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
