// Streak evaluation engine — Section C.
// All state reads/writes go through store.js; all date logic via streakDefs.js.

const store = require('./store');
const {
  toDateStr,
  weekMonday,
  daysBetween,
  dailyStreakStatus,
  weeklyStreakStatus,
} = require('./streakDefs');

// ─── C-1: Entry point ─────────────────────────────────────────────────────────

/**
 * Evaluate and persist streak state after a qualifying focus session completes.
 *
 * A session qualifies if it is a naturally completed focus session (the caller
 * is responsible for only calling this for focus sessions).
 *
 * @param {number} qualifyingCommitCount  Number of qualifying commits from commit analyser.
 * @param {number} nowMs                  Timestamp of session completion (ms).
 * @returns {{
 *   dailyStreak: number,
 *   weeklyStreak: number,
 *   previousDailyStreak: number,
 *   isComeback: boolean,
 *   gapDays: number,
 *   weekBecameProductiveNow: boolean,
 * }}
 */
function evaluateStreak(qualifyingCommitCount, nowMs) {
  const now = nowMs ?? Date.now();
  const todayStr = toDateStr(now);
  const currentWeekMonday = weekMonday(now);

  const streakState = store.getStreakState();
  const previousDailyStreak = streakState.dailyStreak;
  const previousDailyStatus = dailyStreakStatus(streakState.lastProductiveDay, todayStr);

  // ─── C-2/C-3: Compute gap for comeback detection ───────────────────────────
  let gapDays = 0;
  if (streakState.lastProductiveDay && streakState.lastProductiveDay !== todayStr) {
    gapDays = daysBetween(streakState.lastProductiveDay, todayStr);
  }

  // Comeback: had a previous streak that was broken (gap ≥ 2 days)
  const isComeback = previousDailyStreak > 0 && previousDailyStatus === 'broken';

  // ─── Compute new values then persist everything atomically ─────────────────
  let newDailyStreak;
  let newWeeklyStreak;
  let weekBecameProductiveNow = false;
  let newLastProductiveWeek;
  let newLongestDailyStreak;
  let newLongestWeeklyStreak;

  const tx = store.getDb().transaction(() => {
    // B-2: upsert productive day inside transaction
    store.upsertProductiveDay(todayStr, qualifyingCommitCount);

    // C-2: daily streak update
    if (previousDailyStatus === 'broken' || previousDailyStatus === 'none') {
      newDailyStreak = 1;
    } else if (previousDailyStatus === 'safe') {
      newDailyStreak = streakState.dailyStreak;
    } else {
      // 'at-risk': yesterday was productive → extend
      newDailyStreak = streakState.dailyStreak + 1;
    }

    // C-5: longest daily streak
    newLongestDailyStreak = Math.max(streakState.longestDailyStreak, newDailyStreak);

    // C-4: weekly streak — read inside same transaction for consistency
    const productiveDaysThisWeek = store.getProductiveDaysInWeek(
      currentWeekMonday,
      _sundayOf(currentWeekMonday)
    ).length;

    const weekStatus = weeklyStreakStatus(
      productiveDaysThisWeek,
      streakState.lastProductiveWeek,
      currentWeekMonday
    );

    newWeeklyStreak = streakState.weeklyStreak;
    newLastProductiveWeek = streakState.lastProductiveWeek;

    if (weekStatus === 'safe' && streakState.lastProductiveWeek !== currentWeekMonday) {
      // Week just crossed the productive threshold for the first time
      weekBecameProductiveNow = true;
      const prevWeekStatus = weeklyStreakStatus(
        productiveDaysThisWeek - 1,
        streakState.lastProductiveWeek,
        currentWeekMonday
      );
      if (prevWeekStatus === 'broken' || prevWeekStatus === 'none') {
        newWeeklyStreak = 1;
      } else {
        newWeeklyStreak = streakState.weeklyStreak + 1;
      }
      newLastProductiveWeek = currentWeekMonday;
    }

    // C-5: longest weekly streak
    newLongestWeeklyStreak = Math.max(streakState.longestWeeklyStreak, newWeeklyStreak);

    store.setStreakState({
      dailyStreak: newDailyStreak,
      weeklyStreak: newWeeklyStreak,
      lastProductiveDay: todayStr,
      lastProductiveWeek: newLastProductiveWeek,
      longestDailyStreak: newLongestDailyStreak,
      longestWeeklyStreak: newLongestWeeklyStreak,
      lastEvaluatedAt: new Date(now).toISOString(),
    });
  });
  tx();

  return {
    dailyStreak: newDailyStreak,
    weeklyStreak: newWeeklyStreak,
    previousDailyStreak,
    isComeback,
    gapDays,
    weekBecameProductiveNow,
  };
}

// Return the Sunday date string for a given Monday date string (same week).
function _sundayOf(mondayStr) {
  const d = new Date(mondayStr);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 6);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

module.exports = { evaluateStreak };
