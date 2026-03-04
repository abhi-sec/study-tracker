import React from 'react';
import styles from './SessionHistory.module.css';

function fmt(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s}s`;
  return s === 0 ? `${m}m` : `${m}m ${s}s`;
}

function fmtTime(isoString) {
  if (!isoString) return '';
  const d = new Date(isoString);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function fmtDate(isoString) {
  if (!isoString) return '';
  const d = new Date(isoString);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return 'Today';
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export default function SessionHistory({ sessions, onClear }) {
  if (!sessions.length) {
    return (
      <div className={`card ${styles.empty}`}>
        <span className={styles.emptyIcon}>📋</span>
        <p>No sessions yet. Start your first Pomodoro!</p>
      </div>
    );
  }

  // Show newest first
  const sorted = [...sessions].reverse();

  return (
    <div className={`card ${styles.container}`}>
      <div className={styles.header}>
        <h3>Session History</h3>
        <button className={styles.clearBtn} onClick={onClear} title="Clear all sessions">
          🗑 Clear
        </button>
      </div>
      <ul className={styles.list}>
        {sorted.slice(0, 20).map((s, i) => (
          <li key={s.id || i} className={styles.item}>
            <span className={styles.tomato}>🍅</span>
            <div className={styles.info}>
              <span className={styles.duration}>{fmt(s.durationSeconds)}</span>
              <span className={styles.time}>{fmtDate(s.startTime)} · {fmtTime(s.startTime)}</span>
            </div>
            <span className={styles.mins}>{Math.round(s.durationSeconds / 60)}m</span>
          </li>
        ))}
        {sessions.length > 20 && (
          <li className={styles.more}>+{sessions.length - 20} more sessions</li>
        )}
      </ul>
    </div>
  );
}
