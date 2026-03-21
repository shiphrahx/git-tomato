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
        event_type TEXT NOT NULL CHECK(event_type IN ('SESSION_COMPLETE','COMMIT_BONUS','FIRST_SESSION_OF_DAY','STREAK_BONUS','LEVEL_UP')),
        xp_amount INTEGER NOT NULL,
        reason TEXT NOT NULL,
        session_id INTEGER NOT NULL,
        created_at TEXT NOT NULL
      );
    `);
  }
  return db;
}

function saveSession(session) {
  const stmt = getDb().prepare(
    `INSERT INTO sessions (started_at, ended_at, duration_minutes, type, repos)
     VALUES (@started_at, @ended_at, @duration_minutes, @type, @repos)`
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

module.exports = { saveSession, getSessionsForDate, getAllSessions, getSessionWindowsForDate, getXpState, setXpState, appendXpEvent, getXpEvents };
