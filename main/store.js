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
      )
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

module.exports = { saveSession, getSessionsForDate, getAllSessions };
