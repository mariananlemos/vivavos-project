import React, { useEffect, useCallback } from 'react';
import { Camera, ChevronRight, FileText, History, Lock, Mic, Stethoscope, Volume2 } from 'lucide-react';
import { Button } from '../components/ui';

function normalize(text) {
  return (text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

function ChoiceCard({ icon: Icon, title, subtitle, filled, onClick, ariaLabel }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={`text-left rounded-lg p-5 min-h-[10rem] flex flex-col justify-between gap-4 transition active:scale-[0.98] ${
        filled
          ? 'bg-primary text-on-primary border-2 border-primary hover:brightness-110'
          : 'bg-surface text-ink border-2 border-strong hover:bg-page'
      }`}
    >
      <span
        aria-hidden="true"
        className={`w-12 h-12 rounded-full flex items-center justify-center ${
          filled ? 'bg-primary-icon text-on-primary' : 'bg-primary-soft text-primary'
        }`}
      >
        <Icon className="w-6 h-6" strokeWidth={2.25} />
      </span>
      <span>
        <span className="block text-[1.45rem] font-bold leading-tight">{title}</span>
        <span className="block text-[1rem] mt-1 opacity-95">{subtitle}</span>
      </span>
    </button>
  );
}

const HOME_INSTRUCTIONS =
  'Toque em Foto do remédio para a caixa do remédio, ou em Foto do exame para o papel do exame. Depois, confira o que eu li e toque em Ouvir para escutar a explicação.';

export function HomeScreen({ onPickPhoto, onNavigate, historyCount, tts, voice, commandHandlerRef }) {
  const { speak, stop } = tts;

  // Pela voz não dá para abrir a câmera (o navegador exige um toque), então orientamos qual botão tocar
  const handleVoiceCommand = useCallback(
    (command) => {
      const text = normalize(command.text);
      // Ir para outra página não precisa de toque, então a voz já pode abrir
      if (text.includes('historico')) {
        onNavigate('historico');
      } else if (text.includes('ajuste') || text.includes('acessibilidade')) {
        onNavigate('ajustes');
      } else if (text.includes('exame')) {
        speak('Para o exame, toque no botão branco, Foto do exame, e mostre o papel bem de frente.', null, { manual: true });
      } else if (text.includes('remedio') || text.includes('caixa') || text.includes('bula')) {
        speak('Para o remédio, toque no botão azul, Foto do remédio, e mostre a caixa bem de frente.', null, { manual: true });
      } else {
        speak(
          'Toque em Foto do remédio para a caixa do remédio, ou em Foto do exame para o papel do exame. Para ver o que você já conferiu, diga: histórico.',
          null,
          { manual: true }
        );
      }
    },
    [speak, onNavigate]
  );

  useEffect(() => {
    if (!commandHandlerRef) return;
    commandHandlerRef.current = handleVoiceCommand;
    return () => {
      commandHandlerRef.current = null;
    };
  }, [commandHandlerRef, handleVoiceCommand]);

  const handleTalk = () => {
    stop();
    voice.startListening();
  };

  return (
    <>
      {/* Início: ação principal */}
      <section id="inicio" tabIndex={-1} aria-labelledby="inicio-titulo" className="bg-surface scroll-mt-32 md:scroll-mt-24">
        {/* No celular: título, cards, voz. No computador: título e voz à esquerda, cards à direita */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 md:py-14 grid gap-x-10 gap-y-6 md:grid-cols-[1fr_1.15fr] md:items-center">
          <div className="md:self-end">
            <h1 id="inicio-titulo" className="text-[2rem] md:text-[2.4rem] leading-tight font-bold">
              O que você quer entender hoje?
            </h1>
            <p className="mt-3 text-[1.1rem] max-w-md">
              Mostre a caixa do remédio ou o papel do exame. O Vivavós lê e explica com palavras simples. Se quiser, toque para ouvir.
            </p>
          </div>

          <div className="md:col-start-2 md:row-start-1 md:row-span-2">
            <div className="grid grid-cols-1 min-[420px]:grid-cols-2 gap-3 sm:gap-4">
              <ChoiceCard
                filled
                icon={Camera}
                title="Foto do remédio"
                subtitle="Mostre a caixa e eu explico."
                ariaLabel="Foto do remédio. Mostre a caixa e eu explico."
                onClick={() => onPickPhoto('medicine')}
              />
              <ChoiceCard
                icon={FileText}
                title="Foto do exame"
                subtitle="Mostre o papel e eu explico."
                ariaLabel="Foto do exame. Mostre o papel e eu explico."
                onClick={() => onPickPhoto('exam')}
              />
            </div>
            <p className="mt-3 text-[0.9rem] text-muted">Pode tirar a foto agora ou escolher uma que já está no celular.</p>
            <a
              href="#historico"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('historico');
              }}
              className="mt-4 flex items-center gap-3 min-h-[3.5rem] px-4 py-2 rounded-lg border-2 border-line bg-page hover:border-strong"
            >
              <History className="w-6 h-6 shrink-0 text-primary" strokeWidth={2.25} aria-hidden="true" />
              <span className="flex-1">
                <span className="block font-bold text-primary">Meu histórico</span>
                <span className="block text-[0.9rem] text-muted">
                  {historyCount > 0
                    ? `${historyCount} ${historyCount === 1 ? 'remédio ou exame guardado' : 'remédios e exames guardados'}`
                    : 'Remédios e exames que você conferir ficam aqui'}
                </span>
              </span>
            </a>
          </div>

          <div className="md:self-start">
            <p className="mb-2 text-[0.95rem]">Ou diga: “Vivavós, que remédio é esse?”</p>
            <Button variant="accent" icon={Mic} onClick={handleTalk} className="min-h-[3.75rem] text-[1.25rem] md:max-w-sm">
              Toque e fale
            </Button>
            <Button
              variant="outline"
              icon={Volume2}
              onClick={() => speak(HOME_INSTRUCTIONS, null, { manual: true })}
              className="mt-3 md:max-w-sm"
            >
              Ouvir as instruções
            </Button>
            {voice.error && (
              <p role="alert" className="mt-2 text-[0.9rem] font-bold text-danger">
                {voice.error}
              </p>
            )}
          </div>
        </div>

        {/* Confiança antes de enviar a foto; os detalhes ficam na página Como funciona */}
        <div className="border-t border-line bg-page">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex flex-col md:flex-row md:items-center gap-x-6 gap-y-2 text-[0.95rem]">
            <span className="flex items-center gap-2">
              <Stethoscope className="w-5 h-5 shrink-0 text-primary" strokeWidth={2.25} aria-hidden="true" />
              Não substitui o médico
            </span>
            <span className="flex items-center gap-2">
              <Lock className="w-5 h-5 shrink-0 text-primary" strokeWidth={2.25} aria-hidden="true" />
              Não guardamos suas fotos
            </span>
            <a
              href="#como-funciona"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('como-funciona');
              }}
              className="md:ml-auto inline-flex items-center gap-1 min-h-[2.75rem] font-bold text-primary underline underline-offset-2 hover:no-underline"
            >
              Saiba como funciona
              <ChevronRight className="w-5 h-5" strokeWidth={2.5} aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
