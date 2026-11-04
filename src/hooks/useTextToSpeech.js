import { useState, useEffect, useCallback, useRef } from 'react';

// Vozes brasileiras mais naturais primeiro (Edge, Chrome, Windows, Apple)
const PREFERRED_PT_BR_VOICES = ['Francisca', 'Thalita', 'Antonio', 'Google', 'Luciana', 'Maria', 'Daniel', 'Felipe'];

// Velocidade "normal" da escala do app; a voz da OpenAI toca em 1x nesse ponto
const BASE_RATE = 0.85;
const MAX_CACHED_AUDIOS = 30;

// WAV mudo de poucos bytes, tocado no primeiro toque para o celular liberar o áudio depois
const SILENT_WAV =
  'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YQAAAAA=';

/**
 * Escolhe uma voz do português do Brasil. Nunca devolve voz de Portugal (pt-PT).
 */
export function pickBrazilianVoice(voices) {
  const ptBr = voices.filter((v) => v.lang.replace('_', '-').toLowerCase() === 'pt-br');
  if (ptBr.length === 0) return null;
  for (const name of PREFERRED_PT_BR_VOICES) {
    const match = ptBr.find((v) => v.name.includes(name));
    if (match) return match;
  }
  return ptBr[0];
}

async function fetchSpeechAudio(text) {
  const response = await fetch('/api/speak', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  if (!response.ok) {
    const error = new Error(`Voz indisponível (${response.status})`);
    error.status = response.status;
    throw error;
  }
  return URL.createObjectURL(await response.blob());
}

/**
 * Fala em português do Brasil.
 * 1º: voz da OpenAI (sotaque brasileiro garantido), via /api/speak.
 * 2º (reserva): voz do próprio navegador, só se houver voz pt-BR ou se a OpenAI falhar.
 *
 * options (ajustes de acessibilidade): autoSpeak, volume (0 a 1), voiceEngine ('natural' | 'aparelho'), pitch.
 * speak(texto, aoTerminar, { manual, quick }):
 * - manual: a pessoa pediu para ouvir; fala mesmo com "Falar sozinho" desligado.
 * - quick: usa a voz do aparelho, que responde na hora (leitura de toque e de digitação).
 */
export function useTextToSpeech(initialRate = BASE_RATE, options = {}) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  // Texto que está sendo falado e a posição aproximada, para a legenda
  const [caption, setCaption] = useState(null);
  const optionsRef = useRef(options);
  optionsRef.current = options;
  const [isSupported] = useState(() => typeof window !== 'undefined' && ('Audio' in window || 'speechSynthesis' in window));
  const [rate, setRate] = useState(() => {
    const saved = localStorage.getItem('vivavos-speech-rate');
    return saved ? parseFloat(saved) : initialRate;
  });

  const audioRef = useRef(null);
  const cacheRef = useRef(new Map()); // texto -> URL do áudio já gerado ("Ouvir de novo" não gera de novo)
  const serverVoiceAvailableRef = useRef(true);
  const speechIdRef = useRef(0); // cada fala nova invalida a anterior

  useEffect(() => {
    audioRef.current = new Audio();

    // Libera o áudio no primeiro toque (exigência de celulares, principalmente iPhone)
    const unlock = () => {
      const audio = audioRef.current;
      if (audio && !audio.src) {
        audio.src = SILENT_WAV;
        audio.play().catch(() => {});
      }
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
    window.addEventListener('pointerdown', unlock);
    window.addEventListener('keydown', unlock);

    // No Chrome a lista de vozes do navegador chega depois; pedir de novo deixa a reserva pronta
    const loadVoices = () => window.speechSynthesis?.getVoices();
    loadVoices();
    window.speechSynthesis?.addEventListener('voiceschanged', loadVoices);

    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
      window.speechSynthesis?.removeEventListener('voiceschanged', loadVoices);
      audioRef.current?.pause();
      for (const url of cacheRef.current.values()) URL.revokeObjectURL(url);
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = options.volume ?? 1;
  }, [options.volume]);

  useEffect(() => {
    localStorage.setItem('vivavos-speech-rate', rate.toString());
    if (audioRef.current) audioRef.current.playbackRate = rate / BASE_RATE;
  }, [rate]);

  const speakWithBrowser = useCallback(
    (text, onEndCallback, speechId) => {
      if (!window.speechSynthesis) {
        setIsSpeaking(false);
        return;
      }
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'pt-BR';
      utterance.rate = rate; // Ajustado para compreensão de idosos
      utterance.pitch = optionsRef.current.pitch ?? 1;
      utterance.volume = optionsRef.current.volume ?? 1;

      // Usa somente vozes do português do Brasil; sem nenhuma, o navegador escolhe pelo lang pt-BR
      const ptBrVoice = pickBrazilianVoice(window.speechSynthesis.getVoices());
      if (ptBrVoice) utterance.voice = ptBrVoice;

      utterance.onboundary = (e) => {
        if (speechId === speechIdRef.current) setCaption({ text, charIndex: e.charIndex });
      };
      utterance.onend = () => {
        if (speechId !== speechIdRef.current) return;
        setIsSpeaking(false);
        setCaption(null);
        if (onEndCallback) onEndCallback();
      };
      utterance.onerror = (e) => {
        console.warn('Erro na síntese de fala:', e);
        if (speechId !== speechIdRef.current) return;
        setIsSpeaking(false);
        setCaption(null);
      };

      window.speechSynthesis.speak(utterance);
    },
    [rate]
  );

  const getAudioUrl = useCallback(async (text) => {
    const cache = cacheRef.current;
    if (cache.has(text)) return cache.get(text);
    const url = await fetchSpeechAudio(text);
    cache.set(text, url);
    if (cache.size > MAX_CACHED_AUDIOS) {
      const [oldestText, oldestUrl] = cache.entries().next().value;
      URL.revokeObjectURL(oldestUrl);
      cache.delete(oldestText);
    }
    return url;
  }, []);

  const speak = useCallback(
    async (text, onEndCallback, { manual = false, quick = false } = {}) => {
      if (!text) return;
      const opts = optionsRef.current;

      // "Falar sozinho" desligado: só fala quando a pessoa pede
      if (!manual && opts.autoSpeak === false) {
        if (onEndCallback) onEndCallback();
        return;
      }

      // Cancela fala anterior
      const speechId = ++speechIdRef.current;
      audioRef.current?.pause();
      window.speechSynthesis?.cancel();
      setIsSpeaking(true);
      setCaption({ text, charIndex: 0 });

      const audio = audioRef.current;
      const useServerVoice = !quick && opts.voiceEngine !== 'aparelho' && serverVoiceAvailableRef.current;
      if (audio && useServerVoice) {
        try {
          const url = await getAudioUrl(text);
          if (speechId !== speechIdRef.current) return;

          audio.src = url;
          audio.playbackRate = rate / BASE_RATE;
          audio.volume = opts.volume ?? 1;
          audio.ontimeupdate = () => {
            if (speechId !== speechIdRef.current || !audio.duration) return;
            setCaption({ text, charIndex: Math.floor((text.length * audio.currentTime) / audio.duration) });
          };
          audio.onended = () => {
            if (speechId !== speechIdRef.current) return;
            setIsSpeaking(false);
            setCaption(null);
            if (onEndCallback) onEndCallback();
          };
          audio.onerror = null;
          await audio.play();
          return;
        } catch (err) {
          if (speechId !== speechIdRef.current) return;
          // Sem chave ou rota bloqueada: não adianta tentar a OpenAI de novo nesta visita
          if (err.status === 503 || err.status === 403) serverVoiceAvailableRef.current = false;
          console.warn('Voz da OpenAI indisponível, usando a voz do navegador:', err.message);
        }
      }

      speakWithBrowser(text, onEndCallback, speechId);
    },
    [rate, getAudioUrl, speakWithBrowser]
  );

  const stop = useCallback(() => {
    speechIdRef.current++;
    audioRef.current?.pause();
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
    setCaption(null);
  }, []);

  const increaseSpeed = useCallback(() => {
    setRate((prev) => {
      const next = Math.min(Number((prev + 0.1).toFixed(2)), 1.3);
      return next;
    });
  }, []);

  const decreaseSpeed = useCallback(() => {
    setRate((prev) => {
      const next = Math.max(Number((prev - 0.1).toFixed(2)), 0.6);
      return next;
    });
  }, []);

  return {
    speak,
    stop,
    isSpeaking,
    caption,
    isSupported,
    rate,
    setRate,
    increaseSpeed,
    decreaseSpeed,
  };
}
