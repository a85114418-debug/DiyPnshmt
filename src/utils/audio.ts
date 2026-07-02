/**
 * Web Audio API utilities for microphone volume detection
 */

let audioContext: AudioContext | null = null;
let analyserNode: AnalyserNode | null = null;
let micStream: MediaStream | null = null;

/**
 * Initialize audio context and microphone stream
 */
export async function initAudio(): Promise<AnalyserNode> {
  if (analyserNode) return analyserNode;

  audioContext = new AudioContext();
  micStream = await navigator.mediaDevices.getUserMedia({ audio: true });

  const source = audioContext.createMediaStreamSource(micStream);
  analyserNode = audioContext.createAnalyser();
  analyserNode.fftSize = 256;
  source.connect(analyserNode);

  return analyserNode;
}

/**
 * Get current volume (RMS) from analyser
 */
export function getVolume(analyser: AnalyserNode): number {
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  analyser.getByteTimeDomainData(dataArray);

  let sum = 0;
  for (let i = 0; i < bufferLength; i++) {
    const normalized = (dataArray[i] - 128) / 128;
    sum += normalized * normalized;
  }
  const rms = Math.sqrt(sum / bufferLength);
  return rms;
}

/**
 * Convert RMS volume to decibels
 */
export function toDecibel(volume: number): number {
  if (volume === 0) return 0;
  return Math.max(0, 20 * Math.log10(volume) + 100);
}

/**
 * Close audio context and release microphone
 */
export function closeAudio(): void {
  if (micStream) {
    micStream.getTracks().forEach((track) => track.stop());
    micStream = null;
  }
  if (audioContext) {
    audioContext.close();
    audioContext = null;
  }
  analyserNode = null;
}
