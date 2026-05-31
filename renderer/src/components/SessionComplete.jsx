import React, { useEffect, useState } from 'react';
import tomatoImg from '../assets/tomato-1.png';
import { LEVELS as FALLBACK_LEVELS } from '../levels';

function xpPctWithinLevel(levels, totalXp, levelIndex) {
  const level = levels[levelIndex];
  const next  = levels[levelIndex + 1];
  if (!next) return 100; // Legend
  const range = next.totalXpRequired - level.totalXpRequired;
  const since = totalXp - level.totalXpRequired;
  return Math.min(100, Math.max(0, (since / range) * 100));
}

function XpBar({ xpResult, levels = FALLBACK_LEVELS }) {
  // Hooks must be called unconditionally — compute safe defaults when xpResult is null
  const xpGained   = xpResult?.xpGained   ?? 0;
  const newTotalXp = xpResult?.newTotalXp  ?? 0;
  const levelBefore = xpResult?.levelBefore ?? 0;
  const levelAfter  = xpResult?.levelAfter  ?? 0;
  const didLevelUp  = levelAfter > levelBefore;
  const isLegend    = levelAfter >= levels.length - 1;
  const xpBefore    = newTotalXp - xpGained;
  const startPct    = xpResult ? xpPctWithinLevel(levels, xpBefore, levelBefore) : 0;
  const endPct      = xpResult ? (isLegend ? 100 : xpPctWithinLevel(levels, newTotalXp, levelAfter)) : 0;

  const [barPct, setBarPct] = useState(startPct);
  const [levelIndex, setLevelIndex] = useState(levelBefore);

  useEffect(() => {
    // Small delay so the bar is visible before animating
    const t1 = setTimeout(() => {
      if (didLevelUp) {
        // Phase 1: fill to 100%
        setBarPct(100);
        // Phase 2: after the fill transition completes, jump to 0 on the new level then fill to endPct
        const t2 = setTimeout(() => {
          setBarPct(0);
          setLevelIndex(levelAfter);
          const t3 = setTimeout(() => setBarPct(endPct), 50);
          return () => clearTimeout(t3);
        }, 700);
        return () => clearTimeout(t2);
      } else {
        setBarPct(endPct);
      }
    }, 400);
    return () => clearTimeout(t1);
  }, []);

  // Early return after all hooks
  if (!xpResult) return null;

  const levelTitle = levels[levelIndex]?.title ?? `Level ${levelIndex}`;
  const nextTitle  = levels[levelIndex + 1]?.title;

  return (
    <div className="sc__xp-bar-wrap">
      <div className="sc__xp-bar-labels">
        <span className="sc__xp-bar-level">{levelTitle}</span>
        {nextTitle && <span className="sc__xp-bar-next">{nextTitle}</span>}
      </div>
      <div className="sc__xp-bar">
        <div className="sc__xp-bar-fill" style={{ width: `${barPct}%` }} />
      </div>
      {!isLegend && (
        <div className="sc__xp-bar-meta">
          <span className="num sc__xp-to-next">
            {levels[levelAfter + 1].totalXpRequired - newTotalXp}
          </span> XP to next level
        </div>
      )}
    </div>
  );
}

export function SessionComplete({ session, onDismiss, levels = FALLBACK_LEVELS }) {
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

      <XpBar xpResult={xpResult} levels={levels} />

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
