import { useState, useCallback, useRef, useEffect } from 'react';
import { playChime } from '../utils/sound';

// Quanto tempo o aviso fica na tela (ajuste "Tempo dos avisos"); null = até a pessoa fechar
export const TOAST_TIMES = { normal: 6000, longo: 15000, fixo: null };

let nextId = 0;

/**
 * Avisos que chegam por mais de um caminho (feedback multimodal):
 * texto na tela + voz + som + vibração + tela piscando, conforme os ajustes.
 */
export function useNotifications(prefs, tts) {
  const [toasts, setToasts] = useState([]);
  const [flashKey, setFlashKey] = useState(0);
  const prefsRef = useRef(prefs);
  const ttsRef = useRef(tts);
  const timersRef = useRef(new Map());
  prefsRef.current = prefs;
  ttsRef.current = tts;

  useEffect(() => () => timersRef.current.forEach(clearTimeout), []);

  const dismiss = useCallback((id) => {
    clearTimeout(timersRef.current.get(id));
    timersRef.current.delete(id);
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  /** voice: false quando outra fala mais importante vai começar logo em seguida */
  const notify = useCallback(
    (message, { tone = 'ok', voice = true } = {}) => {
      const p = prefsRef.current;
      const id = ++nextId;
      setToasts((list) => [...list.slice(-2), { id, message, tone }]);

      const ms = TOAST_TIMES[p.toastTime];
      if (ms) timersRef.current.set(id, setTimeout(() => dismiss(id), ms));

      if (p.alertSound) playChime(tone);
      if (p.alertVibrate) navigator.vibrate?.(tone === 'warn' ? [200, 100, 200] : 150);
      if (p.alertFlash) setFlashKey((k) => k + 1);
      if (p.alertVoice && voice) ttsRef.current.speak(message, null, { manual: true });
    },
    [dismiss]
  );

  return { toasts, dismiss, notify, flashKey };
}
