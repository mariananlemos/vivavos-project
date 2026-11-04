import React from 'react';
import { Contrast, Settings2 } from 'lucide-react';
import { MIN_FONT, MAX_FONT } from '../hooks/useAccessibility';

const chipBase =
  'min-h-[2.25rem] min-w-[2.25rem] md:min-h-[2.5rem] md:min-w-[2.5rem] px-2 rounded-md border font-bold disabled:opacity-40 transition';
const chip = `${chipBase} border-line bg-surface hover:border-strong`;

const skipLink =
  'sr-only focus:not-sr-only md:not-sr-only text-primary font-bold underline-offset-2 hover:underline focus:px-2 focus:py-1';

/**
 * Barra de acessibilidade no padrão eMAG (sites do governo):
 * atalhos de teclado à esquerda e ajustes de leitura à direita.
 */
export function AccessibilityBar({ accessibility, tts, onNavigate }) {
  const { highContrast, toggleHighContrast, increaseFontSize, decreaseFontSize, fontSize } = accessibility;
  const { rate, increaseSpeed, decreaseSpeed } = tts;

  return (
    <div className="bg-page border-b border-line text-[0.85rem]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-1.5 flex flex-wrap items-center justify-between gap-x-6 gap-y-1.5">
        <ul className="flex flex-wrap gap-x-5" aria-label="Atalhos de teclado">
          <li>
            <a href="#conteudo" accessKey="1" className={skipLink}>
              Ir para o conteúdo [1]
            </a>
          </li>
          <li>
            <a href="#menu" accessKey="2" className={skipLink}>
              Ir para o menu [2]
            </a>
          </li>
          <li>
            <a href="#rodape" accessKey="3" className={skipLink}>
              Ir para o rodapé [3]
            </a>
          </li>
        </ul>

        <div role="toolbar" aria-label="Ajustes de acessibilidade" className="flex flex-wrap items-center gap-1 md:gap-1.5 md:ml-auto">
          <a
            href="#ajustes"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('ajustes');
            }}
            className="px-2 min-h-[2.5rem] inline-flex items-center gap-1.5 font-bold text-primary hover:underline"
          >
            <Settings2 className="w-4 h-4" strokeWidth={2.5} aria-hidden="true" />
            Ajustes de acessibilidade
          </a>

          <button
            className={`${highContrast ? `${chipBase} bg-primary text-on-primary border-primary` : chip} inline-flex items-center gap-1.5`}
            onClick={toggleHighContrast}
            aria-pressed={highContrast}
          >
            <Contrast className="w-4 h-4" aria-hidden="true" />
            <span>Contraste</span>
          </button>

          <span className="inline-flex items-center gap-1" role="group" aria-label="Tamanho da letra">
            <button className={chip} onClick={decreaseFontSize} disabled={fontSize <= MIN_FONT} aria-label="Diminuir tamanho da letra">
              A−
            </button>
            <button className={chip} onClick={increaseFontSize} disabled={fontSize >= MAX_FONT} aria-label="Aumentar tamanho da letra">
              A+
            </button>
          </span>

          <span className="inline-flex items-center gap-1" role="group" aria-label="Velocidade da voz">
            <button className={chip} onClick={decreaseSpeed} disabled={rate <= 0.6} aria-label="Voz mais devagar">
              🐢
            </button>
            <span className="tabular-nums w-11 text-center" aria-label={`Velocidade da voz ${Number(rate.toFixed(2))}`}>
              {Number(rate.toFixed(2))}x
            </span>
            <button className={chip} onClick={increaseSpeed} disabled={rate >= 1.3} aria-label="Voz mais rápida">
              🐇
            </button>
          </span>
        </div>
      </div>
    </div>
  );
}
