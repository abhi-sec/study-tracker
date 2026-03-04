/**
 * AI-powered study pattern analysis.
 * Uses algorithmic pattern recognition to provide personalized insights
 * about study behaviour, productivity trends, and recommendations.
 */

const HOUR_LABELS = [
  '12am','1am','2am','3am','4am','5am','6am','7am',
  '8am','9am','10am','11am','12pm','1pm','2pm','3pm',
  '4pm','5pm','6pm','7pm','8pm','9pm','10pm','11pm',
];

/**
 * Compute how many minutes were studied in each hour-of-day bucket.
 * @param {Array} sessions - Array of session objects with startTime (ISO) and durationMinutes.
 * @returns {number[]} 24-element array (minutes per hour slot)
 */
function buildHourlyDistribution(sessions) {
  const dist = new Array(24).fill(0);
  sessions.forEach(({ startTime, durationMinutes }) => {
    if (!startTime || !durationMinutes) return;
    const hour = new Date(startTime).getHours();
    dist[hour] += durationMinutes;
  });
  return dist;
}

/**
 * Identify the top-N study hours from the distribution.
 */
function topStudyHours(dist, n = 3) {
  return dist
    .map((mins, hour) => ({ hour, mins }))
    .sort((a, b) => b.mins - a.mins)
    .slice(0, n)
    .filter((x) => x.mins > 0);
}

/**
 * Group sessions by day (YYYY-MM-DD) and return a sorted array of
 * { date, totalMinutes, sessions } objects covering the last N days.
 */
function buildDailyBreakdown(sessions, days = 14) {
  const map = {};
  sessions.forEach(({ startTime, durationMinutes }) => {
    if (!startTime) return;
    const d = new Date(startTime).toISOString().slice(0, 10);
    if (!map[d]) map[d] = { date: d, totalMinutes: 0, sessions: 0 };
    map[d].totalMinutes += durationMinutes || 0;
    map[d].sessions += 1;
  });

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  return Object.values(map)
    .filter((d) => new Date(d.date) >= cutoff)
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Compute a consistency score 0–100 based on how regularly the user studies
 * across the past 14 days.
 */
function computeConsistencyScore(sessions) {
  if (!sessions.length) return 0;
  const daily = buildDailyBreakdown(sessions, 14);
  const activeDays = daily.filter((d) => d.totalMinutes > 0).length;
  return Math.round((activeDays / 14) * 100);
}

/**
 * Compute trend: compare the last 7 days average vs the previous 7 days average.
 * Returns 'improving', 'declining', or 'stable'.
 */
function computeTrend(sessions) {
  const daily = buildDailyBreakdown(sessions, 14);
  if (daily.length < 3) return 'stable';

  const midpoint = Math.floor(daily.length / 2);
  const older = daily.slice(0, midpoint);
  const newer = daily.slice(midpoint);

  const avgOlder = older.reduce((s, d) => s + d.totalMinutes, 0) / (older.length || 1);
  const avgNewer = newer.reduce((s, d) => s + d.totalMinutes, 0) / (newer.length || 1);

  if (avgNewer > avgOlder * 1.1) return 'improving';
  if (avgNewer < avgOlder * 0.9) return 'declining';
  return 'stable';
}

/**
 * Generate the preferred study period of day label.
 */
function studyPeriod(topHours) {
  if (!topHours.length) return 'not enough data';
  const h = topHours[0].hour;
  if (h >= 5 && h < 12) return 'morning person';
  if (h >= 12 && h < 17) return 'afternoon studier';
  if (h >= 17 && h < 21) return 'evening learner';
  return 'night owl';
}

/**
 * Estimate when the user will hit the next milestone (in days).
 */
function estimateDaysToMilestone(totalMinutes, avgDailyMinutes, milestones) {
  const nextMilestone = milestones.find((m) => m * 60 > totalMinutes);
  if (!nextMilestone || avgDailyMinutes <= 0) return null;
  const remaining = nextMilestone * 60 - totalMinutes;
  const days = Math.ceil(remaining / avgDailyMinutes);
  return { hours: nextMilestone, days };
}

/**
 * Main AI analysis function.
 * @param {Array} sessions  - All stored sessions
 * @param {Object} stats    - Aggregated stats (totalMinutes, totalSessions, currentStreak, …)
 * @returns {Object} analysis results
 */
export function analyzeStudyPatterns(sessions, stats) {
  if (!sessions || sessions.length === 0) {
    return {
      ready: false,
      message: 'Complete at least one Pomodoro session to unlock AI insights!',
    };
  }

  const hourlyDist = buildHourlyDistribution(sessions);
  const top3Hours = topStudyHours(hourlyDist, 3);
  const consistencyScore = computeConsistencyScore(sessions);
  const trend = computeTrend(sessions);
  const period = studyPeriod(top3Hours);

  const daily = buildDailyBreakdown(sessions, 14);
  const activeDays = daily.filter((d) => d.totalMinutes > 0).length;
  const avgDailyMinutes = activeDays
    ? Math.round(daily.reduce((s, d) => s + d.totalMinutes, 0) / activeDays)
    : 0;

  const avgSessionLength = stats.totalSessions
    ? Math.round(stats.totalMinutes / stats.totalSessions)
    : 0;

  const milestoneEst = estimateDaysToMilestone(
    stats.totalMinutes,
    avgDailyMinutes,
    [1, 5, 10, 25, 50, 100],
  );

  /* Build personalized recommendations */
  const recommendations = [];

  if (consistencyScore < 40) {
    recommendations.push('📅 Try to study at least a little every day — consistency beats intensity.');
  }
  if (avgSessionLength < 20) {
    recommendations.push('⏳ Your sessions are short. Try finishing a full 25-min Pomodoro before stopping.');
  }
  if (trend === 'declining') {
    recommendations.push('📉 Your study time has dropped recently. Set a small daily goal to get back on track.');
  }
  if (trend === 'improving') {
    recommendations.push('📈 Great momentum! Your study time is trending upward — keep it up!');
  }
  if (top3Hours.length) {
    const best = HOUR_LABELS[top3Hours[0].hour];
    recommendations.push(`🕐 Your most productive hour is around ${best}. Schedule important topics then.`);
  }
  if (stats.currentStreak >= 3) {
    recommendations.push(`🔥 You're on a ${stats.currentStreak}-day streak! Don't break the chain.`);
  } else if (stats.currentStreak === 0) {
    recommendations.push('🌅 Start a new study streak today — even one session counts!');
  }
  if (stats.totalMinutes >= 60 && avgDailyMinutes < 30) {
    recommendations.push('⚡ Aim for at least 2 Pomodoros per day (50 min) to build lasting habits.');
  }
  if (recommendations.length === 0) {
    recommendations.push('✨ You\'re doing great! Maintain your study rhythm.');
  }

  return {
    ready: true,
    consistencyScore,
    trend,
    period,
    top3Hours: top3Hours.map((x) => ({ hour: x.hour, label: HOUR_LABELS[x.hour], minutes: x.mins })),
    avgDailyMinutes,
    avgSessionLength,
    milestoneEst,
    recommendations,
    dailyBreakdown: daily,
    hourlyDist,
    hourLabels: HOUR_LABELS,
  };
}
