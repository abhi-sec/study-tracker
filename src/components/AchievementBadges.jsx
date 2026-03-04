import React from 'react';
import styles from './AchievementBadges.module.css';
import { BADGES } from '../utils/achievements.js';

const TIER_COLORS = {
  bronze: '#cd7f32',
  silver: '#c0c0c0',
  gold: '#ffd700',
  platinum: '#e5e4e2',
  special: '#b44fe8',
};

export default function AchievementBadges({ earnedBadgeIds, newlyEarned = [] }) {
  const earned = new Set(earnedBadgeIds);
  const earnedCount = earnedBadgeIds.length;
  const total = BADGES.length;

  return (
    <div className={`card ${styles.container}`}>
      <div className={styles.header}>
        <h3>Achievements</h3>
        <span className={styles.progress}>{earnedCount}/{total}</span>
      </div>

      <div className={styles.progressBar}>
        <div
          className={styles.progressFill}
          style={{ width: `${(earnedCount / total) * 100}%` }}
        />
      </div>

      <div className={styles.grid}>
        {BADGES.map((badge) => {
          const isEarned = earned.has(badge.id);
          const isNew = newlyEarned.includes(badge.id);
          const tierColor = TIER_COLORS[badge.tier];

          return (
            <div
              key={badge.id}
              className={`${styles.badge} ${isEarned ? styles.earned : styles.locked} ${isNew ? styles.newBadge : ''}`}
              style={isEarned ? { borderColor: tierColor } : {}}
              title={`${badge.title}: ${badge.description}`}
              aria-label={`${badge.title}${isEarned ? ' (earned)' : ' (locked)'}`}
            >
              <span className={styles.badgeIcon}>{isEarned ? badge.icon : '🔒'}</span>
              <span
                className={styles.badgeName}
                style={isEarned ? { color: tierColor } : {}}
              >
                {badge.title}
              </span>
              {isNew && <span className={styles.newTag}>NEW!</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
