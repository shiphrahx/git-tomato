// Achievement badge evaluation engine — Sections A, B, C, D, F.
// Runs after XP and Streaks modules complete (B-1).

const store = require('./store');
const { BADGES } = require('./badgeDefs');
const { analyseCommitsRich } = require('./commitAnalyser');
const { toDateStr, weekMonday } = require('./streakDefs');

// ─── Condition helpers ────────────────────────────────────────────────────────

function localHour(ms) {
  return new Date(ms).getHours();
}

// Build per-session aggregates from the XP event log in a single pass, so
// condition evaluators don't each re-scan all events (was O(sessions × events)).
//   sessionsWithBonus: Set<session_id> that have ≥1 COMMIT_BONUS
//   completeOnDay:     Map<dayStr, Set<session_id>> for SESSION_COMPLETE events
function indexXpEvents(allXpEvents) {
  const sessionsWithBonus = new Set();
  const completeOnDay = new Map();
  for (const e of allXpEvents) {
    if (e.event_type === 'COMMIT_BONUS') {
      sessionsWithBonus.add(e.session_id);
    } else if (e.event_type === 'SESSION_COMPLETE') {
      const day = toDateStr(new Date(e.created_at).getTime());
      let set = completeOnDay.get(day);
      if (!set) { set = new Set(); completeOnDay.set(day, set); }
      set.add(e.session_id);
    }
  }
  return { sessionsWithBonus, completeOnDay };
}

// Count all SESSION_COMPLETE events on todayStr.
function sessionCompleteCountToday(todayStr, xpIndex) {
  return xpIndex.completeOnDay.get(todayStr)?.size ?? 0;
}

// Count productive sessions (with at least one COMMIT_BONUS) on todayStr.
function productiveSessionCountToday(todayStr, xpIndex) {
  const completed = xpIndex.completeOnDay.get(todayStr);
  if (!completed) return 0;
  let count = 0;
  for (const sid of completed) {
    if (xpIndex.sessionsWithBonus.has(sid)) count++;
  }
  return count;
}

// ─── Per-badge condition evaluators ──────────────────────────────────────────
// Each evaluator receives a context object and returns true/false.
// context = {
//   session,          // sessions row
//   richCommits,      // analyseCommitsRich() result for this session
//   xpResult,         // from xp.awardSessionXp()
//   streakResult,     // from evaluateStreak() (may be default if non-qualifying)
//   allXpEvents,      // all rows from xp_events table
//   unlockedSlugs,    // Set<string> of already-unlocked slugs
//   todayStr,         // YYYY-MM-DD
//   nowMs,            // Date.now() at evaluation time
// }

const CONDITIONS = {

  // ── output ──────────────────────────────────────────────────────────────────

  first_blood(ctx) {
    // First session ever with at least one qualifying commit (C-1)
    if (ctx.richCommits.length === 0) return false;
    // No COMMIT_BONUS in event log before this session
    const priorBonus = ctx.allXpEvents.some(
      e => e.event_type === 'COMMIT_BONUS' && e.session_id !== ctx.session.id
    );
    return !priorBonus;
  },

  firestarter(ctx) {
    // 5+ qualifying commits in this session (C-2)
    return ctx.richCommits.length >= 5;
  },

  the_refactorer(ctx) {
    // All qualifying commits are pure deletions, at least one commit (C-3)
    if (ctx.richCommits.length === 0) return false;
    return ctx.richCommits.every(c => c.additions === 0 && c.deletions > 0);
  },

  deleter(ctx) {
    // Cumulative deletions > additions, total deletions >= 50 (C-4)
    if (ctx.richCommits.length === 0) return false;
    const totalAdded   = ctx.richCommits.reduce((s, c) => s + c.additions, 0);
    const totalDeleted = ctx.richCommits.reduce((s, c) => s + c.deletions, 0);
    return totalDeleted > totalAdded && totalDeleted >= 50;
  },

  polyglot(ctx) {
    // 4+ distinct file extensions across qualifying commits (C-5)
    if (ctx.richCommits.length === 0) return false;
    const exts = new Set();
    for (const c of ctx.richCommits) {
      for (const ext of c.fileExtensions) exts.add(ext);
    }
    return exts.size >= 4;
  },

  century(ctx) {
    // 100+ cumulative COMMIT_BONUS entries ever (C-6)
    const total = ctx.allXpEvents.filter(e => e.event_type === 'COMMIT_BONUS').length;
    return total >= 100;
  },

  deep_cut(ctx) {
    // Any single qualifying commit has 200+ total lines changed (C-7)
    return ctx.richCommits.some(c => c.totalLines >= 200);
  },

  // ── consistency ─────────────────────────────────────────────────────────────

  creature_of_habit(ctx) {
    // Daily streak reaches 7 (C-8)
    return (ctx.streakResult.dailyStreak ?? 0) >= 7;
  },

  iron_week(ctx) {
    // 7 distinct productive days in the same Mon-Sun week (C-9)
    const monday = weekMonday(ctx.nowMs);
    const allDays = store.getAllProductiveDays();
    const daysInWeek = allDays.filter(d => weekMonday(new Date(d.day).getTime()) === monday);
    return daysInWeek.length >= 7;
  },

  monthly_committer(ctx) {
    // Daily streak reaches 30 (C-10)
    return (ctx.streakResult.dailyStreak ?? 0) >= 30;
  },

  mono_tasker(ctx) {
    // Same single repo for 7 consecutive productive days (C-11)
    const allDays = store.getAllProductiveDays();
    if (allDays.length < 7) return false;
    const last7 = allDays.slice(-7);

    // For each of the last 7 productive days, collect repos from sessions that day
    const repoSetsPerDay = last7.map(pd => {
      const sessions = store.getSessionsForDate(pd.day);
      const ids = new Set();
      for (const s of sessions) {
        const repos = typeof s.repos === 'string' ? JSON.parse(s.repos) : (s.repos ?? []);
        for (const r of repos) {
          // Use remoteUrl if present, else derive from repo name (F-4 handled at collection time)
          if (r.remoteUrl) ids.add(r.remoteUrl);
          else if (r.repo) ids.add(r.repo);
        }
      }
      return ids;
    });

    // All days must reference exactly one repo and it must be the same across all 7
    if (repoSetsPerDay.some(s => s.size !== 1)) return false;
    const firstRepo = [...repoSetsPerDay[0]][0];
    return repoSetsPerDay.every(s => s.has(firstRepo));
  },

  comeback_kid(ctx) {
    // Comeback with gap >= 7 calendar days (C-12)
    return ctx.streakResult.isComeback && (ctx.streakResult.gapDays ?? 0) >= 7;
  },

  // ── time ────────────────────────────────────────────────────────────────────

  early_bird(ctx) {
    // Session started before 08:00 local, at least one qualifying commit (D-2)
    if (ctx.richCommits.length === 0) return false;
    return localHour(ctx.session.started_at) < 8;
  },

  night_owl(ctx) {
    // Session started at or after 22:00 local, at least one qualifying commit (D-2)
    if (ctx.richCommits.length === 0) return false;
    return localHour(ctx.session.started_at) >= 22;
  },

  deep_work(ctx) {
    // 4+ productive sessions (with qualifying commits) today (C-15)
    return productiveSessionCountToday(ctx.todayStr, ctx.xpIndex) >= 4;
  },

  marathon(ctx) {
    // 8+ SESSION_COMPLETE events today regardless of commits (C-16)
    return sessionCompleteCountToday(ctx.todayStr, ctx.xpIndex) >= 8;
  },

  lunch_break_hacker(ctx) {
    // Session started 12:00–13:00 local, at least one qualifying commit (D-2, C-17)
    if (ctx.richCommits.length === 0) return false;
    const h = localHour(ctx.session.started_at);
    return h >= 12 && h < 13;
  },

  // ── style ────────────────────────────────────────────────────────────────────

  ghost_mode(ctx) {
    // Session completed with zero pauses (C-18)
    return (ctx.session.pause_count ?? 0) === 0;
  },

  greenfield(ctx) {
    // 3+ new repos (not seen before 7-day window) in rolling 7-day window (C-19)
    const windowStart = new Date(ctx.nowMs);
    windowStart.setDate(windowStart.getDate() - 6);
    windowStart.setHours(0, 0, 0, 0);
    const windowStartStr = toDateStr(windowStart.getTime());

    const allDays = store.getAllProductiveDays();
    const beforeWindow = allDays.filter(d => d.day < windowStartStr);
    const inWindow     = allDays.filter(d => d.day >= windowStartStr);

    // Collect repo IDs seen before window
    const oldRepos = new Set();
    for (const pd of beforeWindow) {
      const sessions = store.getSessionsForDate(pd.day);
      for (const s of sessions) {
        const repos = typeof s.repos === 'string' ? JSON.parse(s.repos) : (s.repos ?? []);
        for (const r of repos) oldRepos.add(r.remoteUrl || r.repo);
      }
    }

    // Collect new repo IDs seen only within window
    const newRepos = new Set();
    for (const pd of inWindow) {
      const sessions = store.getSessionsForDate(pd.day);
      for (const s of sessions) {
        const repos = typeof s.repos === 'string' ? JSON.parse(s.repos) : (s.repos ?? []);
        for (const r of repos) {
          const id = r.remoteUrl || r.repo;
          if (!oldRepos.has(id)) newRepos.add(id);
        }
      }
    }

    return newRepos.size >= 3;
  },

  silent_majority(ctx) {
    // 3+ qualifying commits, all messages 10 words or fewer (C-20)
    if (ctx.richCommits.length < 3) return false;
    return ctx.richCommits.every(c => {
      const firstLine = c.message.split('\n')[0];
      return firstLine.trim().split(/\s+/).filter(Boolean).length <= 10;
    });
  },

  the_cleaner(ctx) {
    // deletions >= additions * 2, deletions >= 20 (C-21)
    if (ctx.richCommits.length === 0) return false;
    const totalAdded   = ctx.richCommits.reduce((s, c) => s + c.additions, 0);
    const totalDeleted = ctx.richCommits.reduce((s, c) => s + c.deletions, 0);
    return totalDeleted >= totalAdded * 2 && totalDeleted >= 20;
  },

  // ── mastery ──────────────────────────────────────────────────────────────────

  level_up_unlocked(ctx) {
    // Current session triggered a LEVEL_UP for the first time ever (C-22)
    const sessionLevelUp = ctx.xpResult?.events?.some(e => e.eventType === 'LEVEL_UP');
    if (!sessionLevelUp) return false;
    // Ensure no prior LEVEL_UP in event log from other sessions
    const priorLevelUp = ctx.allXpEvents.some(
      e => e.event_type === 'LEVEL_UP' && e.session_id !== ctx.session.id
    );
    return !priorLevelUp;
  },

  principal_engineer(ctx) {
    // Total XP >= 3000 (C-23)
    return (ctx.xpResult?.newTotalXp ?? store.getXpState().totalXp) >= 3000;
  },

  ten_thousand_lines(ctx) {
    // Cumulative qualifying lines changed across all sessions >= 10,000 (C-24).
    // Line totals are cached per session in sessions.total_lines, so this reads
    // a single SUM instead of re-running git over all history each completion.
    // Any sessions whose total wasn't computed yet (-1) are backfilled once.
    const missing = store.getSessionsMissingTotalLines();
    if (missing.length > 0) {
      const settings = _getSettings();
      for (const s of missing) {
        const rich = analyseCommitsRich(settings.repoPaths ?? [], s.started_at, s.ended_at);
        const lines = rich.reduce((sum, c) => sum + c.totalLines, 0);
        store.setSessionTotalLines(s.id, lines);
      }
    }
    return store.getTotalLinesSum() >= 10000;
  },

  session_centurion(ctx) {
    // 100th SESSION_COMPLETE event in XP event log (C-25)
    const total = ctx.allXpEvents.filter(e => e.event_type === 'SESSION_COMPLETE').length;
    return total >= 100;
  },
};

// ─── Settings helper ──────────────────────────────────────────────────────────

let _settingsCache = null;
function _getSettings() {
  if (_settingsCache) return _settingsCache;
  try {
    const { app } = require('electron');
    const fs = require('fs');
    const p = require('path').join(app.getPath('userData'), 'settings.json');
    _settingsCache = JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch (e) {
    console.error('[badges] Failed to load settings, using defaults:', e.message);
    _settingsCache = { repoPaths: [] };
  }
  return _settingsCache;
}

// Invalidate cache when settings change (called from index.js on settings write).
function invalidateSettingsCache() {
  _settingsCache = null;
}

// ─── Main evaluation function (B-1 through B-4) ───────────────────────────────

/**
 * Evaluate all badge conditions for a completed session.
 * Returns newly unlocked badge slugs.
 *
 * @param {object} params
 * @param {object} params.session       - The completed sessions row.
 * @param {Array}  params.richCommits   - analyseCommitsRich() result for this session.
 * @param {object} params.xpResult      - Return value of xp.awardSessionXp().
 * @param {object} params.streakResult  - Return value of evaluateStreak() (or defaults).
 * @param {boolean} [params.historical] - True during historical pass (no notifications).
 * @returns {string[]} Slugs of newly unlocked badges (in evaluation order).
 */
function evaluateBadges({ session, richCommits, xpResult, streakResult, historical = false }) {
  const nowMs    = historical ? new Date(session.ended_at || session.started_at).getTime() : Date.now();
  const todayStr = toDateStr(nowMs);

  // B-3: load existing unlocks first
  const existingUnlocks = store.getBadgeUnlocks();
  const unlockedSlugs   = new Set(existingUnlocks.map(u => u.slug));

  // Load XP events once and build per-session aggregates in a single pass
  const allXpEvents = store.getXpEvents();
  const xpIndex = indexXpEvents(allXpEvents);

  const ctx = {
    session,
    richCommits,
    xpResult,
    streakResult: streakResult ?? { dailyStreak: 0, weeklyStreak: 0, isComeback: false, gapDays: 0 },
    allXpEvents,
    xpIndex,
    unlockedSlugs,
    todayStr,
    nowMs,
  };

  // B-2: evaluate all badges; collect newly met ones
  const newlyUnlocked = [];
  for (const badge of BADGES) {
    if (unlockedSlugs.has(badge.slug)) continue; // B-3: skip already unlocked
    if (badge.retired) continue; // F-5: skip retired badges
    try {
      if (CONDITIONS[badge.slug] && CONDITIONS[badge.slug](ctx)) {
        newlyUnlocked.push(badge.slug);
      }
    } catch (err) {
      console.error(`[badges] condition error for ${badge.slug}:`, err);
    }
  }

  if (newlyUnlocked.length === 0) return [];

  // B-4: write all unlock records in a single transaction
  const unlockedAt = new Date(nowMs).toISOString();
  store.insertBadgeUnlocks(
    newlyUnlocked.map(slug => ({
      slug,
      sessionId: session.id,
      unlockedAt,
    }))
  );

  return newlyUnlocked;
}

// ─── Historical evaluation pass (B-5, F-3) ────────────────────────────────────

/**
 * Run once after installation to retroactively unlock badges from past sessions.
 * Writes no notifications (F-3).
 */
function runHistoricalEvaluation() {
  if (store.isHistoricalPassDone()) return;

  const settings = _getSettings();
  const allSessions = store.getAllSessions()
    .filter(s => s.type === 'focus' && (s.status === 'completed' || s.status === 'xp_pending'))
    .sort((a, b) => a.started_at - b.started_at); // chronological order

  for (const session of allSessions) {
    try {
      const richCommits = analyseCommitsRich(
        settings.repoPaths ?? [],
        session.started_at,
        session.ended_at || session.started_at
      );
      evaluateBadges({
        session,
        richCommits,
        xpResult: null,
        streakResult: null,
        historical: true,
      });
    } catch (err) {
      console.error(`[badges] historical pass error for session ${session.id}:`, err);
    }
  }

  store.markHistoricalPassDone();
}

module.exports = { evaluateBadges, runHistoricalEvaluation, invalidateSettingsCache };
