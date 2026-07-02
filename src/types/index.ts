/** Application status */
export type AppStatus = 'idle' | 'listening' | 'paused' | 'finished';

/** Application mode */
export type AppMode = 'voice' | 'countdown' | 'announce';

/** Countdown sub-mode */
export type CountdownMode = 'fixed' | 'random';

/** Sound type */
export type SoundType = 'beep' | 'double-beep' | 'chime';

/** Visual effect type */
export type VisualEffect = 'none' | 'snow' | 'sakura' | 'rain';

/** Voice language */
export type VoiceLang = 'zh' | 'en';

/** User settings */
export interface Settings {
  mode: AppMode;
  // Voice detection
  threshold: number;      // 0-100 dB
  target: number;         // 1-9999
  initialCount: number;   // 0-9998
  cooldownMs: number;     // 200-5000
  // Countdown
  countdownMode: CountdownMode;
  countdownTotal: number;
  countdownInterval: number;
  // Random countdown
  randomTotalMode: 'manual' | 'range';
  randomTotalManual: number;
  randomRangeMin: number;
  randomRangeMax: number;
  randomFrequency: number;
  // Voice announcement
  voiceLang: VoiceLang;
  selectedVoiceURI: string;
  // Sound
  soundType: SoundType;
  soundVolume: number;    // 0-1
  // Visual
  visualEffect: VisualEffect;
}

/** Recording session */
export interface RecordingSession {
  id: string;
  name: string;
  startedAt: number;
  endedAt: number | null;
  positiveCount: number;
  countdownCount: number;
  totalCount: number;
  modesUsed: AppMode[];
}

/** Debug log entry */
export interface LogEntry {
  id: string;
  time: number;
  message: string;
  level: 'info' | 'warn' | 'error';
}
