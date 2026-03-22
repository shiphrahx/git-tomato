// Quest type definitions — static constants, never stored in the database.
// A-1: each definition has slug, nameTemplate, category, conditionId, and floor values per tier.

const QUEST_TYPES = [
  // ─── Output ──────────────────────────────────────────────────────────────────
  {
    slug: 'commits_per_session',
    nameTemplate: 'Ship {n} commits in a single session',
    category: 'output',
    conditionId: 'commits_per_session',
    floors: { standard: 2, stretch: 3, elite: 5 },
    adaptive: true,
    baselineMetric: 'avgCommitsPerSession',
  },
  {
    slug: 'commits_per_day',
    nameTemplate: 'Ship {n} qualifying commits today',
    category: 'output',
    conditionId: 'commits_per_day',
    floors: { standard: 3, stretch: 5, elite: 8 },
    adaptive: true,
    baselineMetric: 'avgCommitsPerDay',
  },
  {
    slug: 'lines_changed',
    nameTemplate: 'Change {n} lines of code today',
    category: 'output',
    conditionId: 'lines_changed',
    floors: { standard: 50, stretch: 150, elite: 300 },
    adaptive: false,
    fixedTargets: { standard: 50, stretch: 150, elite: 300 },
  },
  {
    slug: 'multi_repo',
    nameTemplate: 'Commit to {n} different repositories today',
    category: 'output',
    conditionId: 'multi_repo',
    floors: { standard: 2, stretch: 3, elite: 4 },
    adaptive: false,
    fixedTargets: { standard: 2, stretch: 3, elite: 4 },
  },

  // ─── Consistency ─────────────────────────────────────────────────────────────
  {
    slug: 'sessions_per_day',
    nameTemplate: 'Complete {n} focus sessions today',
    category: 'consistency',
    conditionId: 'sessions_per_day',
    floors: { standard: 2, stretch: 3, elite: 5 },
    adaptive: true,
    baselineMetric: 'avgSessionsPerDay',
  },
  {
    slug: 'back_to_back',
    nameTemplate: 'Complete {n} sessions without a gap longer than 10 minutes',
    category: 'consistency',
    conditionId: 'back_to_back',
    floors: { standard: 2, stretch: 3, elite: 4 },
    adaptive: false,
    fixedTargets: { standard: 2, stretch: 3, elite: 4 },
  },
  {
    slug: 'beat_yesterday',
    nameTemplate: 'Complete more sessions than yesterday',
    category: 'consistency',
    conditionId: 'beat_yesterday',
    floors: { standard: 2, stretch: 2, elite: 2 },
    adaptive: false, // target computed dynamically at generation time
    fixedTargets: null, // computed per-day
  },
  {
    slug: 'streak_extend',
    nameTemplate: 'Keep your {n}-day streak alive',
    category: 'consistency',
    conditionId: 'streak_extend',
    floors: { standard: 1, stretch: 1, elite: 1 },
    adaptive: false,
    fixedTargets: null, // target = current daily streak count
  },

  // ─── Time ─────────────────────────────────────────────────────────────────────
  {
    slug: 'morning_session',
    nameTemplate: 'Start a session before {time}',
    category: 'time',
    conditionId: 'morning_session',
    floors: { standard: 6, stretch: 6, elite: 6 }, // floor = 06:00 (hour)
    adaptive: true,
    baselineMetric: 'mostCommonStartHour',
  },
  {
    slug: 'focused_hours',
    nameTemplate: 'Accumulate {n} hours of focus time today',
    category: 'time',
    conditionId: 'focused_hours',
    floors: { standard: 1, stretch: 2, elite: 3 },
    adaptive: false,
    fixedTargets: { standard: 1, stretch: 2, elite: 3 }, // hours
  },
  {
    slug: 'golden_hour',
    nameTemplate: 'Ship a commit between 09:00 and 10:00',
    category: 'time',
    conditionId: 'golden_hour',
    floors: { standard: 1, stretch: 1, elite: 1 },
    adaptive: false,
    fixedTargets: { standard: 1, stretch: 1, elite: 1 },
  },
  {
    slug: 'consistency_window',
    nameTemplate: 'Complete all sessions within a 4-hour window',
    category: 'time',
    conditionId: 'consistency_window',
    floors: { standard: 1, stretch: 1, elite: 1 },
    adaptive: false,
    fixedTargets: { standard: 1, stretch: 1, elite: 1 },
  },

  // ─── Style ────────────────────────────────────────────────────────────────────
  {
    slug: 'clean_commits',
    nameTemplate: 'Write {n} commits with messages under 10 words',
    category: 'style',
    conditionId: 'clean_commits',
    floors: { standard: 2, stretch: 3, elite: 5 },
    adaptive: false,
    fixedTargets: { standard: 2, stretch: 3, elite: 5 },
  },
  {
    slug: 'deletion_day',
    nameTemplate: 'Delete more lines than you add today',
    category: 'style',
    conditionId: 'deletion_day',
    floors: { standard: 1, stretch: 1, elite: 1 },
    adaptive: false,
    fixedTargets: { standard: 1, stretch: 1, elite: 1 }, // binary, target unused in condition
  },
];

const QUEST_BY_SLUG = Object.fromEntries(QUEST_TYPES.map(q => [q.slug, q]));

// XP rewards by difficulty tier slot (D-4)
const TIER_XP = {
  standard: 20,
  stretch: 35,
  elite:   50,
};

module.exports = { QUEST_TYPES, QUEST_BY_SLUG, TIER_XP };
