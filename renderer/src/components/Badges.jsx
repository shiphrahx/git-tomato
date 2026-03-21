import React, { useState, useEffect } from 'react';

// Badge definitions mirrored from main/badgeDefs.js (no IPC needed for static data)
const BADGES = [
  { slug: 'first_blood',        name: 'First blood',         description: 'Complete a session with at least one qualifying commit for the first time.',                        category: 'output' },
  { slug: 'firestarter',        name: 'Firestarter',         description: 'Produce 5 or more qualifying commits in a single session.',                                         category: 'output' },
  { slug: 'the_refactorer',     name: 'The refactorer',      description: 'Complete a session where every qualifying commit consists entirely of deletions.',                   category: 'output' },
  { slug: 'deleter',            name: 'Deleter',             description: 'Delete more lines than you add in a session, with at least 50 deleted lines.',                      category: 'output' },
  { slug: 'polyglot',           name: 'Polyglot',            description: 'Touch files with 4 or more distinct file extensions in a single session.',                         category: 'output' },
  { slug: 'century',            name: 'Century',             description: 'Reach 100 cumulative qualifying commits across all sessions.',                                       category: 'output' },
  { slug: 'deep_cut',           name: 'Deep cut',            description: 'Make a single qualifying commit with 200 or more total lines changed.',                             category: 'output' },
  { slug: 'creature_of_habit',  name: 'Creature of habit',   description: 'Reach a 7-day daily streak.',                                                                       category: 'consistency' },
  { slug: 'iron_week',          name: 'Iron week',           description: 'Complete productive sessions on all 7 days of a Monday–Sunday week.',                              category: 'consistency' },
  { slug: 'monthly_committer',  name: 'Monthly committer',   description: 'Reach a 30-day daily streak.',                                                                      category: 'consistency' },
  { slug: 'mono_tasker',        name: 'Mono-tasker',         description: 'Work on the same repository for 7 consecutive productive days.',                                    category: 'consistency' },
  { slug: 'comeback_kid',       name: 'Comeback kid',        description: 'Return to coding after a gap of 7 or more days and complete a qualifying session.',                 category: 'consistency' },
  { slug: 'early_bird',         name: 'Early bird',          description: 'Start a session before 08:00 and produce at least one qualifying commit.',                          category: 'time' },
  { slug: 'night_owl',          name: 'Night owl',           description: 'Start a session at or after 22:00 and produce at least one qualifying commit.',                     category: 'time' },
  { slug: 'deep_work',          name: 'Deep work',           description: 'Complete 4 or more productive sessions (with qualifying commits) in a single day.',                 category: 'time' },
  { slug: 'marathon',           name: 'Marathon',            description: 'Complete 8 or more Pomodoro sessions in a single day.',                                             category: 'time' },
  { slug: 'lunch_break_hacker', name: 'Lunch break hacker',  description: 'Start a session between 12:00 and 13:00 and produce at least one qualifying commit.',              category: 'time' },
  { slug: 'ghost_mode',         name: 'Ghost mode',          description: 'Complete a session without pausing the timer once.',                                                category: 'style' },
  { slug: 'greenfield',         name: 'Greenfield',          description: 'Make qualifying commits to 3 or more brand-new repositories within any rolling 7-day window.',     category: 'style' },
  { slug: 'silent_majority',    name: 'Silent majority',     description: 'Complete a session with 3+ qualifying commits where every commit message is 10 words or fewer.',   category: 'style' },
  { slug: 'the_cleaner',        name: 'The cleaner',         description: 'Delete at least twice as many lines as you add in a session, with at least 20 deleted lines.',     category: 'style' },
  { slug: 'level_up_unlocked',  name: 'Level up',            description: 'Level up for the first time (Seedling → Committer).',                                              category: 'mastery' },
  { slug: 'principal_engineer', name: 'Principal engineer',  description: 'Reach 3,000 total XP (level: Principal).',                                                         category: 'mastery' },
  { slug: 'ten_thousand_lines', name: 'Ten thousand lines',  description: 'Add 10,000 cumulative lines across all qualifying commits.',                                        category: 'mastery' },
  { slug: 'session_centurion',  name: 'Session centurion',   description: 'Complete 100 Pomodoro sessions.',                                                                   category: 'mastery' },
];

const CATEGORIES = ['output', 'consistency', 'time', 'style', 'mastery'];
const CATEGORY_LABELS = {
  output:      'Output',
  consistency: 'Consistency',
  time:        'Time',
  style:       'Style',
  mastery:     'Mastery',
};

function relativeDate(isoStr) {
  const ms = Date.now() - new Date(isoStr).getTime();
  const days = Math.floor(ms / 86_400_000);
  if (days === 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months !== 1 ? 's' : ''} ago`;
  const years = Math.floor(days / 365);
  return `${years} year${years !== 1 ? 's' : ''} ago`;
}

export function Badges() {
  const [unlocks, setUnlocks] = useState({}); // slug → unlock record

  useEffect(() => {
    if (!window.electronAPI) return;

    async function load() {
      const records = await window.electronAPI.getBadgeUnlocks();
      const map = {};
      for (const r of (records ?? [])) map[r.slug] = r;
      setUnlocks(map);
    }

    load();

    const unsub = window.electronAPI.onBadgesUpdated((records) => {
      const map = {};
      for (const r of (records ?? [])) map[r.slug] = r;
      setUnlocks(map);
    });
    return unsub;
  }, []);

  return (
    <div className="badges">
      {CATEGORIES.map(cat => {
        const catBadges = BADGES.filter(b => b.category === cat);
        return (
          <div key={cat} className="badges__category">
            <div className="badges__category-title">{CATEGORY_LABELS[cat]}</div>
            <div className="badges__grid">
              {catBadges.map(badge => {
                const unlock = unlocks[badge.slug];
                const isUnlocked = !!unlock;
                return (
                  <div
                    key={badge.slug}
                    className={`badge-card${isUnlocked ? ' badge-card--unlocked' : ' badge-card--locked'}`}
                  >
                    <div className="badge-card__icon">{isUnlocked ? '🏅' : '🔒'}</div>
                    <div className="badge-card__body">
                      <div className="badge-card__name">{badge.name}</div>
                      <div className="badge-card__desc">{badge.description}</div>
                      {isUnlocked && (
                        <div className="badge-card__date">Unlocked {relativeDate(unlock.unlocked_at)}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export { BADGES };
