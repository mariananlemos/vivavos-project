import { useEffect, useRef } from 'react';
import { findInteractive, findReadable, readableText } from '../utils/readableText';

const quick = { manual: true, quick: true };

// Cliques que vêm do teclado (Enter/Espaço) ou do próprio código não passam pelos filtros de toque
const isPointerClick = (e) => e.isTrusted && e.detail > 0;

/**
 * Auxílios que funcionam na página inteira, ligados em "Ajustes de acessibilidade":
 * leitor de tela básico/avançado, leitura ao digitar, toque tolerante e gestos.
 */
export function useInteractionAids(prefs, tts, { onSwipeBack }) {
  const speakRef = useRef(tts.speak);
  const stopRef = useRef(tts.stop);
  const backRef = useRef(onSwipeBack);
  speakRef.current = tts.speak;
  stopRef.current = tts.stop;
  backRef.current = onSwipeBack;

  // Som > Leitor de tela: lê o foco do teclado e o que for tocado.
  // No modo "tudo", o 1º toque num botão só lê; o 2º toque ativa.
  useEffect(() => {
    if (prefs.readOnTouch === 'off') return;
    let usingKeyboard = false;
    let armed = { el: null, time: 0 };
    let passThroughUntil = 0;

    const onKeyDown = () => (usingKeyboard = true);
    const onPointerDown = () => (usingKeyboard = false);

    const onFocusIn = (e) => {
      if (!usingKeyboard) return;
      const text = readableText(findReadable(e.target) || e.target);
      if (text) speakRef.current(text, null, quick);
    };

    const onClick = (e) => {
      if (!isPointerClick(e) || e.target.closest?.('[data-a11y-ui]')) return;
      const interactive = findInteractive(e.target);

      if (interactive) {
        if (prefs.readOnTouch !== 'tudo' || performance.now() < passThroughUntil) return;
        if (armed.el === interactive && performance.now() - armed.time < 6000) {
          // 2º toque: deixa ativar (e também o clique que o rótulo repassa para a opção)
          armed = { el: null, time: 0 };
          passThroughUntil = performance.now() + 300;
          return;
        }
        e.preventDefault();
        e.stopPropagation();
        armed = { el: interactive, time: performance.now() };
        speakRef.current(`${readableText(interactive)}. Toque de novo para escolher.`, null, quick);
        return;
      }

      const text = readableText(findReadable(e.target));
      if (text) speakRef.current(text, null, quick);
    };

    window.addEventListener('keydown', onKeyDown, true);
    window.addEventListener('pointerdown', onPointerDown, true);
    document.addEventListener('focusin', onFocusIn);
    window.addEventListener('click', onClick, true);
    return () => {
      window.removeEventListener('keydown', onKeyDown, true);
      window.removeEventListener('pointerdown', onPointerDown, true);
      document.removeEventListener('focusin', onFocusIn);
      window.removeEventListener('click', onClick, true);
    };
  }, [prefs.readOnTouch]);

  // Entrada de dados > Controle de toque: ignora o toque repetido sem querer (tremor)
  useEffect(() => {
    if (!prefs.tapGuard) return;
    let last = { el: null, time: 0 };

    const onClick = (e) => {
      if (!isPointerClick(e)) return;
      const el = findInteractive(e.target);
      if (!el) return;
      const now = performance.now();
      if (el === last.el && now - last.time < prefs.tapGuard) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      last = { el, time: now };
    };

    window.addEventListener('click', onClick, true);
    return () => window.removeEventListener('click', onClick, true);
  }, [prefs.tapGuard]);

  // Som > Leitura ao digitar: fala cada letra ou cada palavra digitada
  useEffect(() => {
    if (prefs.typingEcho === 'off') return;

    const onInput = (e) => {
      const el = e.target;
      if (!el.matches?.('textarea, input:is([type="text"], [type="search"], :not([type]))')) return;
      if (e.inputType?.startsWith('delete')) {
        speakRef.current('apagou', null, quick);
        return;
      }
      if (!e.data) return;

      if (prefs.typingEcho === 'letra') {
        speakRef.current(e.data === ' ' ? 'espaço' : e.data, null, quick);
      } else if (/[\s.,;!?]$/.test(e.data)) {
        const word = el.value.slice(0, el.selectionStart).trim().split(/\s+/).pop();
        if (word) speakRef.current(word, null, quick);
      }
    };

    document.addEventListener('input', onInput, true);
    return () => document.removeEventListener('input', onInput, true);
  }, [prefs.typingEcho]);

  // Gestos: deslizar o dedo para a direita volta para a tela anterior
  useEffect(() => {
    if (!prefs.swipeBack) return;
    let start = null;

    const onTouchStart = (e) => {
      const t = e.touches[0];
      start =
        e.touches.length === 1 && !e.target.closest?.('input, textarea, select')
          ? { x: t.clientX, y: t.clientY, time: Date.now() }
          : null;
    };
    const onTouchEnd = (e) => {
      if (!start) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - start.x;
      const dy = t.clientY - start.y;
      if (dx > 90 && Math.abs(dy) < 60 && Date.now() - start.time < 800) backRef.current?.();
      start = null;
    };

    document.addEventListener('touchstart', onTouchStart, { passive: true });
    document.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      document.removeEventListener('touchstart', onTouchStart);
      document.removeEventListener('touchend', onTouchEnd);
    };
  }, [prefs.swipeBack]);

  // Gestos: chacoalhar o celular faz o Vivavós parar de falar
  useEffect(() => {
    if (!prefs.shakeToStop) return;
    let peaks = [];
    let lastShake = 0;

    const onMotion = (e) => {
      const a = e.accelerationIncludingGravity;
      if (!a || Math.hypot(a.x || 0, a.y || 0, a.z || 0) < 25) return;
      const now = Date.now();
      peaks = [...peaks.filter((t) => now - t < 800), now];
      if (peaks.length >= 3 && now - lastShake > 1500) {
        lastShake = now;
        peaks = [];
        stopRef.current();
      }
    };

    window.addEventListener('devicemotion', onMotion);
    return () => window.removeEventListener('devicemotion', onMotion);
  }, [prefs.shakeToStop]);
}
