import { useState, useEffect, useCallback } from 'react';
import { computeEarnedBadges } from '../utils/achievements.js';

const STORAGE_KEY = 'study_tracker_sessions';
const STATS_KEY = 'study_tracker_stats';

function today() {
  return new Date().toISOString().slice(0, 10);
}

function calcStreak(sessions) {
  if (!sessions.length) return 0;
  const daySet = new Set(
    sessions.map((s) => new Date(s.startTime).toISOString().slice(0, 10)),
  );
  let streak = 0;
  const d = new Date();
  while (true) {
    const key = d.toISOString().slice(0, 10);
    if (daySet.has(key)) {
      streak++;
      d.setDate(d.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

function calcMaxSessionsInDay(sessions) {
  const counts = {};
  sessions.forEach((s) => {
    const d = new Date(s.startTime).toISOString().slice(0, 10);
    counts[d] = (counts[d] || 0) + 1;
  });
  return Math.max(0, ...Object.values(counts));
}

function buildStats(sessions) {
  if (!sessions.length) {
    return {
      totalMinutes: 0,
      totalSessions: 0,
      longestSessionMinutes: 0,
      todayMinutes: 0,
      currentStreak: 0,
      hasEarlyBirdSession: false,
      hasNightOwlSession: false,
      maxSessionsInDay: 0,
    };
  }

  const todayKey = today();
  let totalMinutes = 0;
  let todayMinutes = 0;
  let longestSessionMinutes = 0;
  let hasEarlyBirdSession = false;
  let hasNightOwlSession = false;

  sessions.forEach((s) => {
    const mins = Math.round((s.durationSeconds || 0) / 60);
    totalMinutes += mins;
    const sDay = new Date(s.startTime).toISOString().slice(0, 10);
    if (sDay === todayKey) todayMinutes += mins;
    if (mins > longestSessionMinutes) longestSessionMinutes = mins;
    const hour = new Date(s.startTime).getHours();
    if (hour < 8) hasEarlyBirdSession = true;
    if (hour >= 22) hasNightOwlSession = true;
  });

  return {
    totalMinutes,
    totalSessions: sessions.length,
    longestSessionMinutes,
    todayMinutes,
    currentStreak: calcStreak(sessions),
    hasEarlyBirdSession,
    hasNightOwlSession,
    maxSessionsInDay: calcMaxSessionsInDay(sessions),
  };
}

/**
 * useSessions — manages session persistence, stats, and badge computation.
 */
export function useSessions() {
  const [sessions, setSessions] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  });

  const [stats, setStats] = useState(() => buildStats([]));
  const [earnedBadgeIds, setEarnedBadgeIds] = useState([]);
  const [newlyEarned, setNewlyEarned] = useState([]);

  // Recompute stats and badges whenever sessions change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    const newStats = buildStats(sessions);
    setStats(newStats);
    const earned = computeEarnedBadges(newStats);
    setEarnedBadgeIds((prev) => {
      const fresh = earned.filter((id) => !prev.includes(id));
      if (fresh.length) setNewlyEarned(fresh);
      return earned;
    });
  }, [sessions]);

  const addSession = useCallback((durationSeconds, startTime) => {
    const session = {
      id: Date.now(),
      startTime: startTime || new Date().toISOString(),
      durationSeconds: Math.max(0, Math.round(durationSeconds)),
      durationMinutes: Math.round(Math.max(0, durationSeconds) / 60),
    };
    setSessions((prev) => [...prev, session]);
    return session;
  }, []);

  const clearSessions = useCallback(() => {
    setSessions([]);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STATS_KEY);
  }, []);

  const dismissNewBadges = useCallback(() => setNewlyEarned([]), []);

  return {
    sessions,
    stats,
    earnedBadgeIds,
    newlyEarned,
    addSession,
    clearSessions,
    dismissNewBadges,
  };
}
