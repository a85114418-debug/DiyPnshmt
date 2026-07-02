import { useRef, useState, useCallback, useEffect } from 'react';
import type { AppStatus, LogEntry, Settings } from '../types';
import { initAudio, getVolume, toDecibel, closeAudio } from '../utils/audio';
import { playSound } from '../utils/beep';

const CALIBRATE_MS = 2000;
const DISPLAY_INTERVAL = 200;

let logId = 0;
function makeLog(message: string, level: LogEntry['level'] = 'info'): LogEntry {
  return { id: String(++logId), time: Date.now(), message, level };
}

export function useAudioDetector(settings: Settings) {
  const [status, setStatus] = useState<AppStatus>('idle');
  const [count, setCount] = useState(settings.initialCount);
  const [dbLevel, setDbLevel] = useState(0);
  const [baseline, setBaseline] = useState(0);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isFlashing, setIsFlashing] = useState(false);

  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number>(0);
  const lastSampleTimeRef = useRef(0);
  const lastDisplayTimeRef = useRef(0);
  const cooldownRef = useRef(false);
  const statusRef = useRef<AppStatus>('idle');
  const countRef = useRef(settings.initialCount);
  const logsRef = useRef<LogEntry[]>([]);
  const settingsRef = useRef(settings);
  const simulatedDbRef = useRef<number | null>(null);

  settingsRef.current = settings;

  const addLog = useCallback((msg: string, level: LogEntry['level'] = 'info') => {
    const entry = makeLog(msg, level);
    logsRef.current = [...logsRef.current, entry];
    setLogs([...logsRef.current]);
  }, []);

  const calibrate = useCallback(async (): Promise<number> => {
    let analyser = analyserRef.current;
    if (!analyser) {
      try {
        analyser = await initAudio();
        analyserRef.current = analyser;
      } catch {
        addLog('校准失败：无法访问麦克风', 'error');
        return 0;
      }
    }
    addLog('开始环境噪音校准（2秒）...');
    const samples: number[] = [];
    const start = Date.now();
    while (Date.now() - start < CALIBRATE_MS) {
      samples.push(toDecibel(getVolume(analyser)));
      await new Promise((r) => setTimeout(r, 80));
    }
    const avg = samples.reduce((a, b) => a + b, 0) / samples.length;
    setBaseline(avg);
    addLog(`校准完成，环境噪音基线: ${avg.toFixed(1)} dB`);
    return avg;
  }, [addLog]);

  const tickRaf = useCallback((timestamp: number) => {
    const analyser = analyserRef.current;
    if (!analyser || statusRef.current !== 'listening') return;

    if (timestamp - lastSampleTimeRef.current < 50) {
      rafRef.current = requestAnimationFrame(tickRaf);
      return;
    }
    lastSampleTimeRef.current = timestamp;

    const rawDb = simulatedDbRef.current !== null ? simulatedDbRef.current : toDecibel(getVolume(analyser));

    if (timestamp - lastDisplayTimeRef.current >= DISPLAY_INTERVAL) {
      lastDisplayTimeRef.current = timestamp;
      setDbLevel(rawDb);
    }

    const { threshold } = settingsRef.current;
    const effectiveThreshold = threshold + baseline;

    if (!cooldownRef.current && rawDb > effectiveThreshold) {
      cooldownRef.current = true;
      countRef.current += 1;
      setCount(countRef.current);
      setIsFlashing(true);
      addLog(`触发! ${countRef.current} (音量: ${rawDb.toFixed(1)} dB)`);

      void playSound(settingsRef.current.soundType, settingsRef.current.soundVolume);

      setTimeout(() => setIsFlashing(false), 300);

      if (countRef.current >= settingsRef.current.target) {
        setStatus('finished');
        statusRef.current = 'finished';
        addLog('已达到目标计数！');
        return;
      }

      setTimeout(() => {
        cooldownRef.current = false;
      }, settingsRef.current.cooldownMs);
    }

    rafRef.current = requestAnimationFrame(tickRaf);
  }, [baseline, addLog]);

  const startListening = useCallback(async () => {
    try {
      const analyser = await initAudio();
      analyserRef.current = analyser;
      await calibrate();
      statusRef.current = 'listening';
      setStatus('listening');
      addLog('开始监听...');
      rafRef.current = requestAnimationFrame(tickRaf);
    } catch (err: any) {
      const msg = err.name === 'NotAllowedError' ? '麦克风权限被拒绝' : '麦克风不可用';
      addLog(msg, 'error');
      throw new Error(msg);
    }
  }, [calibrate, tickRaf, addLog]);

  const pause = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
    statusRef.current = 'paused';
    setStatus('paused');
    addLog('已暂停');
  }, [addLog]);

  const resume = useCallback(() => {
    statusRef.current = 'listening';
    setStatus('listening');
    addLog('继续监听...');
    rafRef.current = requestAnimationFrame(tickRaf);
  }, [tickRaf, addLog]);

  const reset = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
    cooldownRef.current = false;
    countRef.current = settingsRef.current.initialCount;
    setCount(settingsRef.current.initialCount);
    statusRef.current = 'idle';
    setStatus('idle');
    setDbLevel(0);
    setIsFlashing(false);
    closeAudio();
    analyserRef.current = null;
    addLog('已重置');
  }, [addLog]);

  const setSimulatedDb = useCallback((value: number | null) => {
    simulatedDbRef.current = value;
  }, []);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      closeAudio();
    };
  }, []);

  return {
    status,
    count,
    dbLevel,
    baseline,
    logs,
    isFlashing,
    startListening,
    pause,
    resume,
    reset,
    calibrate,
    setSimulatedDb,
  } as const;
}
