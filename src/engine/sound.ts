/**
 * Synthesised sound effects. No audio files, no microphone. Off by default; the player turns it on in Settings
 * or the header. Browsers only allow audio after a user gesture, which every call site is.
 */
let ctx: AudioContext | null = null;
let enabled = false;

export function setSoundEnabled(on: boolean) {
  enabled = on;
}

function ac(): AudioContext | null {
  if (!enabled) return null;
  try {
    if (!ctx) {
      const C = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!C) return null;
      ctx = new C();
    }
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(freq: number, start: number, dur: number, type: OscillatorType = 'sine', gain = 0.08) {
  const c = ac();
  if (!c) return;
  const t0 = c.currentTime + start;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t0);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g).connect(c.destination);
  o.start(t0);
  o.stop(t0 + dur + 0.02);
}

export const sfx = {
  correct() {
    tone(660, 0, 0.12, 'triangle');
    tone(990, 0.07, 0.16, 'triangle');
  },
  combo(level: number) {
    const base = 660 * Math.pow(1.122, Math.min(level, 8));
    tone(base, 0, 0.1, 'triangle');
    tone(base * 1.5, 0.06, 0.14, 'triangle');
  },
  wrong() {
    tone(196, 0, 0.18, 'sawtooth', 0.04);
  },
  tap() {
    tone(880, 0, 0.04, 'sine', 0.035);
  },
  tick() {
    tone(1320, 0, 0.03, 'square', 0.02);
  },
  complete() {
    [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.09, 0.22, 'triangle', 0.07));
  },
};
