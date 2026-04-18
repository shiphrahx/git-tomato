const Database = require('better-sqlite3');
const path = require('path');
const { app } = require('electron');

// Safe JSON parse — returns fallback value instead of throwing on corrupt data
function safeJsonParse(str, fallback) {
  try { return JSON.parse(str); }
  catch (e) { console.error('[store] JSON.parse failed:', e.message); return fallback; }
}

let db;

function getDb() {
  if (!db) {
    const dbPath = path.join(app.getPath('userData'), 'sessions.sqlite');
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    db.exec(`
      CREATE TABLE IF NOT EXISTS sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        started_at INTEGER NOT NULL,
        ended_at INTEGER NOT NULL,
        duration_minutes INTEGER NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('focus', 'break')),
        repos TEXT NOT NULL DEFAULT '[]'
      );

      CREATE TABLE IF NOT EXISTS xp_state (
        id INTEGER PRIMARY KEY CHECK(id = 1),
        total_xp INTEGER NOT NULL DEFAULT 0,
        level_index INTEGER NOT NULL DEFAULT 0,
        xp_since_level INTEGER NOT NULL DEFAULT 0,
        xp_to_next_level INTEGER,
        last_event_at TEXT
      );

      INSERT OR IGNORE INTO xp_state (id, total_xp, level_index, xp_since_level, xp_to_next_level, last_event_at)
      VALUES (1, 0, 0, 0, 100, NULL);

      CREATE TABLE IF NOT EXISTS xp_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_type TEXT NOT NULL CHECK(event_type IN ('SESSION_COMPLETE','COMMIT_BONUS','FIRST_SESSION_OF_DAY','STREAK_BONUS','LEVEL_UP','COMEBACK_BONUS','QUEST_COMPLETE')),
        xp_amount INTEGER NOT NULL,
        reason TEXT NOT NULL,
        session_id INTEGER NOT NULL,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS streak_state (
        id INTEGER PRIMARY KEY CHECK(id = 1),
        daily_streak INTEGER NOT NULL DEFAULT 0,
        weekly_streak INTEGER NOT NULL DEFAULT 0,
        last_productive_day TEXT,
        last_productive_week TEXT,
        longest_daily_streak INTEGER NOT NULL DEFAULT 0,
        longest_weekly_streak INTEGER NOT NULL DEFAULT 0,
        last_evaluated_at TEXT
      );

      INSERT OR IGNORE INTO streak_state
        (id, daily_streak, weekly_streak, last_productive_day, last_productive_week,
         longest_daily_streak, longest_weekly_streak, last_evaluated_at)
      VALUES (1, 0, 0, NULL, NULL, 0, 0, NULL);

      CREATE TABLE IF NOT EXISTS productive_days (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        day TEXT NOT NULL UNIQUE,
        qualifying_commits INTEGER NOT NULL DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS badge_unlocks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        slug TEXT NOT NULL UNIQUE,
        session_id INTEGER NOT NULL,
        unlocked_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS badges_meta (
        id INTEGER PRIMARY KEY CHECK(id = 1),
        historical_pass_done INTEGER NOT NULL DEFAULT 0
      );

      INSERT OR IGNORE INTO badges_meta (id, historical_pass_done) VALUES (1, 0);

      -- A-2: one slate per calendar day
      CREATE TABLE IF NOT EXISTS quest_slates (
        date TEXT PRIMARY KEY,
        quests TEXT NOT NULL DEFAULT '[]',
        is_fallback INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL
      );

      -- A-3: append-only quest completion log
      CREATE TABLE IF NOT EXISTS quest_completions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        slug TEXT NOT NULL,
        target_value INTEGER NOT NULL,
        date TEXT NOT NULL,
        session_id INTEGER NOT NULL,
        xp_awarded INTEGER NOT NULL,
        completed_at TEXT NOT NULL
      );
    `);

    // Migration: add status column to sessions if it doesn't exist yet.
    // Values: 'in_progress' | 'completed' | 'aborted' | 'xp_pending'
    const cols = db.prepare(`PRAGMA table_info(sessions)`).all();
    if (!cols.find(c => c.name === 'status')) {
      db.exec(`ALTER TABLE sessions ADD COLUMN status TEXT NOT NULL DEFAULT 'completed'`);
    }
    if (!cols.find(c => c.name === 'pause_count')) {
      db.exec(`ALTER TABLE sessions ADD COLUMN pause_count INTEGER NOT NULL DEFAULT 0`);
    }

    // Migration: add QUEST_COMPLETE to xp_events CHECK constraint.
    // SQLite can't ALTER a CHECK constraint, so we recreate the table if needed.
    const xpEventsSchema = db.prepare(`SELECT sql FROM sqlite_master WHERE type='table' AND name='xp_events'`).get();
    if (xpEventsSchema && !xpEventsSchema.sql.includes('QUEST_COMPLETE')) {
      db.exec(`
        ALTER TABLE xp_events RENAME TO xp_events_old;
        CREATE TABLE xp_events (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          event_type TEXT NOT NULL CHECK(event_type IN ('SESSION_COMPLETE','COMMIT_BONUS','FIRST_SESSION_OF_DAY','STREAK_BONUS','LEVEL_UP','COMEBACK_BONUS','QUEST_COMPLETE')),
          xp_amount INTEGER NOT NULL,
          reason TEXT NOT NULL,
          session_id INTEGER NOT NULL,
          created_at TEXT NOT NULL
        );
        INSERT INTO xp_events SELECT * FROM xp_events_old;
        DROP TABLE xp_events_old;
      `);
    }
  }
  return db;
}

// Insert an in_progress row when a session starts. Returns the new row id.
function beginSession({ startedAt, type, durationMinutes }) {
  return getDb()
    .prepare(
      `INSERT INTO sessions (started_at, ended_at, duration_minutes, type, repos, status)
       VALUES (@startedAt, 0, @durationMinutes, @type, '[]', 'in_progress')`
    )
    .run({ startedAt, durationMinutes, type }).lastInsertRowid;
}

// Increment the pause counter for a session.
function incrementSessionPauseCount(id) {
  getDb()
    .prepare(`UPDATE sessions SET pause_count = pause_count + 1 WHERE id = ?`)
    .run(id);
}

// Mark a session as completed and store its data; transitions to xp_pending.
function completeSession({ id, endedAt, repos }) {
  getDb()
    .prepare(
      `UPDATE sessions SET ended_at = @endedAt, repos = @repos, status = 'xp_pending' WHERE id = @id`
    )
    .run({ id, endedAt, repos: JSON.stringify(repos) });
}

// Mark a session as fully done after XP has been committed.
function markSessionXpDone(id) {
  getDb()
    .prepare(`UPDATE sessions SET status = 'completed' WHERE id = ?`)
    .run(id);
}

// On startup: abort any session that was still in_progress (app was killed).
function abortInProgressSessions() {
  getDb()
    .prepare(`UPDATE sessions SET status = 'aborted' WHERE status = 'in_progress'`)
    .run();
}

// Return sessions that completed but whose XP was never committed.
function getPendingXpSessions() {
  return getDb()
    .prepare(`SELECT * FROM sessions WHERE status = 'xp_pending' ORDER BY started_at ASC`)
    .all()
    .map(r => ({ ...r, repos: safeJsonParse(r.repos, []) }));
}

function getSessionById(id) {
  const r = getDb().prepare(`SELECT * FROM sessions WHERE id = ?`).get(id);
  if (!r) return null;
  return { ...r, repos: safeJsonParse(r.repos, []) };
}

function saveSession(session) {
  const stmt = getDb().prepare(
    `INSERT INTO sessions (started_at, ended_at, duration_minutes, type, repos, status)
     VALUES (@started_at, @ended_at, @duration_minutes, @type, @repos, 'completed')`
  );
  return stmt.run({
    started_at: session.startedAt,
    ended_at: session.endedAt,
    duration_minutes: session.durationMinutes,
    type: session.type,
    repos: JSON.stringify(session.repos),
  });
}

function parseDateLocal(dateStr) {
  // Parse 'YYYY-MM-DD' as local time to avoid UTC-offset day shift
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function getSessionsForDate(dateStr) {
  // dateStr is 'YYYY-MM-DD', use local-midnight boundaries
  const dayStart = parseDateLocal(dateStr);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = parseDateLocal(dateStr);
  dayEnd.setHours(23, 59, 59, 999);

  const rows = getDb()
    .prepare(
      `SELECT * FROM sessions
       WHERE started_at >= ? AND started_at <= ?
       ORDER BY started_at ASC`
    )
    .all(dayStart.getTime(), dayEnd.getTime());

  return rows.map(r => ({ ...r, repos: safeJsonParse(r.repos, []) }));
}

function getAllSessions() {
  return getDb()
    .prepare(`SELECT * FROM sessions ORDER BY started_at DESC`)
    .all()
    .map(r => ({ ...r, repos: safeJsonParse(r.repos, []) }));
}

function getSessionWindowsForDate(dateStr) {
  const dayStart = parseDateLocal(dateStr);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = parseDateLocal(dateStr);
  dayEnd.setHours(23, 59, 59, 999);

  return getDb()
    .prepare(
      `SELECT started_at, ended_at FROM sessions
       WHERE started_at >= ? AND started_at <= ?
       ORDER BY started_at ASC`
    )
    .all(dayStart.getTime(), dayEnd.getTime());
}

function getXpState() {
  const row = getDb()
    .prepare(`SELECT * FROM xp_state WHERE id = 1`)
    .get();
  return {
    totalXp: row.total_xp,
    levelIndex: row.level_index,
    xpSinceLevel: row.xp_since_level,
    xpToNextLevel: row.xp_to_next_level,
    lastEventAt: row.last_event_at,
  };
}

function setXpState({ totalXp, levelIndex, xpSinceLevel, xpToNextLevel, lastEventAt }) {
  getDb()
    .prepare(
      `UPDATE xp_state
       SET total_xp = @totalXp,
           level_index = @levelIndex,
           xp_since_level = @xpSinceLevel,
           xp_to_next_level = @xpToNextLevel,
           last_event_at = @lastEventAt
       WHERE id = 1`
    )
    .run({ totalXp, levelIndex, xpSinceLevel, xpToNextLevel: xpToNextLevel ?? null, lastEventAt: lastEventAt ?? null });
}

// Append a single XP event. Never modifies or deletes existing rows.
function appendXpEvent({ eventType, xpAmount, reason, sessionId, createdAt }) {
  getDb()
    .prepare(
      `INSERT INTO xp_events (event_type, xp_amount, reason, session_id, created_at)
       VALUES (@eventType, @xpAmount, @reason, @sessionId, @createdAt)`
    )
    .run({ eventType, xpAmount, reason, sessionId, createdAt });
}

function getXpEvents({ sessionId } = {}) {
  if (sessionId != null) {
    return getDb()
      .prepare(`SELECT * FROM xp_events WHERE session_id = ? ORDER BY id ASC`)
      .all(sessionId);
  }
  return getDb()
    .prepare(`SELECT * FROM xp_events ORDER BY id ASC`)
    .all();
}

// Sum all XP earned from sessions that started on a given calendar day (YYYY-MM-DD).
function getXpForDate(dateStr) {
  const dayStart = parseDateLocal(dateStr);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = parseDateLocal(dateStr);
  dayEnd.setHours(23, 59, 59, 999);

  const rows = getDb()
    .prepare(
      `SELECT e.xp_amount
       FROM xp_events e
       JOIN sessions s ON s.id = e.session_id
       WHERE s.started_at >= ? AND s.started_at <= ?
         AND e.event_type != 'LEVEL_UP'`
    )
    .all(dayStart.getTime(), dayEnd.getTime());

  return rows.reduce((sum, r) => sum + r.xp_amount, 0);
}

// ─── Streak state (B-1) ───────────────────────────────────────────────────────

function getStreakState() {
  const row = getDb().prepare(`SELECT * FROM streak_state WHERE id = 1`).get();
  return {
    dailyStreak:        row.daily_streak,
    weeklyStreak:       row.weekly_streak,
    lastProductiveDay:  row.last_productive_day,
    lastProductiveWeek: row.last_productive_week,
    longestDailyStreak:  row.longest_daily_streak,
    longestWeeklyStreak: row.longest_weekly_streak,
    lastEvaluatedAt:    row.last_evaluated_at,
  };
}

function setStreakState({
  dailyStreak, weeklyStreak, lastProductiveDay, lastProductiveWeek,
  longestDailyStreak, longestWeeklyStreak, lastEvaluatedAt,
}) {
  getDb()
    .prepare(
      `UPDATE streak_state
       SET daily_streak          = @dailyStreak,
           weekly_streak         = @weeklyStreak,
           last_productive_day   = @lastProductiveDay,
           last_productive_week  = @lastProductiveWeek,
           longest_daily_streak  = @longestDailyStreak,
           longest_weekly_streak = @longestWeeklyStreak,
           last_evaluated_at     = @lastEvaluatedAt
       WHERE id = 1`
    )
    .run({
      dailyStreak,
      weeklyStreak,
      lastProductiveDay:  lastProductiveDay  ?? null,
      lastProductiveWeek: lastProductiveWeek ?? null,
      longestDailyStreak,
      longestWeeklyStreak,
      lastEvaluatedAt:    lastEvaluatedAt    ?? null,
    });
}

// ─── Productive day log (B-2) ─────────────────────────────────────────────────

// Returns the row for the given ISO date string, or null.
function getProductiveDay(dateStr) {
  return getDb()
    .prepare(`SELECT * FROM productive_days WHERE day = ?`)
    .get(dateStr) ?? null;
}

// Upsert: insert on first productive session of the day, increment commit
// count on subsequent sessions the same day (H-1, H-2).
function upsertProductiveDay(dateStr, qualifyingCommitCount) {
  getDb()
    .prepare(
      `INSERT INTO productive_days (day, qualifying_commits)
       VALUES (@day, @count)
       ON CONFLICT(day) DO UPDATE SET qualifying_commits = qualifying_commits + @count`
    )
    .run({ day: dateStr, count: qualifyingCommitCount });
}

// Return all productive day entries ordered chronologically.
function getAllProductiveDays() {
  return getDb()
    .prepare(`SELECT * FROM productive_days ORDER BY day ASC`)
    .all();
}

// Return productive day entries whose day falls within [mondayStr, sundayStr].
function getProductiveDaysInWeek(mondayStr, sundayStr) {
  return getDb()
    .prepare(
      `SELECT * FROM productive_days WHERE day >= ? AND day <= ? ORDER BY day ASC`
    )
    .all(mondayStr, sundayStr);
}

// ─── Badge unlocks (A-2) ──────────────────────────────────────────────────────

// Return all unlock records, ordered by unlock time ascending.
function getBadgeUnlocks() {
  return getDb()
    .prepare(`SELECT * FROM badge_unlocks ORDER BY unlocked_at ASC`)
    .all();
}

// Return the unlock record for a single slug, or null.
function getBadgeUnlock(slug) {
  return getDb()
    .prepare(`SELECT * FROM badge_unlocks WHERE slug = ?`)
    .get(slug) ?? null;
}

// Insert a batch of unlock records in one transaction (B-4).
function insertBadgeUnlocks(entries) {
  // entries: [{ slug, sessionId, unlockedAt }]
  const stmt = getDb().prepare(
    `INSERT OR IGNORE INTO badge_unlocks (slug, session_id, unlocked_at)
     VALUES (@slug, @sessionId, @unlockedAt)`
  );
  const tx = getDb().transaction(() => {
    for (const e of entries) stmt.run(e);
  });
  tx();
}

// ─── Badges meta (B-5) ────────────────────────────────────────────────────────

function isHistoricalPassDone() {
  return getDb()
    .prepare(`SELECT historical_pass_done FROM badges_meta WHERE id = 1`)
    .get()?.historical_pass_done === 1;
}

function markHistoricalPassDone() {
  getDb()
    .prepare(`UPDATE badges_meta SET historical_pass_done = 1 WHERE id = 1`)
    .run();
}

// ─── Quest slates (A-2) ───────────────────────────────────────────────────────

// Return the slate for a given ISO date string, or null if none exists.
function getQuestSlate(dateStr) {
  const row = getDb().prepare(`SELECT * FROM quest_slates WHERE date = ?`).get(dateStr);
  if (!row) return null;
  return { ...row, quests: safeJsonParse(row.quests, []), is_fallback: !!row.is_fallback };
}

// Write the initial slate for a day (called once, on first session completion).
function insertQuestSlate({ date, quests, isFallback, createdAt }) {
  getDb()
    .prepare(
      `INSERT OR IGNORE INTO quest_slates (date, quests, is_fallback, created_at)
       VALUES (@date, @quests, @isFallback, @createdAt)`
    )
    .run({ date, quests: JSON.stringify(quests), isFallback: isFallback ? 1 : 0, createdAt });
}

// Update the quests array in-place (for progress/completion/expiry updates).
function updateQuestSlate(dateStr, quests) {
  getDb()
    .prepare(`UPDATE quest_slates SET quests = ? WHERE date = ?`)
    .run(JSON.stringify(quests), dateStr);
}

// Return all slates ordered by date descending (for history view).
function getAllQuestSlates() {
  return getDb()
    .prepare(`SELECT * FROM quest_slates ORDER BY date DESC`)
    .all()
    .map(r => ({ ...r, quests: safeJsonParse(r.quests, []), is_fallback: !!r.is_fallback }));
}

// ─── Quest completions (A-3) ──────────────────────────────────────────────────

function appendQuestCompletion({ slug, targetValue, date, sessionId, xpAwarded, completedAt }) {
  getDb()
    .prepare(
      `INSERT INTO quest_completions (slug, target_value, date, session_id, xp_awarded, completed_at)
       VALUES (@slug, @targetValue, @date, @sessionId, @xpAwarded, @completedAt)`
    )
    .run({ slug, targetValue, date, sessionId, xpAwarded, completedAt });
}

function getQuestCompletions() {
  return getDb()
    .prepare(`SELECT * FROM quest_completions ORDER BY completed_at ASC`)
    .all();
}

function closeDb() {
  if (db) { db.close(); db = null; }
}

module.exports = {
  getDb,
  closeDb,
  saveSession,
  beginSession, completeSession, markSessionXpDone, abortInProgressSessions,
  getPendingXpSessions, getSessionById,
  getSessionsForDate, getAllSessions, getSessionWindowsForDate,
  getXpState, setXpState,
  appendXpEvent, getXpEvents, getXpForDate,
  getStreakState, setStreakState,
  getProductiveDay, upsertProductiveDay, getAllProductiveDays, getProductiveDaysInWeek,
  getBadgeUnlocks, getBadgeUnlock, insertBadgeUnlocks,
  isHistoricalPassDone, markHistoricalPassDone,
  incrementSessionPauseCount,
  getQuestSlate, insertQuestSlate, updateQuestSlate, getAllQuestSlates,
  appendQuestCompletion, getQuestCompletions,
};
