import { useRef, useState, useCallback, useEffect } from 'react';
import type { AppStatus, LogEntry, Settings } from '../types';
import { playSound, playFinishSound } from '../utils/beep';

let logId = 0;
function makeLog(message: string, level: LogEntry['level'] = 'info'): LogEntry {
  return { id: String(++logId), time: Date.now(), message, level };
}

export function useRandomCountdown(settings: Settings) {
  const [status, setStatus] = useState<AppStatus>('idle');
  const [count, setCount] = useState(0);
  const [total, setTotal] = useState(0);
  const [isFlashing, setIsFlashing] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const timeoutRef = useRef<number | null>(null);
  const statusRef = useRef<AppStatus>('idle');
  const countRef = useRef(0);
  const totalRef = useRef(0);
  const logsRef = useRef<LogEntry[]>([]);
  const settingsRef = useRef(settings);

  settingsRef.current = settings;

  const addLog = useCallback((msg: string, level: LogEntry['level'] = 'info') => {
    const entry = makeLog(msg, level);
    logsRef.current = [...logsRef.current, entry];
    setLogs([...logsRef.current]);
  }, []);

  const scheduleNext = useCallback(() => {
    const s = settingsRef.current;
    const baseMs = s.randomFrequency * 1000;
    const variance = baseMs * 0.5;
    const randomMs = baseMs + (Math.random() * 2 - 1) * variance;
    const ms = Math.max(100, randomMs);

    timeoutRef.current = window.setTimeout(() => {
      const next = countRef.current - 1;
      countRef.current = next;
      setCount(next);
      setIsFlashing(true);
      addLog(`递减 → ${next}`);

      playSound(s.soundType, s.soundVolume);

      setTimeout(() => setIsFlashing(false), 300);

      if (next <= 0) {
        statusRef.current = 'finished';
        setStatus('finished');
        addLog('随机倒计时结束！');
        playFinishSound(s.soundType, s.soundVolume);
      } else {
        scheduleNext();
      }
    }, ms);
  }, [addLog]);

  const start = useCallback(() => {
    const s = settingsRef.current;

    // Determine total
    let initialTotal: number;
    if (s.randomTotalMode === 'manual') {
      initialTotal = s.randomTotalManual;
    } else {
      const min = s.randomRangeMin;
      const max = s.randomRangeMax;
      initialTotal = Math.floor(Math.random() * (max - min + 1)) + min;
    }

    totalRef.current = initialTotal;
    countRef.current = initialTotal;
    setTotal(initialTotal);
    setCount(initialTotal);
    statusRef.current = 'listening';
    setStatus('listening');
    addLog(`开始随机倒计时 — 总数 ${initialTotal}，基础频率 ${s.randomFrequency} 秒 (±50%)`);

    scheduleNext();
  }, [scheduleNext, addLog]);

  const pause = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    statusRef.current = 'paused';
    setStatus('paused');
    addLog('已暂停');
  }, [addLog]);

  const resume = useCallback(() => {
    statusRef.current = 'listening';
    setStatus('listening');
    addLog('继续随机倒计时...');
    scheduleNext();
  }, [scheduleNext, addLog]);

  const reset = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    countRef.current = 0;
    totalRef.current = 0;
    setCount(0);
    setTotal(0);
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
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return {
    status,
    count,
    total,
    isFlashing,
    logs,
    start,
    pause,
    resume,
    reset,
  } as const;
}
