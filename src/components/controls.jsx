import React, { useId } from 'react';

/**
 * Grupo de opções (botões de rádio nativos, escondidos atrás de caixas grandes).
 * As setas do teclado trocam de opção, como em qualquer grupo de rádio.
 */
export function ChoiceGroup({ legend, help, value, options, onChange, className = '' }) {
  const name = useId();
  const helpId = `${name}-ajuda`;

  return (
    <fieldset className={className} aria-describedby={help ? helpId : undefined}>
      <legend className="font-bold text-[1.05rem] leading-snug">{legend}</legend>
      {help && (
        <p id={helpId} className="text-[0.9rem] text-muted mt-0.5">
          {help}
        </p>
      )}
      <div
        className={`mt-2 grid gap-2 grid-cols-1 ${
          options.length === 3 ? 'sm:grid-cols-3' : 'min-[420px]:grid-cols-2'
        }`}
      >
        {options.map((opt) => {
          const checked = value === opt.value;
          return (
            <label
              key={String(opt.value)}
              className={`flex items-center gap-3 min-h-[3rem] px-3 py-2 rounded-lg border-2 cursor-pointer transition ${
                checked ? 'border-primary bg-primary-soft' : 'border-line bg-surface hover:border-strong'
              }`}
            >
              <input
                type="radio"
                className="sr-only"
                name={name}
                value={String(opt.value)}
                checked={checked}
                onChange={() => onChange(opt.value)}
              />
              <span
                aria-hidden="true"
                className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  checked ? 'border-primary' : 'border-strong'
                }`}
              >
                {checked && <span className="w-3 h-3 rounded-full bg-primary" />}
              </span>
              <span className="leading-snug">
                <span className="block font-bold">{opt.label}</span>
                {opt.hint && <span className="block text-[0.85rem] text-muted">{opt.hint}</span>}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

/** Interruptor liga/desliga. Mostra "Ligado"/"Desligado" por escrito, não só pela cor. */
export function Switch({ label, help, checked, onChange }) {
  const id = useId();

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p id={`${id}-rotulo`} className="font-bold text-[1.05rem] leading-snug">
          {label}
        </p>
        {help && (
          <p id={`${id}-ajuda`} className="text-[0.9rem] text-muted mt-0.5">
            {help}
          </p>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={`${id}-rotulo`}
        aria-describedby={help ? `${id}-ajuda` : undefined}
        onClick={() => onChange(!checked)}
        className="shrink-0 inline-flex items-center gap-2 min-h-[3rem] pl-1 pr-1 rounded-full font-bold"
      >
        <span className={`w-[7.5ch] text-right text-[0.95rem] ${checked ? 'text-primary' : 'text-muted'}`} aria-hidden="true">
          {checked ? 'Ligado' : 'Desligado'}
        </span>
        <span
          aria-hidden="true"
          className={`relative w-16 h-9 rounded-full border-2 transition ${
            checked ? 'bg-primary border-primary' : 'bg-page border-strong'
          }`}
        >
          <span
            className={`absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-full transition-all ${
              checked ? 'left-[calc(100%-1.75rem)] bg-on-primary' : 'left-1 bg-strong'
            }`}
          />
        </span>
      </button>
    </div>
  );
}

/** Botões − valor + (tamanho da letra, velocidade da voz) */
export function Stepper({ label, help, valueText, onDecrease, onIncrease, canDecrease, canIncrease, decreaseLabel, increaseLabel, decreaseText, increaseText }) {
  const id = useId();
  const stepButton =
    'min-h-[3rem] min-w-[3.5rem] px-3 rounded-lg border-2 border-strong bg-surface font-bold text-[1.15rem] hover:bg-page disabled:opacity-40';

  return (
    <div role="group" aria-labelledby={`${id}-rotulo`}>
      <p id={`${id}-rotulo`} className="font-bold text-[1.05rem] leading-snug">
        {label}
      </p>
      {help && <p className="text-[0.9rem] text-muted mt-0.5">{help}</p>}
      <div className="mt-2 flex items-center gap-3">
        <button type="button" className={stepButton} onClick={onDecrease} disabled={!canDecrease} aria-label={decreaseLabel}>
          {decreaseText}
        </button>
        <span className="min-w-[6rem] text-center font-bold tabular-nums" aria-live="polite">
          {valueText}
        </span>
        <button type="button" className={stepButton} onClick={onIncrease} disabled={!canIncrease} aria-label={increaseLabel}>
          {increaseText}
        </button>
      </div>
    </div>
  );
}
