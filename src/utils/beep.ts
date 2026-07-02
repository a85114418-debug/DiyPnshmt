import type { SoundType } from '../types';

let audioCtx: AudioContext | null = null;
let customBuffer: AudioBuffer | null = null;
let customLoading = false;

/** Get or create AudioContext */
function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/** Load and cache custom audio file */
async function loadCustomBuffer(ctx: AudioContext): Promise<AudioBuffer | null> {
  if (customBuffer) return customBuffer;
  if (customLoading) return null; // prevent concurrent loads
  customLoading = true;
  try {
    const res = await fetch('./audio/custom.mp3');
    if (!res.ok) return null;
    const data = await res.arrayBuffer();
    customBuffer = await ctx.decodeAudioData(data);
    return customBuffer;
  } catch {
    return null;
  } finally {
    customLoading = false;
  }
}

function playTone(
  ctx: AudioContext,
  frequency: number,
  duration: number,
  volume: number,
  delay: number = 0,
) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(frequency, ctx.currentTime + delay);
  gain.gain.setValueAtTime(volume, ctx.currentTime + delay);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime + delay);
  osc.stop(ctx.currentTime + delay + duration + 0.05);
}

function playBufferSource(ctx: AudioContext, buffer: AudioBuffer, volume: number, delay: number) {
  const source = ctx.createBufferSource();
  const gain = ctx.createGain();
  source.buffer = buffer;
  gain.gain.setValueAtTime(volume, ctx.currentTime + delay);
  source.connect(gain);
  gain.connect(ctx.destination);
  source.start(ctx.currentTime + delay);
}

/** Play count sound */
export async function playSound(type: SoundType, volume: number): Promise<void> {
  const ctx = getAudioContext();
  const vol = Math.max(0, Math.min(1, volume));

  if (type === 'custom') {
    const buffer = await loadCustomBuffer(ctx);
    if (buffer) {
      playBufferSource(ctx, buffer, vol, 0);
    }
    return;
  }

  switch (type) {
    case 'beep':
      playTone(ctx, 880, 0.12, vol);
      break;
    case 'double-beep':
      playTone(ctx, 660, 0.08, vol, 0);
      playTone(ctx, 880, 0.08, vol, 0.12);
      break;
    case 'chime':
      playTone(ctx, 523, 0.10, vol, 0);
      playTone(ctx, 659, 0.10, vol, 0.08);
      playTone(ctx, 784, 0.15, vol, 0.16);
      break;
  }
}

/** Play finish sound */
export async function playFinishSound(type: SoundType, volume: number): Promise<void> {
  const ctx = getAudioContext();
  const vol = Math.max(0, Math.min(1, volume));

  if (type === 'custom') {
    const buffer = await loadCustomBuffer(ctx);
    if (buffer) {
      playBufferSource(ctx, buffer, vol, 0);
    }
    return;
  }

  switch (type) {
    case 'beep':
      playTone(ctx, 440, 0.4, vol);
      break;
    case 'double-beep':
      playTone(ctx, 440, 0.3, vol, 0);
      playTone(ctx, 880, 0.4, vol, 0.25);
      break;
    case 'chime':
      playTone(ctx, 523, 0.2, vol, 0);
      playTone(ctx, 659, 0.2, vol, 0.15);
      playTone(ctx, 784, 0.2, vol, 0.30);
      playTone(ctx, 1047, 0.4, vol, 0.45);
      break;
  }
}

/** Close audio context */
export function closeAudioCtx(): void {
  if (audioCtx) {
    audioCtx.close();
    audioCtx = null;
  }
  customBuffer = null;
}
