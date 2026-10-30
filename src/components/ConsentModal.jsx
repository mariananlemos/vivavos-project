import React from 'react';
import { Check, Lock, Volume2 } from 'lucide-react';
import { Button } from './ui';

const CONSENT_TEXT =
  'Para sua segurança e privacidade, a foto do remédio ou do exame é lida na hora e apagada em seguida. Nenhuma foto ou dado pessoal fica guardado. Você concorda em continuar? Diga Concordo ou toque no botão azul.';

export function ConsentModal({ isOpen, onAccept, tts, voice }) {
  // Só fala quando a pessoa pede; depois do aviso, o microfone abre para ouvir "Concordo"
  const handleListen = () => tts.speak(CONSENT_TEXT, () => voice.startListening());

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="consent-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
    >
      <div className="w-full max-w-[30rem] rounded-lg bg-surface text-ink border-t-[6px] border-primary shadow-card p-6">
        <h2 id="consent-title" className="text-[1.5rem] font-bold leading-tight mb-4">
          Antes de começar
        </h2>

        <ul className="space-y-3 mb-6">
          <li className="flex items-start gap-3">
            <Lock className="w-6 h-6 shrink-0 mt-0.5 text-primary" aria-hidden="true" />
            <span>
              A foto do remédio ou do exame é lida na hora e <strong>apagada em seguida</strong>.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <Check className="w-6 h-6 shrink-0 mt-0.5 text-primary" aria-hidden="true" />
            <span>Nenhuma foto ou dado pessoal fica guardado.</span>
          </li>
        </ul>

        <Button icon={Check} onClick={onAccept} aria-label="Concordo e quero continuar">
          Concordo e continuar
        </Button>
        <Button variant="accent" icon={Volume2} onClick={handleListen} className="mt-3">
          Ouvir este aviso
        </Button>
      </div>
    </div>
  );
}
