import type { Settings, RecordingSession } from '../types';

const SETTINGS_KEY = 'diyPnshmt_settings';
const SESSIONS_KEY = 'diyPnshmt_sessions';

/** Default settings */
export const DEFAULT_SETTINGS: Settings = {
  mode: 'voice',
  // Voice detection
  threshold: 50,
  target: 100,
  initialCount: 0,
  cooldownMs: 1000,
  // Countdown
  countdownMode: 'fixed',
  countdownTotal: 60,
  countdownInterval: 1,
  // Random countdown
  randomTotalMode: 'manual',
  randomTotalManual: 60,
  randomRangeMin: 30,
  randomRangeMax: 90,
  randomFrequency: 2,
  // Voice announcement
  voiceLang: 'zh',
  selectedVoiceURI: '',
  // Sound
  soundType: 'beep',
  soundVolume: 0.5,
  // Visual
  visualEffect: 'none',
};

/** Load settings from localStorage */
export function loadSettings(): Settings {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (!stored) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

/** Save settings to localStorage */
export function saveSettings(settings: Settings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save settings:', err);
  }
}

/** Load sessions from localStorage */
export function loadSessions(): RecordingSession[] {
  try {
    const stored = localStorage.getItem(SESSIONS_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

/** Save sessions to localStorage */
export function saveSessions(sessions: RecordingSession[]): void {
  try {
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  } catch (err) {
    console.error('Failed to save sessions:', err);
  }
}

/** Save a single session */
export function saveSession(session: RecordingSession): void {
  const sessions = loadSessions();
  const index = sessions.findIndex((s) => s.id === session.id);
  if (index >= 0) {
    sessions[index] = session;
  } else {
    sessions.unshift(session);
  }
  saveSessions(sessions);
}

/** Delete a session */
export function deleteSession(id: string): void {
  const sessions = loadSessions().filter((s) => s.id !== id);
  saveSessions(sessions);
}
