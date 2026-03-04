import { describe, it, expect } from 'vitest';
import { BADGES, computeEarnedBadges, getNextBadges } from '../utils/achievements.js';

const baseStats = {
  totalMinutes: 0,
  totalSessions: 0,
  longestSessionMinutes: 0,
  todayMinutes: 0,
  currentStreak: 0,
  hasEarlyBirdSession: false,
  hasNightOwlSession: false,
  maxSessionsInDay: 0,
};

describe('computeEarnedBadges', () => {
  it('returns empty array for zero stats', () => {
    expect(computeEarnedBadges(baseStats)).toEqual([]);
  });

  it('awards first_session after 1 session', () => {
    const earned = computeEarnedBadges({ ...baseStats, totalSessions: 1 });
    expect(earned).toContain('first_session');
  });

  it('awards hour_1 at 60 minutes', () => {
    const earned = computeEarnedBadges({ ...baseStats, totalMinutes: 60 });
    expect(earned).toContain('hour_1');
  });

  it('does NOT award hour_1 below 60 minutes', () => {
    const earned = computeEarnedBadges({ ...baseStats, totalMinutes: 59 });
    expect(earned).not.toContain('hour_1');
  });

  it('awards pomodoros_10 after 10 sessions', () => {
    const earned = computeEarnedBadges({ ...baseStats, totalSessions: 10 });
    expect(earned).toContain('pomodoros_10');
  });

  it('awards streak_3 for 3-day streak', () => {
    const earned = computeEarnedBadges({ ...baseStats, currentStreak: 3 });
    expect(earned).toContain('streak_3');
  });

  it('awards hours_5 at 300 minutes', () => {
    const earned = computeEarnedBadges({ ...baseStats, totalMinutes: 300 });
    expect(earned).toContain('hours_5');
  });

  it('awards hours_10 at 600 minutes', () => {
    const earned = computeEarnedBadges({ ...baseStats, totalMinutes: 600 });
    expect(earned).toContain('hours_10');
  });

  it('awards early_bird when flag is set', () => {
    const earned = computeEarnedBadges({ ...baseStats, hasEarlyBirdSession: true });
    expect(earned).toContain('early_bird');
  });

  it('awards night_owl when flag is set', () => {
    const earned = computeEarnedBadges({ ...baseStats, hasNightOwlSession: true });
    expect(earned).toContain('night_owl');
  });

  it('awards long_session at maxSessionsInDay >= 4', () => {
    const earned = computeEarnedBadges({ ...baseStats, maxSessionsInDay: 4 });
    expect(earned).toContain('long_session');
  });

  it('awards multiple badges at once', () => {
    const earned = computeEarnedBadges({
      ...baseStats,
      totalSessions: 25,
      totalMinutes: 600,
      currentStreak: 7,
    });
    expect(earned).toContain('pomodoros_25');
    expect(earned).toContain('hours_10');
    expect(earned).toContain('streak_7');
  });
});

describe('getNextBadges', () => {
  it('returns up to 3 unearned badges', () => {
    const next = getNextBadges(baseStats, []);
    expect(next.length).toBeLessThanOrEqual(3);
  });

  it('excludes already earned badges', () => {
    const earnedIds = BADGES.map((b) => b.id);
    const next = getNextBadges(baseStats, earnedIds);
    expect(next).toHaveLength(0);
  });
});

describe('BADGES', () => {
  it('has correct badge structure', () => {
    BADGES.forEach((badge) => {
      expect(badge).toHaveProperty('id');
      expect(badge).toHaveProperty('title');
      expect(badge).toHaveProperty('description');
      expect(badge).toHaveProperty('icon');
      expect(badge).toHaveProperty('tier');
      expect(badge).toHaveProperty('check');
      expect(typeof badge.check).toBe('function');
    });
  });

  it('contains at least 10 badges', () => {
    expect(BADGES.length).toBeGreaterThanOrEqual(10);
  });

  it('has unique badge IDs', () => {
    const ids = BADGES.map((b) => b.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });
});
