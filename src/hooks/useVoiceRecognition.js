import { useState, useEffect, useCallback, useRef } from 'react';
import { playTone } from '../utils/sound';

/**
 * Classifica a fala do idoso em um comando simples.
 * A negação é verificada ANTES da confirmação: "não está certo" precisa virar REJECT,
 * nunca CONFIRM. As palavras são comparadas inteiras (sem acento) para evitar falsos
 * positivos como "assim" contendo "sim".
 */
export function classifyCommand(text) {
  const normalized = (text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim();
  const has = (...words) => words.some((w) => new RegExp(`\\b${w}\\b`).test(normalized));

  if (has('nao', 'errado', 'errada', 'outra', 'cancelar', 'cancela')) return 'REJECT';
  if (has('sim', 'certo', 'certa', 'correto', 'correta', 'confirmo', 'pode', 'isso')) return 'CONFIRM';
  if (has('devagar', 'lento', 'menos')) return 'SLOWER';
  if (has('rapido')) return 'FASTER';
  if (has('repetir', 'repete', 'de novo', 'denovo', 'ouvir', 'ler')) return 'REPEAT';
  return 'SPEECH';
}

/**
 * Escuta comandos em português do Brasil.
 * - sounds: toca bipes quando o microfone abre e fecha.
 * - extraTries: quantas vezes o microfone reabre sozinho se a pessoa ainda não falou
 *   (ajuste "Tempo para responder", para quem precisa de mais tempo).
 */
export function useVoiceRecognition(options = {}) {
  const { onCommand } = options;
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef(null);
  const onCommandRef = useRef(onCommand);
  const optionsRef = useRef(options);
  const triesLeftRef = useRef(0);
  const restartRef = useRef(false);

  useEffect(() => {
    onCommandRef.current = onCommand;
  }, [onCommand]);

  optionsRef.current = options;

  const cue = (freq, duration) => {
    if (optionsRef.current.sounds !== false) playTone(freq, duration);
  };

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      setError('O microfone não é suportado pelo seu navegador atual. Use o Google Chrome ou Microsoft Edge.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
      cue(580, 0.1); // Bipe de início
    };

    recognition.onresult = (event) => {
      const current = event.resultIndex;
      const text = event.results[current][0].transcript;
      setTranscript(text);

      const isFinal = event.results[current].isFinal;
      if (isFinal && onCommandRef.current) {
        onCommandRef.current({ type: classifyCommand(text), text });
      }
    };

    recognition.onerror = (event) => {
      // A pessoa ainda não falou: reabre o microfone em vez de desistir
      if (event.error === 'no-speech' && triesLeftRef.current > 0) {
        triesLeftRef.current -= 1;
        restartRef.current = true;
        return;
      }
      setIsListening(false);
      cue(320, 0.15); // Bipe baixo de aviso
      if (event.error === 'not-allowed') {
        setError('Por favor, autorize o microfone para conversar por voz.');
      } else if (event.error === 'no-speech') {
        setError('Não ouvi nada. Pode falar novamente bem pertinho do celular?');
      } else {
        setError('Não consegui entender com clareza. Pode repetir?');
      }
    };

    recognition.onend = () => {
      if (restartRef.current) {
        restartRef.current = false;
        try {
          recognition.start();
          return;
        } catch {
          // Não deu para reabrir: encerra normalmente
        }
      }
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      setTranscript('');
      setError(null);
      triesLeftRef.current = optionsRef.current.extraTries || 0;
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.warn('Microfone já ativo ou erro ao iniciar:', e);
      }
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      triesLeftRef.current = 0;
      restartRef.current = false;
      recognitionRef.current.stop();
    }
  }, [isListening]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setError(null);
  }, []);

  return {
    isListening,
    transcript,
    error,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
  };
}
