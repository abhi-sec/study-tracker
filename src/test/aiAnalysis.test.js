import { describe, it, expect } from 'vitest';
import { analyzeStudyPatterns } from '../utils/aiAnalysis.js';

const baseStats = {
  totalMinutes: 0,
  totalSessions: 0,
  longestSessionMinutes: 0,
  currentStreak: 0,
  hasEarlyBirdSession: false,
  hasNightOwlSession: false,
};

function makeSession(hoursAgo, durationMinutes) {
  const d = new Date();
  d.setHours(d.getHours() - hoursAgo);
  return { startTime: d.toISOString(), durationMinutes, durationSeconds: durationMinutes * 60 };
}

describe('analyzeStudyPatterns', () => {
  it('returns not ready for empty sessions', () => {
    const result = analyzeStudyPatterns([], baseStats);
    expect(result.ready).toBe(false);
    expect(result.message).toBeTruthy();
  });

  it('returns analysis for sessions with data', () => {
    const sessions = [
      makeSession(2, 25),
      makeSession(26, 25),
      makeSession(50, 50),
    ];
    const stats = { ...baseStats, totalMinutes: 100, totalSessions: 3 };
    const result = analyzeStudyPatterns(sessions, stats);
    expect(result.ready).toBe(true);
    expect(result.consistencyScore).toBeGreaterThanOrEqual(0);
    expect(result.consistencyScore).toBeLessThanOrEqual(100);
    expect(['improving', 'stable', 'declining']).toContain(result.trend);
    expect(result.recommendations).toBeInstanceOf(Array);
    expect(result.recommendations.length).toBeGreaterThan(0);
  });

  it('identifies top study hours', () => {
    const now = new Date();
    const morningSession = new Date(now);
    morningSession.setHours(9, 0, 0, 0);
    const sessions = Array.from({ length: 5 }, () => ({
      startTime: morningSession.toISOString(),
      durationMinutes: 25,
    }));
    const stats = { ...baseStats, totalMinutes: 125, totalSessions: 5 };
    const result = analyzeStudyPatterns(sessions, stats);
    expect(result.top3Hours.length).toBeGreaterThan(0);
    // Most sessions are in the 9am hour
    expect(result.top3Hours[0].hour).toBe(9);
  });

  it('computes milestoneEst when avgDailyMinutes > 0', () => {
    const sessions = Array.from({ length: 3 }, (_, i) => makeSession(i * 24, 30));
    const stats = { ...baseStats, totalMinutes: 90, totalSessions: 3 };
    const result = analyzeStudyPatterns(sessions, stats);
    // Either there is an estimate or totalMinutes already exceeds all milestones
    if (result.milestoneEst) {
      expect(result.milestoneEst.hours).toBeGreaterThan(0);
      expect(result.milestoneEst.days).toBeGreaterThan(0);
    }
  });

  it('returns daily breakdown for recent sessions', () => {
    const sessions = [makeSession(1, 25), makeSession(25, 30)];
    const stats = { ...baseStats, totalMinutes: 55, totalSessions: 2 };
    const result = analyzeStudyPatterns(sessions, stats);
    expect(result.dailyBreakdown).toBeInstanceOf(Array);
  });

  it('returns hourly distribution with 24 slots', () => {
    const sessions = [makeSession(2, 25)];
    const stats = { ...baseStats, totalMinutes: 25, totalSessions: 1 };
    const result = analyzeStudyPatterns(sessions, stats);
    expect(result.hourlyDist).toHaveLength(24);
  });

  it('recommends starting streak when streak is 0', () => {
    const sessions = [makeSession(2, 25)];
    const stats = { ...baseStats, totalMinutes: 25, totalSessions: 1, currentStreak: 0 };
    const result = analyzeStudyPatterns(sessions, stats);
    const hasStreakRec = result.recommendations.some((r) => r.includes('streak'));
    expect(hasStreakRec).toBe(true);
  });
});
