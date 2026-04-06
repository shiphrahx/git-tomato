import React, { useEffect, useState } from 'react';
import tomatoImg from '../assets/tomato-1.png';

// Mirror of main/levels.js — must stay in sync
export const LEVELS = [
  { index: 0, title: 'Seedling',   totalXpRequired: 0     },
  { index: 1, title: 'Committer',  totalXpRequired: 100   },
  { index: 2, title: 'Shipper',    totalXpRequired: 300   },
  { index: 3, title: 'Maintainer', totalXpRequired: 700   },
  { index: 4, title: 'Staff',      totalXpRequired: 1500  },
  { index: 5, title: 'Principal',  totalXpRequired: 3000  },
  { index: 6, title: 'Legend',     totalXpRequired: 6000  },
];

function xpPctWithinLevel(totalXp, levelIndex) {
  const level = LEVELS[levelIndex];
  const next  = LEVELS[levelIndex + 1];
  if (!next) return 100; // Legend
  const range = next.totalXpRequired - level.totalXpRequired;
  const since = totalXp - level.totalXpRequired;
  return Math.min(100, Math.max(0, (since / range) * 100));
}

function XpBar({ xpResult }) {
  if (!xpResult) return null;

  const { xpGained, newTotalXp, levelBefore, levelAfter } = xpResult;
  const xpBefore = newTotalXp - xpGained;
  const didLevelUp = levelAfter > levelBefore;
  const isLegend = levelAfter >= LEVELS.length - 1;

  const startPct = xpPctWithinLevel(xpBefore, levelBefore);
  const endPct   = isLegend ? 100 : xpPctWithinLevel(newTotalXp, levelAfter);

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

  const levelTitle = LEVELS[levelIndex]?.title ?? `Level ${levelIndex}`;
  const nextTitle  = LEVELS[levelIndex + 1]?.title;

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
          <span className="num" style={{ fontFamily: 'var(--font-num)', fontSize: '16px' }}>
            {LEVELS[levelAfter + 1].totalXpRequired - newTotalXp}
          </span> XP to next level
        </div>
      )}
    </div>
  );
}

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

      <XpBar xpResult={xpResult} />

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
