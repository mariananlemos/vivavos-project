import React from 'react';
import { CircleCheck, Info, TriangleAlert, X } from 'lucide-react';

const TONES = {
  ok: { icon: CircleCheck, className: 'bg-ok-soft border-ok' },
  warn: { icon: TriangleAlert, className: 'bg-warn-soft border-strong' },
  info: { icon: Info, className: 'bg-primary-soft border-primary' },
};

/** Avisos na tela. A região fica sempre presente para o leitor de tela anunciar o que entrar nela. */
export function Toasts({ toasts, onDismiss }) {
  return (
    <div
      role="status"
      aria-live="polite"
      data-a11y-ui
      className="fixed top-4 inset-x-4 z-[55] mx-auto max-w-[30rem] flex flex-col gap-2 pointer-events-none"
    >
      {toasts.map((toast) => {
        const { icon: Icon, className } = TONES[toast.tone] || TONES.info;
        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-3 pl-4 pr-2 py-2 rounded-lg border-2 text-ink shadow-card ${className}`}
          >
            <Icon className="w-6 h-6 shrink-0" strokeWidth={2.25} aria-hidden="true" />
            <p className="flex-1 font-bold">{toast.message}</p>
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              className="shrink-0 inline-flex items-center gap-1 min-h-[2.75rem] px-3 rounded-full hover:bg-surface font-bold"
            >
              <X className="w-5 h-5" strokeWidth={2.5} aria-hidden="true" />
              <span>Fechar</span>
            </button>
          </div>
        );
      })}
    </div>
  );
}
