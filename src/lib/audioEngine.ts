// audioEngine.ts — Web Audio API sound synthesis, no external files needed

export interface SoundDef {
  id: string;
  emoji: string;
  label: string;
  color: "blue" | "red" | "yellow" | "green" | "orange" | "purple";
}

export const SOUNDS: SoundDef[] = [
  { id: "drum_roll",    emoji: "🥁", label: "DRUM ROLL",    color: "blue" },
  { id: "air_horn",     emoji: "📯", label: "AIR HORN",     color: "red" },
  { id: "fanfare",      emoji: "🎉", label: "FANFARE",      color: "yellow" },
  { id: "buzzer",       emoji: "❌", label: "BUZZER",       color: "red" },
  { id: "applause",     emoji: "👏", label: "APPLAUSE",     color: "green" },
  { id: "ding",         emoji: "🔔", label: "DING",         color: "yellow" },
  { id: "sad_trombone", emoji: "😂", label: "SAD TROMBONE", color: "orange" },
  { id: "siren",        emoji: "🚨", label: "SIREN",        color: "red" },
  { id: "tick_tock",    emoji: "⏰", label: "TICK TOCK",    color: "blue" },
  { id: "shuffle",      emoji: "🎲", label: "SHUFFLE",      color: "green" },
  { id: "shhhh",        emoji: "🤫", label: "SHHHH",        color: "purple" },
  { id: "lets_go",      emoji: "🎵", label: "LET'S GO",     color: "green" },
];

// Lazy AudioContext — created on first user gesture
let _ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!_ctx) {
    _ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (_ctx.state === "suspended") {
    _ctx.resume();
  }
  return _ctx;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeNoiseBuffer(ctx: AudioContext, durationSec: number): AudioBuffer {
  const sampleRate = ctx.sampleRate;
  const length = Math.floor(sampleRate * durationSec);
  const buffer = ctx.createBuffer(1, length, sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

// ── Sound synthesizers ────────────────────────────────────────────────────────

function playDrumRoll(ctx: AudioContext, t: number) {
  const duration = 1.5;
  // White noise through bandpass
  const noiseBuffer = makeNoiseBuffer(ctx, duration + 0.1);
  const source = ctx.createBufferSource();
  source.buffer = noiseBuffer;

  const bandpass = ctx.createBiquadFilter();
  bandpass.type = "bandpass";
  bandpass.frequency.value = 2000;
  bandpass.Q.value = 1.5;

  // Amplitude modulation (tremolo) at ~20Hz via gain oscillator
  const tremoloGain = ctx.createGain();
  tremoloGain.gain.value = 0;

  const tremoloOsc = ctx.createOscillator();
  tremoloOsc.type = "sine";
  tremoloOsc.frequency.value = 20;
  const tremoloDepth = ctx.createGain();
  tremoloDepth.gain.value = 0.6;
  tremoloOsc.connect(tremoloDepth);
  tremoloDepth.connect(tremoloGain.gain);

  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(0.6, t);
  masterGain.gain.linearRampToValueAtTime(0, t + duration);

  source.connect(bandpass);
  bandpass.connect(tremoloGain);
  tremoloGain.connect(masterGain);
  masterGain.connect(ctx.destination);

  tremoloOsc.start(t);
  tremoloOsc.stop(t + duration);
  source.start(t);
  source.stop(t + duration);
}

function playAirHorn(ctx: AudioContext, t: number) {
  const duration = 2.0;

  [220, 218].forEach((freq) => {
    const osc = ctx.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.value = freq;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.35, t + 0.02); // sharp attack
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + duration);
  });
}

function playFanfare(ctx: AudioContext, t: number) {
  const notes = [523, 659, 784, 1047];
  notes.forEach((freq, i) => {
    const start = t + i * 0.1;
    const osc = ctx.createOscillator();
    osc.type = "square";
    osc.frequency.value = freq;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.2, start);
    gain.gain.setValueAtTime(0, start + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + 0.15);
  });
}

function playBuzzer(ctx: AudioContext, t: number) {
  const duration = 0.6;
  const osc = ctx.createOscillator();
  osc.type = "square";
  osc.frequency.setValueAtTime(300, t);
  osc.frequency.exponentialRampToValueAtTime(80, t + duration);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.3, t);
  gain.gain.linearRampToValueAtTime(0, t + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(t);
  osc.stop(t + duration);
}

function playApplause(ctx: AudioContext, t: number) {
  const duration = 2.5;
  const noiseBuffer = makeNoiseBuffer(ctx, duration + 0.1);
  const source = ctx.createBufferSource();
  source.buffer = noiseBuffer;

  const bandpass = ctx.createBiquadFilter();
  bandpass.type = "bandpass";
  bandpass.frequency.value = 1200;
  bandpass.Q.value = 0.5;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(0.5, t + 0.3); // fade in
  gain.gain.linearRampToValueAtTime(0.5, t + duration - 0.5);
  gain.gain.linearRampToValueAtTime(0, t + duration); // fade out

  source.connect(bandpass);
  bandpass.connect(gain);
  gain.connect(ctx.destination);
  source.start(t);
  source.stop(t + duration);
}

function playDing(ctx: AudioContext, t: number) {
  const osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.value = 1046;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.8, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 1.2);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 1.2);
}

function playSadTrombone(ctx: AudioContext, t: number) {
  const notes = [392, 349, 330, 247]; // G4, F4, E4, B3
  notes.forEach((freq, i) => {
    const start = t + i * 0.4;
    const osc = ctx.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.value = freq;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.25, start);
    gain.gain.linearRampToValueAtTime(0, start + 0.38);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + 0.4);
  });
}

function playSiren(ctx: AudioContext, t: number) {
  const osc = ctx.createOscillator();
  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(500, t);
  osc.frequency.linearRampToValueAtTime(900, t + 0.4);
  osc.frequency.linearRampToValueAtTime(500, t + 0.8);
  osc.frequency.linearRampToValueAtTime(900, t + 1.2);
  osc.frequency.linearRampToValueAtTime(500, t + 1.6);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.3, t);
  gain.gain.linearRampToValueAtTime(0, t + 1.6);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 1.6);
}

function playTickTock(ctx: AudioContext, t: number) {
  const freqs = [800, 600]; // alternating tick/tock
  for (let i = 0; i < 6; i++) {
    const start = t + i * 0.3;
    const freq = freqs[i % 2];
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = freq;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.4, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + 0.05);
  }
}

function playShuffle(ctx: AudioContext, t: number) {
  const duration = 0.3;
  const noiseBuffer = makeNoiseBuffer(ctx, duration + 0.05);
  const source = ctx.createBufferSource();
  source.buffer = noiseBuffer;

  const highpass = ctx.createBiquadFilter();
  highpass.type = "highpass";
  highpass.frequency.value = 3000;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.5, t);
  gain.gain.linearRampToValueAtTime(0, t + duration);

  source.connect(highpass);
  highpass.connect(gain);
  gain.connect(ctx.destination);
  source.start(t);
  source.stop(t + duration);
}

function playShhhh(ctx: AudioContext, t: number) {
  const duration = 1.0;
  const noiseBuffer = makeNoiseBuffer(ctx, duration + 0.05);
  const source = ctx.createBufferSource();
  source.buffer = noiseBuffer;

  const lowpass = ctx.createBiquadFilter();
  lowpass.type = "lowpass";
  lowpass.frequency.value = 2000;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.5, t);
  gain.gain.linearRampToValueAtTime(0, t + duration);

  source.connect(lowpass);
  lowpass.connect(gain);
  gain.connect(ctx.destination);
  source.start(t);
  source.stop(t + duration);
}

function playLetsGo(ctx: AudioContext, t: number) {
  const notes = [262, 330, 392, 523, 659]; // C-E-G-C-E
  notes.forEach((freq, i) => {
    const start = t + i * 0.08;
    const osc = ctx.createOscillator();
    osc.type = "square";
    osc.frequency.value = freq;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.2, start);
    gain.gain.setValueAtTime(0, start + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + 0.15);
  });
}

// ── Public API ────────────────────────────────────────────────────────────────

export function playSound(id: string): void {
  try {
    const ctx = getCtx();
    const t = ctx.currentTime;

    switch (id) {
      case "drum_roll":    playDrumRoll(ctx, t);    break;
      case "air_horn":     playAirHorn(ctx, t);     break;
      case "fanfare":      playFanfare(ctx, t);     break;
      case "buzzer":       playBuzzer(ctx, t);      break;
      case "applause":     playApplause(ctx, t);    break;
      case "ding":         playDing(ctx, t);        break;
      case "sad_trombone": playSadTrombone(ctx, t); break;
      case "siren":        playSiren(ctx, t);       break;
      case "tick_tock":    playTickTock(ctx, t);    break;
      case "shuffle":      playShuffle(ctx, t);     break;
      case "shhhh":        playShhhh(ctx, t);       break;
      case "lets_go":      playLetsGo(ctx, t);      break;
      default:
        console.warn(`[audioEngine] Unknown sound: ${id}`);
    }
  } catch (err) {
    console.error("[audioEngine] playSound error:", err);
  }
}
