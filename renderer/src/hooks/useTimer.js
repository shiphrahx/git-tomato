import { useState, useEffect, useCallback } from 'react';

const FOCUS_SECONDS = 25 * 60;

export function useTimer() {
  const [timeLeft, setTimeLeft] = useState(FOCUS_SECONDS);
  const [status, setStatus] = useState('idle');   // 'idle' | 'running' | 'paused'
  const [type, setType] = useState('focus');      // 'focus' | 'break'

  // Sync with main process state on mount
  useEffect(() => {
    if (!window.electronAPI) return;
    window.electronAPI.getTimerState().then(state => {
      if (!state) return;
      setTimeLeft(state.timeLeft);
      setStatus(state.status);
      setType(state.type);
    });
  }, []);

  // Subscribe to tick events from main process
  useEffect(() => {
    if (!window.electronAPI) return;
    const cleanup = window.electronAPI.onTimerTick(({ timeLeft, status, type }) => {
      setTimeLeft(timeLeft);
      setStatus(status);
      setType(type);
    });
    return cleanup;
  }, []);

  const start = useCallback(() => window.electronAPI?.timerStart(), []);
  const pause = useCallback(() => window.electronAPI?.timerPause(), []);
  const reset = useCallback(() => window.electronAPI?.timerReset(), []);

  return { timeLeft, status, type, start, pause, reset };
}
