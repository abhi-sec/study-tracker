import React from 'react';
import styles from './PomodoroTimer.module.css';
import { PHASES, PHASE_LABELS } from '../hooks/usePomodoro.js';

const PHASE_COLORS = {
  [PHASES.WORK]: '#e94560',
  [PHASES.SHORT_BREAK]: '#06d6a0',
  [PHASES.LONG_BREAK]: '#118ab2',
};

const SIZE = 220;
const STROKE = 12;
const R = (SIZE - STROKE) / 2;
const CIRC = 2 * Math.PI * R;

export default function PomodoroTimer({
  phase,
  minutes,
  seconds,
  isRunning,
  progress,
  pomodorosCompleted,
  onStart,
  onPause,
  onReset,
  onSkip,
  onSelectPhase,
  PHASE_LABELS: labels,
}) {
  const color = PHASE_COLORS[phase];
  const dashOffset = CIRC * (1 - progress);

  const pad = (n) => String(n).padStart(2, '0');

  return (
    <div className={`card ${styles.timerCard}`}>
      <div className={styles.phaseSelector}>
        {Object.values(PHASES).map((p) => (
          <button
            key={p}
            className={`${styles.phaseBtn} ${phase === p ? styles.active : ''}`}
            style={phase === p ? { borderColor: color, color } : {}}
            onClick={() => onSelectPhase(p)}
            aria-pressed={phase === p}
          >
            {PHASE_LABELS[p]}
          </button>
        ))}
      </div>

      {/* Circular progress ring */}
      <div className={styles.ringWrapper}>
        <svg width={SIZE} height={SIZE} aria-label={`${pad(minutes)}:${pad(seconds)} remaining`}>
          {/* Background track */}
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={R}
            fill="none"
            stroke="rgba(255,255,255,0.07)"
            strokeWidth={STROKE}
          />
          {/* Progress arc */}
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={R}
            fill="none"
            stroke={color}
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={CIRC}
            strokeDashoffset={dashOffset}
            transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
            style={{ transition: 'stroke-dashoffset 0.8s linear, stroke 0.3s' }}
          />
        </svg>

        <div className={styles.timeDisplay} style={{ color }}>
          <span className={styles.timeDigits}>{pad(minutes)}:{pad(seconds)}</span>
          <span className={styles.phaseLabel}>{PHASE_LABELS[phase]}</span>
        </div>
      </div>

      {/* Controls */}
      <div className={styles.controls}>
        {isRunning ? (
          <button className={`${styles.btn} ${styles.pauseBtn}`} onClick={onPause}>
            ⏸ Pause
          </button>
        ) : (
          <button className={`${styles.btn} ${styles.startBtn}`} onClick={onStart}
            style={{ background: color }}>
            ▶ {progress > 0 ? 'Resume' : 'Start'}
          </button>
        )}
        <button className={`${styles.btn} ${styles.iconBtn}`} onClick={onReset} title="Reset">
          ↺
        </button>
        <button className={`${styles.btn} ${styles.iconBtn}`} onClick={onSkip} title="Skip phase">
          ⏭
        </button>
      </div>

      {/* Pomodoro counter */}
      <div className={styles.pomodoroCount}>
        {Array.from({ length: Math.max(4, pomodorosCompleted + 1) }, (_, i) => (
          <span
            key={i}
            className={styles.tomato}
            title={i < pomodorosCompleted ? 'Completed' : 'Pending'}
          >
            {i < pomodorosCompleted ? '🍅' : '⬜'}
          </span>
        ))}
        <span className={styles.pomodoroLabel}>{pomodorosCompleted} completed</span>
      </div>
    </div>
  );
}
