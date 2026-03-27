// audioEngine.ts — Web Audio API sound synthesis, no external files needed

export interface SoundDef {
  id: string;
  emoji: string;
  label: string;
  color: "blue" | "red" | "yellow" | "green" | "orange" | "purple";
}

export const SOUNDS: SoundDef[] = [
  // Original 12
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
  // 18 new sounds
  { id: "winner",    emoji: "🏆", label: "WINNER",      color: "yellow" },
  { id: "jackpot",   emoji: "💰", label: "JACKPOT",     color: "yellow" },
  { id: "party",     emoji: "🎊", label: "PARTY",       color: "yellow" },
  { id: "laugh",     emoji: "🤣", label: "LAUGH",       color: "orange" },
  { id: "gasp",      emoji: "😱", label: "GASP",        color: "blue"   },
  { id: "zap",       emoji: "⚡", label: "ZAP",         color: "yellow" },
  { id: "boom",      emoji: "💥", label: "BOOM",        color: "red"    },
  { id: "launch",    emoji: "🚀", label: "LAUNCH",      color: "blue"   },
  { id: "bullseye",  emoji: "🎯", label: "BULL'S-EYE",  color: "green"  },
  { id: "dramatic",  emoji: "🎭", label: "DRAMATIC",    color: "red"    },
  { id: "spooky",    emoji: "👻", label: "SPOOKY",      color: "purple" },
  { id: "riff",      emoji: "🎸", label: "GUITAR RIFF", color: "orange" },
  { id: "sparkle",   emoji: "✨", label: "SPARKLE",     color: "yellow" },
  { id: "silly",     emoji: "🎪", label: "SILLY",       color: "orange" },
  { id: "wow",       emoji: "🌟", label: "WOW",         color: "blue"   },
  { id: "charge",    emoji: "🎺", label: "CHARGE",      color: "yellow" },
  { id: "countdown", emoji: "⏳", label: "COUNTDOWN",   color: "red"    },
  { id: "mic_drop",  emoji: "🎤", label: "MIC DROP",    color: "purple" },
];

// Lazy AudioContext — created on first user gesture
let _ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!_ctx) {
    _ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
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

// ── Original sound synthesizers ───────────────────────────────────────────────

function playDrumRoll(ctx: AudioContext, t: number) {
  const duration = 1.5;
  const noiseBuffer = makeNoiseBuffer(ctx, duration + 0.1);
  const source = ctx.createBufferSource();
  source.buffer = noiseBuffer;

  const bandpass = ctx.createBiquadFilter();
  bandpass.type = "bandpass";
  bandpass.frequency.value = 2000;
  bandpass.Q.value = 1.5;

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
    gain.gain.linearRampToValueAtTime(0.35, t + 0.02);
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
  gain.gain.linearRampToValueAtTime(0.5, t + 0.3);
  gain.gain.linearRampToValueAtTime(0.5, t + duration - 0.5);
  gain.gain.linearRampToValueAtTime(0, t + duration);

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
  const notes = [392, 349, 330, 247];
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
  const freqs = [800, 600];
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
  const notes = [262, 330, 392, 523, 659];
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

// ── New sound synthesizers ────────────────────────────────────────────────────

function playWinner(ctx: AudioContext, t: number) {
  // Triumphant ascending C-E-G-C arpeggio with held final chord (sine+square blend)
  const arpNotes = [262, 330, 392, 523]; // C4-E4-G4-C5
  arpNotes.forEach((freq, i) => {
    const start = t + i * 0.12;
    ["sine", "square"].forEach((type, j) => {
      const osc = ctx.createOscillator();
      osc.type = type as OscillatorType;
      osc.frequency.value = freq;

      const gain = ctx.createGain();
      const vol = j === 0 ? 0.3 : 0.1;
      gain.gain.setValueAtTime(vol, start);
      if (i === arpNotes.length - 1) {
        // hold last note
        gain.gain.setValueAtTime(vol, start + 0.1);
        gain.gain.linearRampToValueAtTime(0, start + 0.8);
      } else {
        gain.gain.linearRampToValueAtTime(0, start + 0.15);
      }
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + (i === arpNotes.length - 1 ? 0.85 : 0.2));
    });
  });
}

function playJackpot(ctx: AudioContext, t: number) {
  // 8 rapid high-freq sine plinks (1200-2400Hz random) over 600ms
  for (let i = 0; i < 8; i++) {
    const start = t + i * 0.075;
    const freq = 1200 + Math.random() * 1200;
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = freq;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.3, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.07);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + 0.08);
  }
}

function playParty(ctx: AudioContext, t: number) {
  // Fast fanfare: C-E-G-C-E (262,330,392,523,659) at 60ms apart, square wave
  const notes = [262, 330, 392, 523, 659];
  notes.forEach((freq, i) => {
    const start = t + i * 0.06;
    const osc = ctx.createOscillator();
    osc.type = "square";
    osc.frequency.value = freq;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.15, start);
    gain.gain.setValueAtTime(0, start + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + 0.09);
  });
}

function playLaugh(ctx: AudioContext, t: number) {
  // 5 noise bursts with bandpass ~800Hz, 200ms apart, descending amplitude
  for (let i = 0; i < 5; i++) {
    const start = t + i * 0.2;
    const amp = 0.5 * Math.pow(0.75, i);
    const dur = 0.12;
    const buf = makeNoiseBuffer(ctx, dur + 0.02);
    const source = ctx.createBufferSource();
    source.buffer = buf;

    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 800;
    bp.Q.value = 2;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(amp, start);
    gain.gain.linearRampToValueAtTime(0, start + dur);

    source.connect(bp);
    bp.connect(gain);
    gain.connect(ctx.destination);
    source.start(start);
    source.stop(start + dur + 0.02);
  }
}

function playGasp(ctx: AudioContext, t: number) {
  // Filtered noise sweep from highpass 4000Hz down to 500Hz over 400ms
  const duration = 0.4;
  const buf = makeNoiseBuffer(ctx, duration + 0.05);
  const source = ctx.createBufferSource();
  source.buffer = buf;

  const hp = ctx.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.setValueAtTime(4000, t);
  hp.frequency.linearRampToValueAtTime(500, t + duration);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(0.5, t + 0.05);
  gain.gain.linearRampToValueAtTime(0, t + duration);

  source.connect(hp);
  hp.connect(gain);
  gain.connect(ctx.destination);
  source.start(t);
  source.stop(t + duration + 0.05);
}

function playZap(ctx: AudioContext, t: number) {
  // Sawtooth sweep 2000Hz→200Hz over 200ms, with distortion (WaveShaper)
  const duration = 0.2;
  const osc = ctx.createOscillator();
  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(2000, t);
  osc.frequency.exponentialRampToValueAtTime(200, t + duration);

  // Simple wave shaper for distortion
  const ws = ctx.createWaveShaper();
  const curve = new Float32Array(256);
  for (let i = 0; i < 256; i++) {
    const x = (i * 2) / 256 - 1;
    curve[i] = (Math.PI + 300) * x / (Math.PI + 300 * Math.abs(x));
  }
  ws.curve = curve;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.3, t);
  gain.gain.linearRampToValueAtTime(0, t + duration);

  osc.connect(ws);
  ws.connect(gain);
  gain.connect(ctx.destination);
  osc.start(t);
  osc.stop(t + duration + 0.02);
}

function playBoom(ctx: AudioContext, t: number) {
  // Low freq sine 60Hz, short attack, 800ms decay; plus noise burst
  const duration = 0.8;
  const osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.value = 60;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(0.7, t + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(t);
  osc.stop(t + duration);

  // Noise burst
  const noiseDur = 0.15;
  const buf = makeNoiseBuffer(ctx, noiseDur + 0.02);
  const src = ctx.createBufferSource();
  src.buffer = buf;

  const lp = ctx.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 300;

  const nGain = ctx.createGain();
  nGain.gain.setValueAtTime(0.5, t);
  nGain.gain.linearRampToValueAtTime(0, t + noiseDur);

  src.connect(lp);
  lp.connect(nGain);
  nGain.connect(ctx.destination);
  src.start(t);
  src.stop(t + noiseDur + 0.02);
}

function playLaunch(ctx: AudioContext, t: number) {
  // 3 countdown beeps (C5 at 200ms apart) then ascending noise sweep
  const beepFreq = 523; // C5
  for (let i = 0; i < 3; i++) {
    const start = t + i * 0.2;
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = beepFreq;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.3, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.1);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + 0.12);
  }

  // Ascending noise sweep
  const sweepStart = t + 0.6;
  const sweepDur = 0.5;
  const buf = makeNoiseBuffer(ctx, sweepDur + 0.05);
  const src = ctx.createBufferSource();
  src.buffer = buf;

  const hp = ctx.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.setValueAtTime(200, sweepStart);
  hp.frequency.linearRampToValueAtTime(4000, sweepStart + sweepDur);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.3, sweepStart);
  gain.gain.linearRampToValueAtTime(0, sweepStart + sweepDur);

  src.connect(hp);
  hp.connect(gain);
  gain.connect(ctx.destination);
  src.start(sweepStart);
  src.stop(sweepStart + sweepDur + 0.05);
}

function playBullseye(ctx: AudioContext, t: number) {
  // Whoosh (noise highpass sweep) + impact ding at end
  const whooshDur = 0.35;
  const buf = makeNoiseBuffer(ctx, whooshDur + 0.05);
  const src = ctx.createBufferSource();
  src.buffer = buf;

  const hp = ctx.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.setValueAtTime(5000, t);
  hp.frequency.linearRampToValueAtTime(500, t + whooshDur);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.4, t);
  gain.gain.linearRampToValueAtTime(0, t + whooshDur);

  src.connect(hp);
  hp.connect(gain);
  gain.connect(ctx.destination);
  src.start(t);
  src.stop(t + whooshDur + 0.05);

  // Impact ding
  const dingStart = t + whooshDur;
  const dingOsc = ctx.createOscillator();
  dingOsc.type = "sine";
  dingOsc.frequency.value = 1320;

  const dingGain = ctx.createGain();
  dingGain.gain.setValueAtTime(0.6, dingStart);
  dingGain.gain.exponentialRampToValueAtTime(0.001, dingStart + 0.6);

  dingOsc.connect(dingGain);
  dingGain.connect(ctx.destination);
  dingOsc.start(dingStart);
  dingOsc.stop(dingStart + 0.65);
}

function playDramatic(ctx: AudioContext, t: number) {
  // 3 descending sawtooth stabs: G3-E3-C3 (196,165,131Hz), 300ms each, 350ms apart
  const notes = [196, 165, 131];
  notes.forEach((freq, i) => {
    const start = t + i * 0.35;
    const osc = ctx.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.value = freq;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.3, start);
    gain.gain.linearRampToValueAtTime(0, start + 0.3);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + 0.32);
  });
}

function playSpooky(ctx: AudioContext, t: number) {
  // Two detuned sine waves at 220Hz+223Hz (beating), slowly descending to 110Hz over 2s
  const duration = 2.0;
  [220, 223].forEach((startFreq) => {
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(startFreq, t);
    osc.frequency.linearRampToValueAtTime(startFreq / 2, t + duration);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.2, t);
    gain.gain.linearRampToValueAtTime(0, t + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + duration + 0.02);
  });
}

function playRiff(ctx: AudioContext, t: number) {
  // Power chord: root+fifth+octave (110, 165, 220Hz) sawtooth, sharp attack, 800ms
  const duration = 0.8;
  [110, 165, 220].forEach((freq) => {
    const osc = ctx.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.value = freq;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.2, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + duration + 0.02);
  });
}

function playSparkle(ctx: AudioContext, t: number) {
  // 6 random high sine plinks (1500-3000Hz) with fast decay, scattered over 800ms
  for (let i = 0; i < 6; i++) {
    const start = t + Math.random() * 0.8;
    const freq = 1500 + Math.random() * 1500;
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = freq;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.25, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + 0.15);
  }
}

function playSilly(ctx: AudioContext, t: number) {
  // Fast sine sweep up then down: 200→1200→200Hz over 600ms, square wave
  const osc = ctx.createOscillator();
  osc.type = "square";
  osc.frequency.setValueAtTime(200, t);
  osc.frequency.linearRampToValueAtTime(1200, t + 0.3);
  osc.frequency.linearRampToValueAtTime(200, t + 0.6);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.15, t);
  gain.gain.linearRampToValueAtTime(0, t + 0.6);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 0.62);
}

function playWow(ctx: AudioContext, t: number) {
  // Ascending sine glide 200→800Hz over 500ms with slight vibrato
  const duration = 0.5;
  const osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(200, t);
  osc.frequency.linearRampToValueAtTime(800, t + duration);

  // Vibrato
  const vibratoOsc = ctx.createOscillator();
  vibratoOsc.type = "sine";
  vibratoOsc.frequency.value = 6;
  const vibratoDepth = ctx.createGain();
  vibratoDepth.gain.value = 15;
  vibratoOsc.connect(vibratoDepth);
  vibratoDepth.connect(osc.frequency);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.3, t);
  gain.gain.linearRampToValueAtTime(0, t + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);
  vibratoOsc.start(t);
  vibratoOsc.stop(t + duration + 0.02);
  osc.start(t);
  osc.stop(t + duration + 0.02);
}

function playCharge(ctx: AudioContext, t: number) {
  // Cavalry charge notes: G4-C5-E5-G5 (392,523,659,784Hz) square, 100ms each
  const notes = [392, 523, 659, 784];
  notes.forEach((freq, i) => {
    const start = t + i * 0.1;
    const osc = ctx.createOscillator();
    osc.type = "square";
    osc.frequency.value = freq;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.2, start);
    gain.gain.setValueAtTime(0, start + 0.09);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + 0.1);
  });
}

function playCountdown(ctx: AudioContext, t: number) {
  // 5 descending beeps (C6→C5: 1047,932,830,740,659Hz) 300ms apart, sine wave
  const notes = [1047, 932, 830, 740, 659];
  notes.forEach((freq, i) => {
    const start = t + i * 0.3;
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = freq;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.35, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.2);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + 0.22);
  });
}

function playMicDrop(ctx: AudioContext, t: number) {
  // Short noise burst + low thud (80Hz sine 200ms) after 100ms delay
  const noiseDur = 0.08;
  const buf = makeNoiseBuffer(ctx, noiseDur + 0.02);
  const src = ctx.createBufferSource();
  src.buffer = buf;

  const hp = ctx.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = 1000;

  const nGain = ctx.createGain();
  nGain.gain.setValueAtTime(0.4, t);
  nGain.gain.linearRampToValueAtTime(0, t + noiseDur);

  src.connect(hp);
  hp.connect(nGain);
  nGain.connect(ctx.destination);
  src.start(t);
  src.stop(t + noiseDur + 0.02);

  // Low thud
  const thudStart = t + 0.1;
  const thudDur = 0.2;
  const thudOsc = ctx.createOscillator();
  thudOsc.type = "sine";
  thudOsc.frequency.value = 80;

  const thudGain = ctx.createGain();
  thudGain.gain.setValueAtTime(0, thudStart);
  thudGain.gain.linearRampToValueAtTime(0.6, thudStart + 0.01);
  thudGain.gain.exponentialRampToValueAtTime(0.001, thudStart + thudDur);

  thudOsc.connect(thudGain);
  thudGain.connect(ctx.destination);
  thudOsc.start(thudStart);
  thudOsc.stop(thudStart + thudDur + 0.02);
}

// ── Public API ────────────────────────────────────────────────────────────────

export function playSound(id: string): void {
  try {
    const ctx = getCtx();
    // Always resume — required on iOS and after page load in most browsers
    // Schedule the sound after resume resolves
    const doPlay = (ctx: AudioContext) => {
      const t = ctx.currentTime + 0.05; // small offset so notes fire after resume

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
      case "winner":       playWinner(ctx, t);      break;
      case "jackpot":      playJackpot(ctx, t);     break;
      case "party":        playParty(ctx, t);       break;
      case "laugh":        playLaugh(ctx, t);       break;
      case "gasp":         playGasp(ctx, t);        break;
      case "zap":          playZap(ctx, t);         break;
      case "boom":         playBoom(ctx, t);        break;
      case "launch":       playLaunch(ctx, t);      break;
      case "bullseye":     playBullseye(ctx, t);    break;
      case "dramatic":     playDramatic(ctx, t);    break;
      case "spooky":       playSpooky(ctx, t);      break;
      case "riff":         playRiff(ctx, t);        break;
      case "sparkle":      playSparkle(ctx, t);     break;
      case "silly":        playSilly(ctx, t);       break;
      case "wow":          playWow(ctx, t);         break;
      case "charge":       playCharge(ctx, t);      break;
      case "countdown":    playCountdown(ctx, t);   break;
      case "mic_drop":     playMicDrop(ctx, t);     break;
      default:
        console.warn(`[audioEngine] Unknown sound: ${id}`);
    }
  };

    if (ctx.state === "suspended") {
      ctx.resume().then(() => doPlay(ctx)).catch(console.error);
    } else {
      doPlay(ctx);
    }
  } catch (err) {
    console.error("[audioEngine] playSound error:", err);
  }
}
