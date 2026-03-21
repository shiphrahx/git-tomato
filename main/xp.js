const store = require('./store');
const { LEVELS } = require('./levels');

// ─── Level computation (E-1, E-2, E-3) ───────────────────────────────────────

function deriveLevel(totalXp) {
  let level = LEVELS[0];
  for (const l of LEVELS) {
    if (totalXp >= l.totalXpRequired) level = l;
  }
  return level;
}

function computeXpFields(totalXp) {
  const level = deriveLevel(totalXp);
  const isLegend = level.index === LEVELS[LEVELS.length - 1].index;
  const nextLevel = isLegend ? null : LEVELS[level.index + 1];
  return {
    levelIndex: level.index,
    xpSinceLevel: totalXp - level.totalXpRequired,
    xpToNextLevel: nextLevel ? nextLevel.totalXpRequired - level.totalXpRequired : null,
  };
}

// ─── Streak helper (C-4) ─────────────────────────────────────────────────────

function localDateStr(ms) {
  const d = new Date(ms);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function computeStreak(completedAtMs) {
  // Count consecutive calendar days with at least one focus session,
  // ending on the day of completedAtMs.
  const allSessions = store.getAllSessions();
  const focusDays = new Set(
    allSessions
      .filter(s => s.type === 'focus' && s.status === 'completed')
      .map(s => localDateStr(s.started_at))
  );
  // Also count today's completing session
  focusDays.add(localDateStr(completedAtMs));

  let streak = 0;
  const base = new Date(completedAtMs);
  for (let i = 0; i < 365; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() - i);
    if (focusDays.has(localDateStr(d.getTime()))) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

// ─── First-session-of-day check (C-3) ────────────────────────────────────────

function isFirstSessionOfDay(completedAtMs) {
  const todayStr = localDateStr(completedAtMs);
  const midnight = new Date(todayStr);
  midnight.setHours(0, 0, 0, 0);

  // Look for any SESSION_COMPLETE event logged today before this moment
  const existing = store.getXpEvents().filter(e =>
    e.event_type === 'SESSION_COMPLETE' &&
    new Date(e.created_at).getTime() >= midnight.getTime() &&
    new Date(e.created_at).getTime() < completedAtMs
  );
  return existing.length === 0;
}

// ─── Main award function (C-1 through C-6) ───────────────────────────────────

/**
 * Award XP for a naturally completed focus session.
 *
 * @param {number} sessionId  - The sessions.id row that just completed.
 * @param {Array}  commitBonusEvents - Pre-scored commit bonus entries from the
 *                                     commit analyser (Section D). Each has
 *                                     { xpAmount, reason }. Pass [] until D
 *                                     stories are implemented.
 */
function awardSessionXp(sessionId, commitBonusEvents = []) {
  const now = new Date().toISOString();
  const nowMs = Date.now();

  // Load current XP state before making any changes (must happen before transaction)
  const stateBefore = store.getXpState();
  const levelBefore = stateBefore.levelIndex;

  // Build all events to write
  const events = [];

  // C-1: +10 for SESSION_COMPLETE
  events.push({ eventType: 'SESSION_COMPLETE', xpAmount: 10, reason: 'Focus session completed' });

  // C-2: commit bonuses (scored externally by Section D analyser)
  for (const cb of commitBonusEvents) {
    events.push({ eventType: 'COMMIT_BONUS', xpAmount: cb.xpAmount, reason: cb.reason });
  }

  // C-3: first session of day → +20
  if (isFirstSessionOfDay(nowMs)) {
    events.push({ eventType: 'FIRST_SESSION_OF_DAY', xpAmount: 20, reason: 'First focus session of the day' });
  }

  // C-4: streak bonus → +15 if streak ≥ 2
  const streak = computeStreak(nowMs);
  if (streak >= 2) {
    events.push({ eventType: 'STREAK_BONUS', xpAmount: 15, reason: `${streak}-day streak` });
  }

  // Compute new total XP
  const xpGained = events.reduce((sum, e) => sum + e.xpAmount, 0);
  const newTotalXp = stateBefore.totalXp + xpGained;

  // E-1: derive new level
  const newFields = computeXpFields(newTotalXp);
  const levelAfter = newFields.levelIndex;

  // E-2: emit one LEVEL_UP per level crossed, each with 0 XP
  for (let i = levelBefore + 1; i <= levelAfter; i++) {
    events.push({ eventType: 'LEVEL_UP', xpAmount: 0, reason: `Reached ${LEVELS[i].title}` });
  }

  // C-5: write everything atomically — if this throws, nothing is saved
  const writeTransaction = store.getDb().transaction(() => {
    const createdAt = new Date().toISOString();
    for (const e of events) {
      store.appendXpEvent({
        eventType: e.eventType,
        xpAmount: e.xpAmount,
        reason: e.reason,
        sessionId,
        createdAt,
      });
    }

    // C-6: total XP only ever increases — newTotalXp >= stateBefore.totalXp always
    store.setXpState({
      totalXp: newTotalXp,
      levelIndex: newFields.levelIndex,
      xpSinceLevel: newFields.xpSinceLevel,
      xpToNextLevel: newFields.xpToNextLevel,
      lastEventAt: createdAt,
    });

    store.markSessionXpDone(sessionId);
  });

  writeTransaction();

  return {
    xpGained,
    newTotalXp,
    levelBefore,
    levelAfter,
    events,
    streak,
  };
}

/**
 * On app launch: abort in-progress sessions (G-1) and retry xp_pending ones (C-5).
 */
function processSessionsOnLaunch() {
  store.abortInProgressSessions();

  const pending = store.getPendingXpSessions();
  for (const session of pending) {
    // Retry with no commit bonuses — commit analysis window has passed,
    // so we award base XP only to avoid re-running git queries.
    try {
      awardSessionXp(session.id, []);
    } catch (err) {
      // Leave as xp_pending; will retry on next launch.
      console.error('[xp] retry failed for session', session.id, err);
    }
  }
}

module.exports = { awardSessionXp, processSessionsOnLaunch, deriveLevel, computeXpFields };
