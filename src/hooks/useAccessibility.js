import { useState, useEffect, useCallback } from 'react';

export const MIN_FONT = 16;
export const MAX_FONT = 28;

const STORAGE_KEY = 'vivavos-preferencias';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/**
 * Todos os ajustes de acessibilidade, organizados nas 8 categorias da tela "Ajustes de acessibilidade".
 * Ficam guardados só neste aparelho (localStorage).
 */
export const DEFAULT_PREFS = {
  // 1. Ambiente
  theme: 'padrao', // padrao | alto-contraste | escuro | suave
  dim: 0, // 0 a 3: quanto escurecer a tela
  reduceMotion: false,
  answerTime: 'normal', // normal | longo | muito-longo (tempo para responder por voz)
  toastTime: 'normal', // normal | longo | fixo (quanto tempo os avisos ficam na tela)
  // 2. Texto
  fontFamily: 'atkinson', // atkinson | lexend | sistema
  fontSize: 18,
  boldText: false,
  inkColor: 'padrao', // padrao | preto | azul | marrom
  lineSpacing: 'normal', // normal | amplo | muito-amplo
  letterSpacing: 'normal', // normal | amplo | muito-amplo
  // 3. Som
  autoSpeak: false,
  volume: 1,
  sounds: true, // bipes do microfone
  readOnTouch: 'off', // off | textos | tudo
  voiceEngine: 'natural', // natural (OpenAI) | aparelho (voz do navegador)
  pitch: 1,
  typingEcho: 'off', // off | letra | palavra
  // 4. Vídeo e legendas
  captions: true,
  captionSize: 'grande', // normal | grande | enorme
  captionStyle: 'escuro', // escuro | claro
  showLibras: true,
  // 5. Zoom
  pageZoom: 100, // 100 | 125 | 150
  magnifier: false,
  magnifierSize: 'grande', // grande | enorme
  magnifierFollow: 'tudo', // tudo (foco, dedo e mouse) | foco (só o foco do teclado)
  // 6. Entrada de dados
  bigCursor: false,
  strongFocus: false,
  bigTargets: false,
  tapGuard: 0, // ms em que um segundo toque no mesmo botão é ignorado
  suggestions: true,
  // 7. Notificações e alertas
  alertVoice: true,
  alertFlash: false,
  alertSound: true,
  alertVibrate: true,
  // 8. Gestos
  swipeBack: false,
  shakeToStop: false,
};

function loadPrefs() {
  const defaults = { ...DEFAULT_PREFS, reduceMotion: prefersReducedMotion() };
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (saved && typeof saved === 'object') return { ...defaults, ...saved };

    // Migra os ajustes da versão anterior (só letra e contraste)
    const oldFont = parseInt(localStorage.getItem('vivavos-fontsize'), 10);
    if (oldFont >= MIN_FONT && oldFont <= MAX_FONT) defaults.fontSize = oldFont;
    if (localStorage.getItem('vivavos-highcontrast') === 'true') defaults.theme = 'alto-contraste';
  } catch {
    // Armazenamento bloqueado: usa o padrão
  }
  return defaults;
}

function applyToDocument(prefs) {
  const root = document.documentElement;
  root.style.fontSize = `${prefs.fontSize}px`;
  root.style.setProperty('--page-zoom', String(prefs.pageZoom / 100));

  Object.assign(root.dataset, {
    theme: prefs.theme,
    ink: prefs.inkColor,
    font: prefs.fontFamily,
    line: prefs.lineSpacing,
    letter: prefs.letterSpacing,
  });

  const classes = {
    'reduce-motion': prefs.reduceMotion,
    'bold-text': prefs.boldText,
    'big-cursor': prefs.bigCursor,
    'strong-focus': prefs.strongFocus,
    'big-targets': prefs.bigTargets,
    'hide-libras': !prefs.showLibras,
  };
  for (const [name, on] of Object.entries(classes)) root.classList.toggle(name, on);
}

export function useAccessibility() {
  const [prefs, setPrefs] = useState(() => {
    // Aplica antes da primeira pintura: a tela já abre com as cores e a letra escolhidas, sem piscar
    const initial = loadPrefs();
    applyToDocument(initial);
    return initial;
  });

  useEffect(() => {
    applyToDocument(prefs);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch {
      // Sem armazenamento, os ajustes valem só nesta visita
    }
  }, [prefs]);

  const setPref = useCallback((key, value) => {
    setPrefs((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetPrefs = useCallback(() => {
    setPrefs({ ...DEFAULT_PREFS, reduceMotion: prefersReducedMotion() });
  }, []);

  const increaseFontSize = useCallback(() => {
    setPrefs((prev) => ({ ...prev, fontSize: Math.min(prev.fontSize + 2, MAX_FONT) }));
  }, []);

  const decreaseFontSize = useCallback(() => {
    setPrefs((prev) => ({ ...prev, fontSize: Math.max(prev.fontSize - 2, MIN_FONT) }));
  }, []);

  const toggleHighContrast = useCallback(() => {
    setPrefs((prev) => ({ ...prev, theme: prev.theme === 'alto-contraste' ? 'padrao' : 'alto-contraste' }));
  }, []);

  return {
    prefs,
    setPref,
    resetPrefs,
    fontSize: prefs.fontSize,
    highContrast: prefs.theme === 'alto-contraste',
    increaseFontSize,
    decreaseFontSize,
    toggleHighContrast,
  };
}
