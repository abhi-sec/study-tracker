import { useState, useEffect, useRef, useCallback } from 'react';

export const PHASES = {
  WORK: 'work',
  SHORT_BREAK: 'short_break',
  LONG_BREAK: 'long_break',
};

export const PHASE_DURATIONS = {
  [PHASES.WORK]: 25 * 60,        // 25 minutes
  [PHASES.SHORT_BREAK]: 5 * 60,  // 5 minutes
  [PHASES.LONG_BREAK]: 15 * 60,  // 15 minutes
};

export const PHASE_LABELS = {
  [PHASES.WORK]: 'Focus Time',
  [PHASES.SHORT_BREAK]: 'Short Break',
  [PHASES.LONG_BREAK]: 'Long Break',
};

const LONG_BREAK_INTERVAL = 4; // take a long break after every 4 work sessions

/**
 * usePomodoro — manages the Pomodoro countdown timer and phase cycling.
 *
 * @param {function} onWorkComplete - called with sessionDurationSeconds when a work phase finishes.
 * @param {object}   customDurations - optional overrides for phase durations (in seconds)
 */
export function usePomodoro(onWorkComplete, customDurations = {}) {
  const durations = { ...PHASE_DURATIONS, ...customDurations };

  const [phase, setPhase] = useState(PHASES.WORK);
  const [secondsLeft, setSecondsLeft] = useState(durations[PHASES.WORK]);
  const [isRunning, setIsRunning] = useState(false);
  const [pomodorosCompleted, setPomodorosCompleted] = useState(0);
  const [sessionStart, setSessionStart] = useState(null);

  const intervalRef = useRef(null);
  const phaseRef = useRef(phase);
  const secondsRef = useRef(secondsLeft);
  const durationsRef = useRef(durations);

  phaseRef.current = phase;
  secondsRef.current = secondsLeft;
  durationsRef.current = durations;

  const clearTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const advancePhase = useCallback((completedPomodoros) => {
    const nextPomodoros = phaseRef.current === PHASES.WORK
      ? completedPomodoros + 1
      : completedPomodoros;

    let nextPhase;
    if (phaseRef.current === PHASES.WORK) {
      nextPhase = nextPomodoros % LONG_BREAK_INTERVAL === 0
        ? PHASES.LONG_BREAK
        : PHASES.SHORT_BREAK;
    } else {
      nextPhase = PHASES.WORK;
    }

    setPhase(nextPhase);
    setSecondsLeft(durationsRef.current[nextPhase]);
    setIsRunning(false);
    return { nextPomodoros, nextPhase };
  }, []);

  useEffect(() => {
    if (!isRunning) {
      clearTimer();
      return;
    }

    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearTimer();
          // Phase complete
          if (phaseRef.current === PHASES.WORK) {
            const duration = durationsRef.current[PHASES.WORK];
            if (onWorkComplete) onWorkComplete(duration, new Date(sessionStart).toISOString());
          }
          setPomodorosCompleted((prev2) => {
            advancePhase(prev2);
            return phaseRef.current === PHASES.WORK ? prev2 + 1 : prev2;
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return clearTimer;
  }, [isRunning, advancePhase, onWorkComplete, sessionStart]);

  const start = useCallback(() => {
    if (!isRunning) {
      setSessionStart(new Date().toISOString());
      setIsRunning(true);
    }
  }, [isRunning]);

  const pause = useCallback(() => setIsRunning(false), []);

  const reset = useCallback(() => {
    clearTimer();
    setIsRunning(false);
    setSecondsLeft(durations[phase]);
    setSessionStart(null);
  }, [phase, durations]);

  const skip = useCallback(() => {
    clearTimer();
    setIsRunning(false);
    if (phase === PHASES.WORK && onWorkComplete) {
      const elapsed = durations[PHASES.WORK] - secondsLeft;
      if (elapsed > 30) {
        onWorkComplete(elapsed, sessionStart ? new Date(sessionStart).toISOString() : new Date().toISOString());
      }
    }
    setPomodorosCompleted((prev) => {
      advancePhase(prev);
      return phase === PHASES.WORK ? prev + 1 : prev;
    });
  }, [phase, durations, secondsLeft, onWorkComplete, advancePhase, sessionStart]);

  const selectPhase = useCallback((newPhase) => {
    clearTimer();
    setIsRunning(false);
    setPhase(newPhase);
    setSecondsLeft(durations[newPhase]);
    setSessionStart(null);
  }, [durations]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const progress = 1 - secondsLeft / (durations[phase] || 1);

  return {
    phase,
    minutes,
    seconds,
    secondsLeft,
    isRunning,
    pomodorosCompleted,
    progress,
    sessionStart,
    start,
    pause,
    reset,
    skip,
    selectPhase,
    PHASES,
    PHASE_LABELS,
  };
}
