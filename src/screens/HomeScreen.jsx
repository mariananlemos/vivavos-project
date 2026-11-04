import React, { useEffect, useCallback } from 'react';
import {
  Camera,
  CircleCheck,
  Ear,
  FileText,
  Hand,
  History,
  Keyboard,
  Landmark,
  Lock,
  Mic,
  Contrast,
  ScanSearch,
  Settings2,
  ShieldCheck,
  Stethoscope,
  Type,
  Volume2,
} from 'lucide-react';
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

function Section({ id, title, intro, tone = 'page', children }) {
  return (
    <section
      id={id}
      tabIndex={-1}
      aria-labelledby={`${id}-titulo`}
      className={`${tone === 'page' ? 'bg-page' : 'bg-surface'} border-t border-line scroll-mt-32 md:scroll-mt-24`}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <h2 id={`${id}-titulo`} className="text-[1.8rem] font-bold leading-tight">
          {title}
        </h2>
        {intro && <p className="mt-2 text-[1.05rem] text-muted max-w-2xl">{intro}</p>}
        <div className="mt-6">{children}</div>
      </div>
    </section>
  );
}

function FeatureItem({ icon: Icon, title, children }) {
  return (
    <li className="flex gap-4 p-4 rounded-lg bg-surface border-2 border-line">
      <span className="shrink-0 w-11 h-11 rounded-full bg-primary-soft text-primary flex items-center justify-center" aria-hidden="true">
        <Icon className="w-6 h-6" strokeWidth={2.25} />
      </span>
      <div>
        <h3 className="text-[1.15rem] font-bold leading-snug">{title}</h3>
        <p className="mt-1">{children}</p>
      </div>
    </li>
  );
}

const HOME_INSTRUCTIONS =
  'Toque em Foto do remédio para a caixa do remédio, ou em Foto do exame para o papel do exame. Depois, confira o que eu li e toque em Ouvir para escutar a explicação.';

const STEPS = [
  { icon: Camera, title: 'Tire ou envie a foto', text: 'Da frente da caixa do remédio ou do papel do exame, com boa luz.' },
  { icon: ScanSearch, title: 'Confira o que eu li', text: 'Eu mostro o nome que li e pergunto: “Está certo?”. Toque em Sim ou Não.' },
  { icon: Volume2, title: 'Ouça a explicação', text: 'Só depois de você confirmar, eu explico em palavras simples. Toque em Ouvir para escutar.' },
];

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
      </section>

      <Section id="como-funciona" title="Como funciona" intro="Três passos, sempre nesta ordem.">
        <ol className="grid gap-4 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <li key={step.title} className="p-5 rounded-lg bg-surface border-2 border-line">
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-md bg-ink text-surface font-bold flex items-center justify-center" aria-hidden="true">
                  {i + 1}
                </span>
                <step.icon className="w-7 h-7 text-primary" strokeWidth={2.25} aria-hidden="true" />
              </div>
              <h3 className="mt-3 text-[1.2rem] font-bold">{step.title}</h3>
              <p className="mt-1">{step.text}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section
        id="seguranca"
        tone="surface"
        title="Segurança em primeiro lugar"
        intro="Regras que o Vivavós segue em toda leitura."
      >
        <ul className="grid gap-4 md:grid-cols-2">
          <FeatureItem icon={ScanSearch} title="Nunca adivinha">
            Se a foto estiver borrada, escura ou cortada, eu peço outra foto em vez de chutar.
          </FeatureItem>
          <FeatureItem icon={CircleCheck} title="Confirma antes de explicar">
            Eu sempre mostro o que li e espero você confirmar que está certo.
          </FeatureItem>
          <FeatureItem icon={Landmark} title="Fonte oficial">
            Remédios: bula registrada na ANVISA. Exames: o valor esperado impresso no próprio laudo.
          </FeatureItem>
          <FeatureItem icon={Stethoscope} title="Não substitui o médico">
            As explicações ajudam a ler. Quem orienta o tratamento é o seu médico ou farmacêutico.
          </FeatureItem>
          <FeatureItem icon={Lock} title="Privacidade (LGPD)">
            As fotos são lidas na hora e apagadas em seguida. O histórico guarda só o texto, só neste aparelho, e você
            apaga quando quiser.
          </FeatureItem>
          <FeatureItem icon={ShieldCheck} title="Sem cadastro">
            Você não precisa criar conta nem informar dados pessoais.
          </FeatureItem>
        </ul>
      </Section>

      <Section
        id="acessibilidade"
        title="Acessibilidade"
        intro="O Vivavós segue as recomendações de acessibilidade do governo (eMAG) para que todos consigam usar."
      >
        <div className="mb-5 p-5 rounded-lg bg-primary-soft border-2 border-primary flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            <h3 className="text-[1.2rem] font-bold">Deixe o Vivavós do seu jeito</h3>
            <p className="mt-1">
              Cores, brilho, tipo e espaço da letra, volume e voz, legendas, lupa, toque, avisos e gestos: são 8 grupos de
              ajustes.
            </p>
          </div>
          <Button icon={Settings2} onClick={() => onNavigate('ajustes')} className="sm:w-auto shrink-0">
            Abrir os ajustes
          </Button>
        </div>
        <ul className="grid gap-4 md:grid-cols-2">
          <FeatureItem icon={Hand} title="Libras com o VLibras">
            Toque no ícone azul de mãos, no lado direito da tela, para ver o conteúdo traduzido para Libras.
          </FeatureItem>
          <FeatureItem icon={Ear} title="Voz em português do Brasil">
            A voz só fala quando você toca em um botão de ouvir. Use os botões 🐢 e 🐇 no topo da página para deixar a fala mais devagar ou mais
            rápida.
          </FeatureItem>
          <FeatureItem icon={Mic} title="Comandos de voz">
            Diga “sim”, “não”, “de novo”, “mais devagar” ou “mais rápido”. Funciona melhor no Google Chrome e no
            Microsoft Edge.
          </FeatureItem>
          <FeatureItem icon={Type} title="Letra maior">
            Use os botões A− e A+ no topo da página para mudar o tamanho da letra.
          </FeatureItem>
          <FeatureItem icon={Contrast} title="Alto contraste e outras cores">
            O botão “Contraste”, no topo, deixa o fundo preto e as letras em branco e amarelo. Nos ajustes há também as
            cores Escuro e Suave.
          </FeatureItem>
          <FeatureItem icon={Keyboard} title="Atalhos de teclado">
            Alt+1 vai para o conteúdo, Alt+2 para o menu e Alt+3 para o rodapé (no Firefox, Alt+Shift+número).
          </FeatureItem>
        </ul>
      </Section>
    </>
  );
}
