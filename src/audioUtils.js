const AudioCtx = window.AudioContext || window.webkitAudioContext;
let ctx = null;

function getCtx() {
  if (!ctx) {
    ctx = new AudioCtx();
  }
  return ctx;
}

function playTone(freq, duration, type = 'square', volume = 0.08, freqEnd = null) {
  const c = getCtx();
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, c.currentTime);
  if (freqEnd) {
    osc.frequency.exponentialRampToValueAtTime(freqEnd, c.currentTime + duration);
  }
  gain.gain.setValueAtTime(volume, c.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
  osc.connect(gain);
  gain.connect(c.destination);
  osc.start();
  osc.stop(c.currentTime + duration);
}

function playNoise(duration, volume = 0.05) {
  const c = getCtx();
  const bufferSize = c.sampleRate * duration;
  const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  const source = c.createBufferSource();
  source.buffer = buffer;
  const gain = c.createGain();
  gain.gain.setValueAtTime(volume, c.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
  const filter = c.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = 1000;
  source.connect(filter);
  filter.connect(gain);
  gain.connect(c.destination);
  source.start();
}

export function soundMove() {
  playTone(220, 0.05, 'square', 0.04);
}

export function soundRotate() {
  playTone(300, 0.08, 'square', 0.06, 400);
}

export function soundDrop() {
  playTone(150, 0.15, 'triangle', 0.1, 60);
  playNoise(0.1, 0.04);
}

export function soundHardDrop() {
  playTone(200, 0.2, 'sawtooth', 0.1, 40);
  playNoise(0.15, 0.08);
  setTimeout(() => playTone(100, 0.1, 'triangle', 0.08), 50);
}

export function soundLineClear(count) {
  const base = 400;
  const type = count >= 4 ? 'square' : count >= 2 ? 'triangle' : 'sine';
  const vol = Math.min(0.12, 0.05 + count * 0.02);
  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      playTone(base + i * 120, 0.2, type, vol);
      playTone((base + i * 120) * 1.5, 0.15, 'sine', vol * 0.5);
    }, i * 60);
  }
  if (count === 4) {
    playNoise(0.3, 0.06);
  }
}

export function soundGameOver() {
  const notes = [400, 350, 300, 200, 150];
  notes.forEach((freq, i) => {
    setTimeout(() => playTone(freq, 0.4, 'sawtooth', 0.07), i * 200);
  });
  setTimeout(() => playNoise(0.5, 0.06), 1000);
}

export function soundLevelUp() {
  const notes = [300, 400, 500, 600, 800];
  notes.forEach((freq, i) => {
    setTimeout(() => playTone(freq, 0.15, 'square', 0.07), i * 80);
  });
}

export function soundCombo(count) {
  const freq = 500 + Math.min(count, 10) * 50;
  playTone(freq, 0.2, 'triangle', 0.08, freq + 200);
  playTone(freq * 1.25, 0.15, 'sine', 0.04);
}

export function resumeAudio() {
  if (ctx && ctx.state === 'suspended') {
    ctx.resume();
  }
}
