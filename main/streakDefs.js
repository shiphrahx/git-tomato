// Streak system — Section A definitions.
// All boundary computations use the user's local timezone.

// ─── A-1: Calendar date helpers ──────────────────────────────────────────────

/**
 * Return an ISO date string (YYYY-MM-DD) for a given Date or ms timestamp,
 * in the user's local timezone. This is the canonical day key used throughout
 * the streak system.
 */
function toDateStr(msOrDate) {
  const d = msOrDate instanceof Date ? msOrDate : new Date(msOrDate);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Return the local-timezone Date object for midnight at the start of the
 * given ISO date string.
 */
function dateMidnight(dateStr) {
  const d = new Date(dateStr);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Return the number of whole calendar days between two ISO date strings,
 * computed from their local-midnight boundaries (always non-negative).
 * daysBetween('2024-01-01', '2024-01-03') === 2
 */
function daysBetween(dateStrA, dateStrB) {
  const a = dateMidnight(dateStrA).getTime();
  const b = dateMidnight(dateStrB).getTime();
  return Math.round(Math.abs(b - a) / 86_400_000);
}

// ─── A-2: Week boundary helpers ───────────────────────────────────────────────

/**
 * Return the ISO date string of the Monday that starts the calendar week
 * containing the given Date or ms timestamp (local timezone).
 * This is the canonical week key used throughout the streak system.
 */
function weekMonday(msOrDate) {
  const d = msOrDate instanceof Date ? new Date(msOrDate) : new Date(msOrDate);
  d.setHours(0, 0, 0, 0);
  // getDay(): 0=Sun, 1=Mon … 6=Sat. Shift so Monday=0.
  const dow = (d.getDay() + 6) % 7; // Mon=0, Tue=1, … Sun=6
  d.setDate(d.getDate() - dow);
  return toDateStr(d);
}

/**
 * Return the number of whole calendar weeks between two Monday-date strings
 * (always non-negative).
 */
function weeksBetween(mondayStrA, mondayStrB) {
  return Math.round(daysBetween(mondayStrA, mondayStrB) / 7);
}

/**
 * Return true if the given ISO date string falls within the calendar week
 * (Mon–Sun) identified by mondayStr.
 * A-2: week boundary is Monday 00:00 – Sunday 23:59 local time.
 */
function isInWeek(dateStr, mondayStr) {
  return weekMonday(dateMidnight(dateStr).getTime()) === mondayStr;
}

// ─── A-3: Daily streak evaluation helpers ─────────────────────────────────────

/**
 * Given the last productive day string and the current date string, return
 * the daily streak status:
 *   'broken'   — last productive day was 2+ days ago → streak = 0 (A-3)
 *   'at-risk'  — last productive day was yesterday, today not yet productive (A-3)
 *   'safe'     — today is already a productive day
 *   'none'     — no productive day has ever been recorded
 */
function dailyStreakStatus(lastProductiveDay, todayStr) {
  if (!lastProductiveDay) return 'none';
  if (lastProductiveDay === todayStr) return 'safe';
  const gap = daysBetween(lastProductiveDay, todayStr);
  if (gap === 1) return 'at-risk';   // yesterday was productive, today not yet
  return 'broken';                   // 2+ days ago
}

// ─── A-4: Weekly streak evaluation helpers ────────────────────────────────────

const PRODUCTIVE_DAYS_REQUIRED = 5; // A-2: 5 of 7 days in the Mon–Sun window

/**
 * Given the count of productive days already recorded in the current week,
 * return the weekly streak status:
 *   'safe'     — current week has reached 5 productive days
 *   'at-risk'  — current week has 1–4 productive days (D-2)
 *   'broken'   — last productive week was 2+ weeks ago → streak = 0
 *   'none'     — no productive week has ever been recorded
 *
 * @param {number} productiveDaysThisWeek
 * @param {string|null} lastProductiveWeek   Monday date string of last productive week
 * @param {string} currentWeekMonday         Monday date string of current week
 */
function weeklyStreakStatus(productiveDaysThisWeek, lastProductiveWeek, currentWeekMonday) {
  if (productiveDaysThisWeek >= PRODUCTIVE_DAYS_REQUIRED) return 'safe';
  if (!lastProductiveWeek) return productiveDaysThisWeek > 0 ? 'at-risk' : 'none';
  if (lastProductiveWeek === currentWeekMonday) {
    // Already counted this week — at-risk until 5 days hit
    return 'at-risk';
  }
  const gap = weeksBetween(lastProductiveWeek, currentWeekMonday);
  if (gap === 1) return 'at-risk';   // last week was productive, this week not yet
  return 'broken';                   // 2+ weeks ago
}

module.exports = {
  toDateStr,
  dateMidnight,
  daysBetween,
  weekMonday,
  weeksBetween,
  isInWeek,
  dailyStreakStatus,
  weeklyStreakStatus,
  PRODUCTIVE_DAYS_REQUIRED,
};
