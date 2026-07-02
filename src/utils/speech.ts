/**
 * Web Speech API utilities for voice announcement
 */

import type { VoiceLang } from '../types';

/**
 * Get available voices filtered by language
 */
export function getVoicesByLang(lang: VoiceLang): SpeechSynthesisVoice[] {
  const voices = window.speechSynthesis.getVoices();
  const prefix = lang === 'zh' ? 'zh' : 'en';
  return voices.filter((v) => v.lang.startsWith(prefix));
}

/**
 * Get voice by URI
 */
export function getVoiceByURI(uri: string): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  return voices.find((v) => v.voiceURI === uri) || null;
}

/**
 * Speak a number
 */
export function speakNumber(
  num: number,
  lang: VoiceLang,
  voiceURI: string,
): void {
  const text = num.toString();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang === 'zh' ? 'zh-CN' : 'en-US';
  utterance.rate = 1.0;
  utterance.pitch = 1.0;

  // Try to use selected voice
  if (voiceURI) {
    const voice = getVoiceByURI(voiceURI);
    if (voice) {
      utterance.voice = voice;
    }
  }

  // Fallback: use first available voice for the language
  if (!utterance.voice) {
    const voices = getVoicesByLang(lang);
    if (voices.length > 0) {
      utterance.voice = voices[0];
    }
  }

  window.speechSynthesis.cancel(); // Cancel any ongoing speech
  window.speechSynthesis.speak(utterance);
}

/**
 * Stop any ongoing speech
 */
export function stopSpeech(): void {
  window.speechSynthesis.cancel();
}
