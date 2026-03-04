import React from 'react';
import styles from './StudyStats.module.css';

function fmt(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

const STAT_CARDS = [
  { key: 'todayMinutes', label: "Today's Study", icon: '📅', color: '#06d6a0', format: fmt },
  { key: 'totalMinutes', label: 'Total Time', icon: '⏱️', color: '#118ab2', format: fmt },
  { key: 'totalSessions', label: 'Sessions', icon: '🍅', color: '#e94560', format: (v) => v },
  {
    key: 'longestSessionMinutes',
    label: 'Longest Session',
    icon: '🏆',
    color: '#ffd166',
    format: fmt,
  },
  { key: 'currentStreak', label: 'Day Streak', icon: '🔥', color: '#ff6b6b', format: (v) => `${v}d` },
];

export default function StudyStats({ stats }) {
  return (
    <div className={styles.grid}>
      {STAT_CARDS.map(({ key, label, icon, color, format }) => (
        <div key={key} className={`card ${styles.statCard}`}>
          <div className={styles.icon} style={{ color }}>{icon}</div>
          <div className={styles.value} style={{ color }}>{format(stats[key] ?? 0)}</div>
          <div className={styles.label}>{label}</div>
        </div>
      ))}
    </div>
  );
}
