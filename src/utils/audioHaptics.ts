/**
 * Offline Audio & Haptic Feedback Engine for STEMMate
 * Synthesizes accessible, low-latency audio tones using the Web Audio API (zero network requests, 100% offline).
 * Respects user preferences and device capabilities.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export type FeedbackTone = 'success' | 'alert' | 'tick' | 'syncing';

export function playFeedbackTone(type: FeedbackTone, soundEnabled: boolean = true) {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'success') {
      // Harmonic 2-tone chime: C5 (523Hz) -> E5 (659Hz)
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.12);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.36);
    } else if (type === 'alert') {
      // Subtle warning tone: 330Hz -> 261Hz
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(329.63, now);
      osc.frequency.exponentialRampToValueAtTime(261.63, now + 0.15);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.31);
    } else if (type === 'tick') {
      // 15ms subtle mechanical tactile click
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.02);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
      osc.start(now);
      osc.stop(now + 0.035);
    } else if (type === 'syncing') {
      // Gentle pulse tone
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.16);
    }
  } catch {
    // Graceful fallback if audio context blocked by browser autoplay policy
  }
}

export function triggerHapticFeedback(pattern: number | number[] = 15, hapticsEnabled: boolean = true) {
  if (!hapticsEnabled || typeof navigator === 'undefined' || !('vibrate' in navigator)) return;
  try {
    navigator.vibrate(pattern);
  } catch {
    // Ignore if vibration permissions not granted
  }
}

export function notifyAction(type: FeedbackTone, soundEnabled: boolean = true, hapticsEnabled: boolean = true) {
  playFeedbackTone(type, soundEnabled);
  if (type === 'success') {
    triggerHapticFeedback([40, 50, 40], hapticsEnabled);
  } else if (type === 'alert') {
    triggerHapticFeedback([80, 40, 80], hapticsEnabled);
  } else {
    triggerHapticFeedback(15, hapticsEnabled);
  }
}
