import { useRef, useState, useCallback, useEffect } from 'react';
import type { AppStatus, LogEntry, Settings } from '../types';
import { playSound, playFinishSound } from '../utils/beep';

let logId = 0;
function makeLog(message: string, level: LogEntry['level'] = 'info'): LogEntry {
  return { id: String(++logId), time: Date.now(), message, level };
}

export function useCountdownTimer(settings: Settings) {
  const [status, setStatus] = useState<AppStatus>('idle');
  const [count, setCount] = useState(settings.countdownTotal);
  const [isFlashing, setIsFlashing] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const intervalRef = useRef<number | null>(null);
  const statusRef = useRef<AppStatus>('idle');
  const countRef = useRef(settings.countdownTotal);
  const logsRef = useRef<LogEntry[]>([]);
  const settingsRef = useRef(settings);

  settingsRef.current = settings;

  const addLog = useCallback((msg: string, level: LogEntry['level'] = 'info') => {
    const entry = makeLog(msg, level);
    logsRef.current = [...logsRef.current, entry];
    setLogs([...logsRef.current]);
  }, []);

  const tick = useCallback(() => {
    const s = settingsRef.current;
    const next = countRef.current - 1;
    countRef.current = next;
    setCount(next);
    setIsFlashing(true);
    addLog(`递减 → ${next}`);

    playSound(s.soundType, s.soundVolume);

    setTimeout(() => setIsFlashing(false), 300);

    if (next <= 0) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      statusRef.current = 'finished';
      setStatus('finished');
      addLog('倒计时结束！');
      playFinishSound(s.soundType, s.soundVolume);
    }
  }, [addLog]);

  const start = useCallback(() => {
    const s = settingsRef.current;
    countRef.current = s.countdownTotal;
    setCount(s.countdownTotal);
    statusRef.current = 'listening';
    setStatus('listening');
    addLog(`开始倒计时 — 从 ${s.countdownTotal} 开始，间隔 ${s.countdownInterval} 秒`);

    tick();

    const ms = Math.max(100, s.countdownInterval * 1000);
    intervalRef.current = window.setInterval(tick, ms);
  }, [tick, addLog]);

  const pause = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    statusRef.current = 'paused';
    setStatus('paused');
    addLog('已暂停');
  }, [addLog]);

  const resume = useCallback(() => {
    const s = settingsRef.current;
    statusRef.current = 'listening';
    setStatus('listening');
    addLog('继续倒计时...');
    const ms = Math.max(100, s.countdownInterval * 1000);
    intervalRef.current = window.setInterval(tick, ms);
  }, [tick, addLog]);

  const reset = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    const s = settingsRef.current;
    countRef.current = s.countdownTotal;
    setCount(s.countdownTotal);
    setStatus('idle');
    statusRef.current = 'idle';
    setIsFlashing(false);
    addLog('已重置');
  }, [addLog]);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return {
    status,
    count,
    total: settings.countdownTotal,
    isFlashing,
    logs,
    start,
    pause,
    resume,
    reset,
  } as const;
}
