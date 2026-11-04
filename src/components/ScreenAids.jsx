import React, { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { findReadable, readableText } from '../utils/readableText';

const DIM_LEVELS = [0, 0.15, 0.3, 0.45];

/** Ambiente > Brilho: escurece a tela inteira sem atrapalhar os toques */
export function DimOverlay({ level }) {
  if (!level) return null;
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-[70] bg-black pointer-events-none"
      style={{ opacity: DIM_LEVELS[level] }}
    />
  );
}

/** Notificações > Piscar a tela: some sozinho no fim da animação */
export function FlashOverlay({ flashKey }) {
  if (!flashKey) return null;
  return <div key={flashKey} aria-hidden="true" className="flash-overlay fixed inset-0 z-[65] bg-accent pointer-events-none opacity-0" />;
}

const MAGNIFIER_SIZES = { grande: 'text-[2rem]', enorme: 'text-[2.8rem]' };

/**
 * Zoom > Lupa: mostra bem grande o texto do que está em foco ou sob o dedo/mouse.
 * Fica na parte de baixo da tela, ou em cima quando o item está embaixo, para não cobri-lo.
 */
export function Magnifier({ enabled, size, follow }) {
  const [target, setTarget] = useState(null); // { text, atTop }

  useEffect(() => {
    if (!enabled) {
      setTarget(null);
      return;
    }
    let frame = 0;

    const show = (el) => {
      const readable = findReadable(el);
      const text = readableText(readable);
      if (!text) return;
      const rect = readable.getBoundingClientRect();
      setTarget({ text, atTop: rect.top + rect.height / 2 > window.innerHeight / 2 });
    };
    const onFocusIn = (e) => show(e.target);
    const onPointer = (e) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => show(e.target));
    };

    document.addEventListener('focusin', onFocusIn);
    if (follow === 'tudo') {
      document.addEventListener('pointerover', onPointer);
      document.addEventListener('pointerdown', onPointer);
    }
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener('focusin', onFocusIn);
      document.removeEventListener('pointerover', onPointer);
      document.removeEventListener('pointerdown', onPointer);
    };
  }, [enabled, follow]);

  if (!enabled || !target) return null;

  return (
    <div
      aria-hidden="true"
      data-a11y-ui
      className={`fixed inset-x-0 z-[60] px-4 pointer-events-none ${target.atTop ? 'top-2' : 'bottom-2'}`}
    >
      <div className="max-w-5xl mx-auto rounded-lg border-4 border-accent bg-surface text-ink shadow-card px-5 py-3">
        <p className="flex items-center gap-1.5 text-[0.85rem] font-bold text-muted">
          <Search className="w-4 h-4" strokeWidth={2.5} />
          Lupa
        </p>
        <p className={`${MAGNIFIER_SIZES[size] || MAGNIFIER_SIZES.grande} font-bold leading-tight line-clamp-3`}>{target.text}</p>
      </div>
    </div>
  );
}
