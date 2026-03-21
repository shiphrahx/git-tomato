const Database = require('better-sqlite3');
const path = require('path');
const { app } = require('electron');

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
        event_type TEXT NOT NULL CHECK(event_type IN ('SESSION_COMPLETE','COMMIT_BONUS','FIRST_SESSION_OF_DAY','STREAK_BONUS','LEVEL_UP','COMEBACK_BONUS')),
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
    `);

    // Migration: add status column to sessions if it doesn't exist yet.
    // Values: 'in_progress' | 'completed' | 'aborted' | 'xp_pending'
    const cols = db.prepare(`PRAGMA table_info(sessions)`).all();
    if (!cols.find(c => c.name === 'status')) {
      db.exec(`ALTER TABLE sessions ADD COLUMN status TEXT NOT NULL DEFAULT 'completed'`);
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
    .map(r => ({ ...r, repos: JSON.parse(r.repos) }));
}

function getSessionById(id) {
  const r = getDb().prepare(`SELECT * FROM sessions WHERE id = ?`).get(id);
  if (!r) return null;
  return { ...r, repos: JSON.parse(r.repos) };
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

function getSessionsForDate(dateStr) {
  // dateStr is 'YYYY-MM-DD', use local-midnight boundaries
  const dayStart = new Date(dateStr);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dateStr);
  dayEnd.setHours(23, 59, 59, 999);

  const rows = getDb()
    .prepare(
      `SELECT * FROM sessions
       WHERE started_at >= ? AND started_at <= ?
       ORDER BY started_at ASC`
    )
    .all(dayStart.getTime(), dayEnd.getTime());

  return rows.map(r => ({ ...r, repos: JSON.parse(r.repos) }));
}

function getAllSessions() {
  return getDb()
    .prepare(`SELECT * FROM sessions ORDER BY started_at DESC`)
    .all()
    .map(r => ({ ...r, repos: JSON.parse(r.repos) }));
}

function getSessionWindowsForDate(dateStr) {
  const dayStart = new Date(dateStr);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dateStr);
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

module.exports = {
  getDb,
  saveSession,
  beginSession, completeSession, markSessionXpDone, abortInProgressSessions,
  getPendingXpSessions, getSessionById,
  getSessionsForDate, getAllSessions, getSessionWindowsForDate,
  getXpState, setXpState,
  appendXpEvent, getXpEvents,
  getStreakState, setStreakState,
  getProductiveDay, upsertProductiveDay, getAllProductiveDays, getProductiveDaysInWeek,
};
