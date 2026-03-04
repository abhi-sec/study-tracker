import React, { useCallback, useEffect, useState } from 'react';
import styles from './App.module.css';
import PomodoroTimer from './components/PomodoroTimer.jsx';
import StudyStats from './components/StudyStats.jsx';
import AchievementBadges from './components/AchievementBadges.jsx';
import AIAnalysis from './components/AIAnalysis.jsx';
import SessionHistory from './components/SessionHistory.jsx';
import { usePomodoro, PHASE_LABELS } from './hooks/usePomodoro.js';
import { useSessions } from './hooks/useSessions.js';
import { BADGES } from './utils/achievements.js';

const TABS = ['Timer', 'Stats', 'Badges', 'AI Insights', 'History'];

function BadgeToast({ badges, onDismiss }) {
  useEffect(() => {
    if (badges.length === 0) return;
    const t = setTimeout(onDismiss, 5000);
    return () => clearTimeout(t);
  }, [badges, onDismiss]);

  if (badges.length === 0) return null;
  const badgeMap = Object.fromEntries(BADGES.map((b) => [b.id, b]));

  return (
    <div className={styles.toastContainer} role="alert" aria-live="polite">
      {badges.map((id) => {
        const b = badgeMap[id];
        if (!b) return null;
        return (
          <div key={id} className={styles.toast}>
            <span className={styles.toastIcon}>{b.icon}</span>
            <div>
              <div className={styles.toastTitle}>Achievement Unlocked!</div>
              <div className={styles.toastName}>{b.title}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState(0);
  const { sessions, stats, earnedBadgeIds, newlyEarned, addSession, clearSessions, dismissNewBadges } =
    useSessions();

  const handleWorkComplete = useCallback(
    (durationSeconds, startTime) => {
      addSession(durationSeconds, startTime);
    },
    [addSession],
  );

  const pomodoro = usePomodoro(handleWorkComplete);

  const handleClearSessions = () => {
    if (window.confirm('Clear all session history? This cannot be undone.')) {
      clearSessions();
    }
  };

  const tabContent = [
    <PomodoroTimer
      key="timer"
      phase={pomodoro.phase}
      minutes={pomodoro.minutes}
      seconds={pomodoro.seconds}
      isRunning={pomodoro.isRunning}
      progress={pomodoro.progress}
      pomodorosCompleted={pomodoro.pomodorosCompleted}
      onStart={pomodoro.start}
      onPause={pomodoro.pause}
      onReset={pomodoro.reset}
      onSkip={pomodoro.skip}
      onSelectPhase={pomodoro.selectPhase}
      PHASE_LABELS={PHASE_LABELS}
    />,
    <div key="stats" className={styles.sectionPadded}>
      <h2 className={styles.sectionTitle}>Study Statistics</h2>
      <StudyStats stats={stats} />
    </div>,
    <AchievementBadges key="badges" earnedBadgeIds={earnedBadgeIds} newlyEarned={newlyEarned} />,
    <AIAnalysis key="ai" sessions={sessions} stats={stats} />,
    <SessionHistory key="history" sessions={sessions} onClear={handleClearSessions} />,
  ];

  return (
    <div className={styles.app}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.logo}>
          <span>🍅</span>
          <span>AI Study Tracker</span>
        </div>
        <div className={styles.headerStats}>
          <span title="Today's study time">
            📅 {Math.floor(stats.todayMinutes / 60) > 0 ? `${Math.floor(stats.todayMinutes / 60)}h ` : ''}{stats.todayMinutes % 60}m
          </span>
          <span title="Current streak">🔥 {stats.currentStreak}d</span>
        </div>
      </header>

      {/* Tab navigation */}
      <nav className={styles.tabs} role="tablist">
        {TABS.map((tab, i) => (
          <button
            key={tab}
            role="tab"
            aria-selected={activeTab === i}
            className={`${styles.tab} ${activeTab === i ? styles.activeTab : ''}`}
            onClick={() => setActiveTab(i)}
          >
            {tab}
          </button>
        ))}
      </nav>

      {/* Main content */}
      <main className={styles.main}>
        {tabContent[activeTab]}
      </main>

      {/* Badge toast notifications */}
      <BadgeToast badges={newlyEarned} onDismiss={dismissNewBadges} />
    </div>
  );
}
