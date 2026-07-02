import type { Settings } from '../types';

const SETTINGS_KEY = 'diyPnshmt_settings';

/** Default settings */
export const DEFAULT_SETTINGS: Settings = {
  mode: 'voice',
  threshold: 50,
  target: 100,
  initialCount: 0,
  cooldownMs: 1000,
  countdownMode: 'fixed',
  countdownTotal: 60,
  countdownInterval: 1,
  randomTotalMode: 'manual',
  randomTotalManual: 60,
  randomRangeMin: 30,
  randomRangeMax: 90,
  randomFrequency: 2,
  soundType: 'beep',
  soundVolume: 0.5,
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
