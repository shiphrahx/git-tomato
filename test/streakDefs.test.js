import { describe, it, expect } from 'vitest';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const { toDateStr, weekMonday, dailyStreakStatus, weeklyStreakStatus } = require('../main/streakDefs.js');

describe('toDateStr', () => {
  it('formats a known timestamp to YYYY-MM-DD', () => {
    // 2024-03-15 noon UTC
    const ms = new Date('2024-03-15T12:00:00Z').getTime();
    const result = toDateStr(ms);
    // Result is local time — just check format
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe('weekMonday', () => {
  it('returns a Monday date string', () => {
    // 2024-03-15 is a Friday
    const ms = new Date('2024-03-15T12:00:00Z').getTime();
    const monday = weekMonday(ms);
    expect(monday).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('returns same Monday for all days in the same week', () => {
    // Wed/Thu/Fri of the same week should share a Monday
    const wed = new Date('2024-03-13T12:00:00Z').getTime();
    const fri = new Date('2024-03-15T12:00:00Z').getTime();
    expect(weekMonday(wed)).toBe(weekMonday(fri));
  });
});

describe('dailyStreakStatus', () => {
  // Use fixed dates to avoid timezone drift in CI
  const today = '2024-03-15';
  const yesterday = '2024-03-14';
  const twoDaysAgo = '2024-03-13';

  it('returns "none" when lastProductiveDay is null', () => {
    expect(dailyStreakStatus(null, today)).toBe('none');
  });

  it('returns "safe" when lastProductiveDay is today', () => {
    expect(dailyStreakStatus(today, today)).toBe('safe');
  });

  it('returns "at-risk" when lastProductiveDay is yesterday', () => {
    expect(dailyStreakStatus(yesterday, today)).toBe('at-risk');
  });

  it('returns "broken" when gap is 2+ days', () => {
    expect(dailyStreakStatus(twoDaysAgo, today)).toBe('broken');
  });
});

describe('weeklyStreakStatus', () => {
  it('returns "none" when lastProductiveWeek is null and no productive days', () => {
    expect(weeklyStreakStatus(0, null, '2024-03-11')).toBe('none');
  });

  it('returns "at-risk" when lastProductiveWeek matches current week but under threshold', () => {
    expect(weeklyStreakStatus(3, '2024-03-11', '2024-03-11')).toBe('at-risk');
  });

  it('returns "safe" when productive days >= 5', () => {
    expect(weeklyStreakStatus(5, '2024-03-11', '2024-03-11')).toBe('safe');
  });

  it('returns "broken" when last productive week was 2+ weeks ago', () => {
    expect(weeklyStreakStatus(0, '2024-02-26', '2024-03-11')).toBe('broken');
  });
});
