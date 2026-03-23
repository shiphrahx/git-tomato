import React from 'react';
import tomatoImg from '../assets/tomato-1.png';

export function SessionComplete({ session, onDismiss }) {
  if (!session) return null;

  const totalCommits = session.repos
    ? session.repos.reduce((sum, r) => sum + (r.commits?.length ?? 0), 0)
    : 0;

  const xpResult = session.xpResult ?? null;
  const xpGained = xpResult?.xpGained ?? 0;
  const totalLines = session.totalLines ?? 0;

  return (
    <div className="sc">
      <div className="sc__tomato-wrap">
        <img src={tomatoImg} alt="Tomato" className="sc__tomato" />
      </div>

      <h2 className="sc__title">Session Complete!</h2>

      <div className="sc__xp-gained">+{xpGained} XP</div>

      <div className="sc__stats">
        <div className="sc-stat">
          <span className="sc-stat__icon">🪙</span>
          <span className="sc-stat__value">{totalCommits}</span>
          <span className="sc-stat__label">Commits</span>
        </div>
        <div className="sc-stat">
          <span className="sc-stat__icon">📌</span>
          <span className="sc-stat__value">{totalLines}</span>
          <span className="sc-stat__label">Lines</span>
        </div>
      </div>

      <div className="sc__xp-row-total">
        <span className="sc__xp-fire">🔥</span>
        <span className="sc__xp-total-label">{xpGained} XP</span>
      </div>

      <button className="btn btn--primary sc__close" onClick={onDismiss}>
        CONTINUE
      </button>
    </div>
  );
}
