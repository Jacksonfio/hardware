/**
 * Web Audio API synthesizer for simulating the ESP32 Piezo Buzzer alarm.
 * Generates an industrial alert beep pattern when gas hazard is active.
 */

let audioCtx: AudioContext | null = null;
let buzzerOscillator: OscillatorNode | null = null;
let buzzerGain: GainNode | null = null;
let alarmInterval: number | null = null;
let isAudioMuted = true; // Default muted for smooth UX, user can toggle in header

export const setBuzzerMuted = (muted: boolean) => {
  isAudioMuted = muted;
  if (muted) {
    stopBuzzer();
  }
};

export const getBuzzerMuted = () => isAudioMuted;

export const startBuzzer = () => {
  if (isAudioMuted) return;
  if (alarmInterval) return; // Already sounding

  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    let isBeepOn = false;
    alarmInterval = window.setInterval(() => {
      if (!audioCtx || isAudioMuted) return;
      
      if (isBeepOn) {
        // Stop current beep
        if (buzzerOscillator) {
          try { buzzerOscillator.stop(); } catch { /* ignore */ }
          buzzerOscillator.disconnect();
          buzzerOscillator = null;
        }
        isBeepOn = false;
      } else {
        // Start 2400Hz piezo beep (typical ESP32 alarm frequency)
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        
        osc.type = 'square';
        osc.frequency.setValueAtTime(2400, audioCtx.currentTime);
        
        gain.gain.setValueAtTime(0.08, audioCtx.currentTime); // Soft comfortable volume
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
        
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        
        osc.start();
        osc.stop(audioCtx.currentTime + 0.15);
        
        buzzerOscillator = osc;
        buzzerGain = gain;
        isBeepOn = true;
      }
    }, 250);
  } catch (err) {
    console.warn('AudioContext failed to start', err);
  }
};

export const stopBuzzer = () => {
  if (alarmInterval) {
    clearInterval(alarmInterval);
    alarmInterval = null;
  }
  if (buzzerOscillator) {
    try { buzzerOscillator.stop(); } catch { /* ignore */ }
    buzzerOscillator.disconnect();
    buzzerOscillator = null;
  }
  buzzerGain = null;
};

export const playSingleClick = () => {
  if (isAudioMuted) return;
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.02, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.05);
  } catch {
    /* ignore */
  }
};
