/**
 * Achievement badge definitions and evaluation logic.
 * Each badge has an id, title, description, icon, condition function,
 * and the required threshold value.
 */

export const BADGES = [
  {
    id: 'first_session',
    title: 'First Step',
    description: 'Complete your very first Pomodoro session',
    icon: '🌱',
    tier: 'bronze',
    check: (stats) => stats.totalSessions >= 1,
  },
  {
    id: 'hour_1',
    title: 'One Hour In',
    description: 'Accumulate 1 hour of study time',
    icon: '⏱️',
    tier: 'bronze',
    check: (stats) => stats.totalMinutes >= 60,
  },
  {
    id: 'pomodoros_10',
    title: 'Pomodoro Rookie',
    description: 'Complete 10 Pomodoro sessions',
    icon: '🍅',
    tier: 'bronze',
    check: (stats) => stats.totalSessions >= 10,
  },
  {
    id: 'hours_5',
    title: 'Consistent Learner',
    description: 'Accumulate 5 hours of study time',
    icon: '📚',
    tier: 'silver',
    check: (stats) => stats.totalMinutes >= 300,
  },
  {
    id: 'pomodoros_25',
    title: 'Pomodoro Veteran',
    description: 'Complete 25 Pomodoro sessions',
    icon: '🎯',
    tier: 'silver',
    check: (stats) => stats.totalSessions >= 25,
  },
  {
    id: 'hours_10',
    title: 'Dedicated Scholar',
    description: 'Accumulate 10 hours of study time',
    icon: '🎓',
    tier: 'silver',
    check: (stats) => stats.totalMinutes >= 600,
  },
  {
    id: 'streak_3',
    title: 'Three-Day Streak',
    description: 'Study for 3 consecutive days',
    icon: '🔥',
    tier: 'silver',
    check: (stats) => stats.currentStreak >= 3,
  },
  {
    id: 'hours_25',
    title: 'Study Master',
    description: 'Accumulate 25 hours of study time',
    icon: '⭐',
    tier: 'gold',
    check: (stats) => stats.totalMinutes >= 1500,
  },
  {
    id: 'pomodoros_100',
    title: 'Pomodoro Pro',
    description: 'Complete 100 Pomodoro sessions',
    icon: '💯',
    tier: 'gold',
    check: (stats) => stats.totalSessions >= 100,
  },
  {
    id: 'streak_7',
    title: 'Weekly Warrior',
    description: 'Study for 7 consecutive days',
    icon: '⚡',
    tier: 'gold',
    check: (stats) => stats.currentStreak >= 7,
  },
  {
    id: 'hours_50',
    title: 'Study Legend',
    description: 'Accumulate 50 hours of study time',
    icon: '🏆',
    tier: 'platinum',
    check: (stats) => stats.totalMinutes >= 3000,
  },
  {
    id: 'hours_100',
    title: 'Ultimate Scholar',
    description: 'Accumulate 100 hours of study time',
    icon: '👑',
    tier: 'platinum',
    check: (stats) => stats.totalMinutes >= 6000,
  },
  {
    id: 'streak_30',
    title: 'Monthly Master',
    description: 'Study for 30 consecutive days',
    icon: '🌟',
    tier: 'platinum',
    check: (stats) => stats.currentStreak >= 30,
  },
  {
    id: 'early_bird',
    title: 'Early Bird',
    description: 'Complete a session before 8 AM',
    icon: '🌅',
    tier: 'special',
    check: (stats) => stats.hasEarlyBirdSession,
  },
  {
    id: 'night_owl',
    title: 'Night Owl',
    description: 'Complete a session after 10 PM',
    icon: '🦉',
    tier: 'special',
    check: (stats) => stats.hasNightOwlSession,
  },
  {
    id: 'long_session',
    title: 'Marathon Studier',
    description: 'Complete 4 Pomodoros in a single day',
    icon: '🏃',
    tier: 'special',
    check: (stats) => stats.maxSessionsInDay >= 4,
  },
];

/** Returns the list of badge IDs that have been earned given the stats object. */
export function computeEarnedBadges(stats) {
  return BADGES.filter((b) => b.check(stats)).map((b) => b.id);
}

/** Returns the next badge(s) the user is closest to earning. */
export function getNextBadges(stats, earnedIds) {
  return BADGES.filter((b) => !earnedIds.includes(b.id)).slice(0, 3);
}
