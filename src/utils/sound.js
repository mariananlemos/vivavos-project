/**
 * Sons curtos gerados com a Web Audio API (sem arquivos de áudio).
 * Falham em silêncio quando o navegador ainda não liberou o áudio.
 */
export function playTone(freq = 440, duration = 0.12, delay = 0) {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const start = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, start);

    gain.gain.setValueAtTime(0.08, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(start);
    osc.stop(start + duration);
    osc.onended = () => ctx.close();
  } catch {
    // Áudio bloqueado antes da primeira interação
  }
}

/** Dois toques: subindo para avisos bons, descendo para atenção */
export function playChime(tone = 'info') {
  if (tone === 'warn') {
    playTone(660, 0.16);
    playTone(440, 0.22, 0.18);
  } else {
    playTone(660, 0.14);
    playTone(880, 0.2, 0.16);
  }
}
