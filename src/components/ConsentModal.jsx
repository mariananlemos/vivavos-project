import React, { useState } from 'react';
import { ArrowLeft, Check, History, Lock, Send, Volume2, X } from 'lucide-react';
import { Button } from './ui';

const CONSENT_TEXT =
  'Para ler a foto do remédio ou do exame, o Vivavós envia a foto a um serviço de inteligência artificial, a OpenAI. A foto é usada só para essa leitura, e o Vivavós não guarda suas fotos. Não pedimos nome nem cadastro. O que você confirmar fica no seu histórico, só neste aparelho, e você pode apagar quando quiser. Você concorda em continuar? Diga Concordo ou toque no botão azul.';

const DECLINED_TEXT =
  'Tudo bem. Sem o seu aceite, o Vivavós não consegue ler fotos, porque a leitura precisa enviar a foto à OpenAI. Nada foi enviado. Se mudar de ideia, toque em Voltar ao aviso.';

export function ConsentModal({ isOpen, onAccept, tts, voice }) {
  const [declined, setDeclined] = useState(false);

  // Só fala quando a pessoa pede; depois do aviso, o microfone abre para ouvir "Concordo"
  const handleListen = () =>
    tts.speak(declined ? DECLINED_TEXT : CONSENT_TEXT, declined ? undefined : () => voice.startListening(), {
      manual: true,
    });

  const handleDecline = () => {
    tts.stop();
    setDeclined(true);
  };

  const handleBack = () => {
    tts.stop();
    setDeclined(false);
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="consent-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
    >
      <div className="w-full max-w-[30rem] rounded-lg bg-surface text-ink border-t-[6px] border-primary shadow-card p-6">
        {declined ? (
          <>
            <h2 id="consent-title" className="text-[1.5rem] font-bold leading-tight mb-4">
              Tudo bem
            </h2>
            <p className="mb-3">
              Sem o seu aceite, o Vivavós <strong>não consegue ler fotos</strong>, porque a leitura precisa enviar a
              foto à OpenAI.
            </p>
            <p className="mb-6">Nada foi enviado. Se mudar de ideia, é só voltar ao aviso.</p>

            <Button icon={ArrowLeft} onClick={handleBack}>
              Voltar ao aviso
            </Button>
            <Button variant="accent" icon={Volume2} onClick={handleListen} className="mt-3">
              Ouvir este aviso
            </Button>
          </>
        ) : (
          <>
            <h2 id="consent-title" className="text-[1.5rem] font-bold leading-tight mb-4">
              Antes de começar
            </h2>

            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-3">
                <Send className="w-6 h-6 shrink-0 mt-0.5 text-primary" aria-hidden="true" />
                <span>
                  Para ler a foto do remédio ou do exame, o Vivavós a envia a um serviço de inteligência artificial, a{' '}
                  <strong>OpenAI</strong>. A foto é usada só para essa leitura.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Lock className="w-6 h-6 shrink-0 mt-0.5 text-primary" aria-hidden="true" />
                <span>
                  O Vivavós <strong>não guarda suas fotos</strong>. Não pedimos nome nem cadastro.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <History className="w-6 h-6 shrink-0 mt-0.5 text-primary" aria-hidden="true" />
                <span>
                  O que você confirmar fica no seu <strong>histórico, só neste aparelho</strong>. Você pode desligar ou
                  apagar quando quiser.
                </span>
              </li>
            </ul>

            <Button icon={Check} onClick={onAccept} aria-label="Concordo e quero continuar">
              Concordo e continuar
            </Button>
            <Button variant="accent" icon={Volume2} onClick={handleListen} className="mt-3">
              Ouvir este aviso
            </Button>
            <Button variant="outline" icon={X} onClick={handleDecline} className="mt-3">
              Não concordo
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
