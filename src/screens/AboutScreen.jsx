import React from 'react';
import {
  Camera,
  CircleCheck,
  Contrast,
  Ear,
  Hand,
  Keyboard,
  Landmark,
  Lock,
  Mic,
  ScanSearch,
  Settings2,
  ShieldCheck,
  Stethoscope,
  Type,
  Volume2,
} from 'lucide-react';
import { BackLink, Button } from '../components/ui';

/**
 * Página "Como funciona": passos, regras de segurança e recursos de acessibilidade.
 * Fica fora da tela inicial para que o início mostre só as ações principais.
 * O menu abre esta página já rolada até a seção escolhida (como-funciona, seguranca ou acessibilidade).
 */

const STEPS = [
  { icon: Camera, title: 'Tire ou envie a foto', text: 'Da frente da caixa do remédio ou do papel do exame, com boa luz.' },
  { icon: ScanSearch, title: 'Confira o que eu li', text: 'Eu mostro o nome que li e pergunto: “Está certo?”. Toque em Sim ou Não.' },
  { icon: Volume2, title: 'Ouça a explicação', text: 'Só depois de você confirmar, eu explico em palavras simples. Toque em Ouvir para escutar.' },
];

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

export function AboutScreen({ onNavigate, onHome }) {
  return (
    <>
      <div className="bg-surface">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 pb-8">
          <BackLink onClick={onHome} />
          <h1 className="text-[2rem] md:text-[2.4rem] leading-tight font-bold">Como o Vivavós funciona</h1>
          <p className="mt-3 text-[1.1rem] max-w-2xl">
            Os passos de cada leitura, as regras de segurança que o Vivavós sempre segue e os recursos para deixar o site
            do seu jeito.
          </p>
        </div>
      </div>

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
            Remédios: bula registrada na ANVISA. Sem ela, só o registro oficial e o link da bula, sem orientar o uso.
            Exames: o valor esperado impresso no próprio laudo.
          </FeatureItem>
          <FeatureItem icon={Stethoscope} title="Não substitui o médico">
            As explicações ajudam a ler. Quem orienta o tratamento é o seu médico ou farmacêutico.
          </FeatureItem>
          <FeatureItem icon={Lock} title="Privacidade (LGPD)">
            Para ler, a foto é enviada à OpenAI, e o Vivavós não guarda as fotos. O histórico guarda só o texto, só
            neste aparelho, e você apaga quando quiser.
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
      <div className="bg-page border-t border-line">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
          <Button onClick={onHome} className="md:max-w-sm">
            Voltar ao início
          </Button>
        </div>
      </div>
    </>
  );
}
