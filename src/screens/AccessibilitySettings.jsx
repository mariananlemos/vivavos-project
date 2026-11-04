import React, { useState } from 'react';
import { BellRing, Captions, RotateCcw, Volume2 } from 'lucide-react';
import { BackLink, Button, Notice } from '../components/ui';
import { ChoiceGroup, Stepper, Switch } from '../components/controls';
import { MIN_FONT, MAX_FONT } from '../hooks/useAccessibility';

const SAMPLE_SPEECH =
  'Olá! Esta é a voz do Vivavós. Assim eu leio a caixa do seu remédio. E assim eu explico o resultado do seu exame.';

/**
 * As 8 categorias de diretrizes de acessibilidade. Cada grupo é uma subcategoria;
 * cada controle muda uma preferência (ver DEFAULT_PREFS em hooks/useAccessibility.js).
 */
const CATEGORIES = [
  {
    id: 'ambiente',
    title: 'Ambiente',
    plain: 'você ajusta a “aparência geral” do app: cores, brilho, movimento e tempo para agir.',
    groups: [
      {
        title: 'Personalização de Cores',
        controls: [
          {
            type: 'choice',
            key: 'theme',
            label: 'Cores da tela',
            options: [
              { value: 'padrao', label: 'Padrão', hint: 'Fundo branco e azul' },
              { value: 'alto-contraste', label: 'Alto contraste', hint: 'Fundo preto, letras brancas e amarelas' },
              { value: 'escuro', label: 'Escuro', hint: 'Bom para usar à noite' },
              { value: 'suave', label: 'Suave', hint: 'Fundo creme, cansa menos a vista' },
            ],
          },
        ],
      },
      {
        title: 'Brilho e Animação',
        controls: [
          {
            type: 'choice',
            key: 'dim',
            label: 'Brilho da tela',
            options: [
              { value: 0, label: 'Normal' },
              { value: 1, label: 'Um pouco mais escuro' },
              { value: 2, label: 'Mais escuro' },
              { value: 3, label: 'Bem escuro' },
            ],
          },
          { type: 'switch', key: 'reduceMotion', label: 'Parar animações', help: 'Tira os movimentos e efeitos da tela.' },
        ],
      },
      {
        title: 'Orientação e Tempo',
        note: 'O Vivavós funciona com o celular em pé ou deitado, e nenhuma tela tem tempo para acabar.',
        controls: [
          {
            type: 'choice',
            key: 'answerTime',
            label: 'Tempo para responder por voz',
            help: 'Quando o Vivavós pergunta “Está certo?”, quanto tempo o microfone espera você falar.',
            options: [
              { value: 'normal', label: 'Normal' },
              { value: 'longo', label: 'Mais tempo' },
              { value: 'muito-longo', label: 'Muito mais tempo' },
            ],
          },
          {
            type: 'choice',
            key: 'toastTime',
            label: 'Tempo dos avisos na tela',
            options: [
              { value: 'normal', label: 'Somem em 6 segundos' },
              { value: 'longo', label: 'Somem em 15 segundos' },
              { value: 'fixo', label: 'Ficam até eu fechar' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'texto',
    title: 'Texto',
    plain: 'você escolhe como quer ler: tipo de letra, tamanho, negrito, cor e espaço entre linhas e letras.',
    preview: true,
    groups: [
      {
        title: 'Tipografia e Estilo',
        controls: [
          {
            type: 'choice',
            key: 'fontFamily',
            label: 'Tipo de letra',
            options: [
              { value: 'atkinson', label: 'Atkinson', hint: 'Padrão. Feita para quem enxerga pouco' },
              { value: 'lexend', label: 'Lexend', hint: 'Letras mais largas e abertas' },
              { value: 'sistema', label: 'Verdana', hint: 'Letra comum do computador' },
            ],
          },
          { type: 'fontSize' },
          { type: 'switch', key: 'boldText', label: 'Letras mais grossas (negrito)' },
          {
            type: 'choice',
            key: 'inkColor',
            label: 'Cor da letra',
            help: 'Vale para as cores de tela Padrão e Suave.',
            options: [
              { value: 'padrao', label: 'Padrão' },
              { value: 'preto', label: 'Preto' },
              { value: 'azul', label: 'Azul-escuro' },
              { value: 'marrom', label: 'Marrom' },
            ],
          },
        ],
      },
      {
        title: 'Métricas de Leitura',
        controls: [
          {
            type: 'choice',
            key: 'lineSpacing',
            label: 'Espaço entre as linhas',
            options: [
              { value: 'normal', label: 'Normal' },
              { value: 'amplo', label: 'Maior' },
              { value: 'muito-amplo', label: 'Bem maior' },
            ],
          },
          {
            type: 'choice',
            key: 'letterSpacing',
            label: 'Espaço entre as letras e palavras',
            options: [
              { value: 'normal', label: 'Normal' },
              { value: 'amplo', label: 'Maior' },
              { value: 'muito-amplo', label: 'Bem maior' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'som',
    title: 'Som',
    plain: 'o app conversa bem com quem usa o ouvido: dá para controlar os sons e ajustar como a voz lê a tela.',
    groups: [
      {
        title: 'Controle de Áudio',
        controls: [
          {
            type: 'switch',
            key: 'autoSpeak',
            label: 'Falar sozinho ao abrir cada tela',
            help: 'Desligado, o Vivavós só fala quando você toca em “Ouvir”.',
          },
          {
            type: 'choice',
            key: 'volume',
            label: 'Volume da voz',
            options: [
              { value: 0.4, label: 'Baixo' },
              { value: 0.7, label: 'Médio' },
              { value: 1, label: 'Alto' },
            ],
          },
          { type: 'speechRate' },
          {
            type: 'switch',
            key: 'sounds',
            label: 'Bipes do microfone',
            help: 'Um bipe quando o microfone abre e outro quando fecha.',
          },
        ],
      },
      {
        title: 'Leitor de Tela (Básico)',
        controls: [
          {
            type: 'choice',
            key: 'readOnTouch',
            label: 'Ler em voz alta o que eu tocar',
            help: 'Com o teclado, lê o item em que você está.',
            options: [
              { value: 'off', label: 'Desligado' },
              { value: 'textos', label: 'Ler os textos que eu tocar', hint: 'Os botões funcionam normalmente' },
              { value: 'tudo', label: 'Ler tudo antes de escolher', hint: '1º toque lê o botão, 2º toque escolhe' },
            ],
          },
        ],
      },
      {
        title: 'Leitor de Tela (Avançado)',
        controls: [
          {
            type: 'choice',
            key: 'voiceEngine',
            label: 'Voz usada',
            options: [
              { value: 'natural', label: 'Voz natural', hint: 'Parece mais uma pessoa. Usa a internet' },
              { value: 'aparelho', label: 'Voz do aparelho', hint: 'Responde mais rápido' },
            ],
          },
          {
            type: 'choice',
            key: 'pitch',
            label: 'Tom da voz do aparelho',
            options: [
              { value: 0.8, label: 'Mais grave' },
              { value: 1, label: 'Normal' },
              { value: 1.2, label: 'Mais agudo' },
            ],
          },
          { type: 'test', action: 'voice', label: 'Ouvir um exemplo', icon: Volume2 },
        ],
      },
      {
        title: 'Leitura ao Digitar',
        controls: [
          {
            type: 'choice',
            key: 'typingEcho',
            label: 'Falar o que eu digito',
            options: [
              { value: 'off', label: 'Desligado' },
              { value: 'letra', label: 'Cada letra' },
              { value: 'palavra', label: 'Cada palavra' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'video',
    title: 'Vídeo e Legendas',
    plain: 'tudo o que o Vivavós fala aparece escrito na tela (legenda) e pode ser visto em Libras; a legenda pode ser ajustada.',
    groups: [
      {
        title: 'Configuração de Legendas',
        controls: [
          {
            type: 'switch',
            key: 'captions',
            label: 'Mostrar legenda da voz',
            help: 'Escreve na tela a frase que o Vivavós está falando.',
          },
          {
            type: 'choice',
            key: 'captionSize',
            label: 'Tamanho da legenda',
            options: [
              { value: 'normal', label: 'Normal' },
              { value: 'grande', label: 'Grande' },
              { value: 'enorme', label: 'Enorme' },
            ],
          },
          {
            type: 'choice',
            key: 'captionStyle',
            label: 'Cor da legenda',
            options: [
              { value: 'escuro', label: 'Letra branca, fundo preto' },
              { value: 'claro', label: 'Letra preta, fundo branco' },
            ],
          },
          { type: 'test', action: 'voice', label: 'Testar a legenda', icon: Captions },
        ],
      },
      {
        title: 'Recursos Especiais',
        note: 'Toda imagem do Vivavós tem uma descrição em texto, que o leitor de tela fala (audiodescrição).',
        controls: [
          {
            type: 'switch',
            key: 'showLibras',
            label: 'Mostrar o botão de Libras (VLibras)',
            help: 'O ícone azul de mãos, no lado direito da tela, traduz o conteúdo para Libras.',
          },
        ],
      },
    ],
  },
  {
    id: 'zoom',
    title: 'Zoom',
    plain: 'você amplia a tela inteira ou só um pedaço, e a lupa acompanha o que você está fazendo.',
    groups: [
      {
        title: 'Ampliação de Conteúdo',
        note: 'No celular, também dá para aproximar e afastar com dois dedos.',
        controls: [
          {
            type: 'choice',
            key: 'pageZoom',
            label: 'Tamanho de tudo na tela',
            options: [
              { value: 100, label: 'Normal (100%)' },
              { value: 125, label: 'Maior (125%)' },
              { value: 150, label: 'Bem maior (150%)' },
            ],
          },
          {
            type: 'switch',
            key: 'magnifier',
            label: 'Lupa',
            help: 'Mostra bem grande, numa faixa, o texto do que você tocar ou passar o mouse.',
          },
          {
            type: 'choice',
            key: 'magnifierSize',
            label: 'Tamanho da letra na lupa',
            options: [
              { value: 'grande', label: 'Grande' },
              { value: 'enorme', label: 'Enorme' },
            ],
          },
        ],
      },
      {
        title: 'Navegação do Foco',
        controls: [
          {
            type: 'choice',
            key: 'magnifierFollow',
            label: 'A lupa acompanha',
            options: [
              { value: 'tudo', label: 'O dedo, o mouse e o teclado' },
              { value: 'foco', label: 'Só o teclado' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'entrada',
    title: 'Entrada de Dados',
    plain: 'fica mais fácil tocar, digitar e saber onde se está: cursor visível, toques mais tolerantes e menos coisa para digitar.',
    groups: [
      {
        title: 'Cursor e Visualização',
        controls: [
          { type: 'switch', key: 'bigCursor', label: 'Cursor do mouse grande' },
          {
            type: 'switch',
            key: 'strongFocus',
            label: 'Destacar bem onde estou',
            help: 'Ao usar o teclado, o item escolhido ganha uma moldura amarela e escura bem grossa.',
          },
        ],
      },
      {
        title: 'Controle de Toque',
        controls: [
          { type: 'switch', key: 'bigTargets', label: 'Botões e campos maiores' },
          {
            type: 'choice',
            key: 'tapGuard',
            label: 'Ignorar toque repetido sem querer',
            help: 'Para mãos que tremem: um segundo toque logo depois do primeiro não conta.',
            options: [
              { value: 0, label: 'Desligado' },
              { value: 600, label: 'Meio segundo' },
              { value: 1200, label: 'Um segundo' },
            ],
          },
        ],
      },
      {
        title: 'Preenchimento',
        controls: [
          {
            type: 'switch',
            key: 'suggestions',
            label: 'Sugestões ao digitar',
            help: 'Ao anotar no Histórico, o Vivavós sugere nomes de remédios e exames para você digitar menos.',
          },
        ],
      },
    ],
  },
  {
    id: 'avisos',
    title: 'Notificações e Alertas',
    plain: 'os avisos chegam por mais de um caminho: voz, tela piscando, som e vibração.',
    groups: [
      {
        title: 'Feedback Multimodal',
        controls: [
          { type: 'switch', key: 'alertVoice', label: 'Falar o aviso' },
          { type: 'switch', key: 'alertFlash', label: 'Piscar a tela', help: 'A tela pisca em amarelo duas vezes, devagar.' },
          { type: 'switch', key: 'alertSound', label: 'Tocar um som' },
          { type: 'switch', key: 'alertVibrate', label: 'Vibrar o celular', help: 'Funciona na maioria dos celulares Android.' },
          { type: 'test', action: 'alert', label: 'Testar um aviso', icon: BellRing },
        ],
      },
    ],
  },
  {
    id: 'gestos',
    title: 'Gestos',
    plain: 'você escolhe quais gestos ou movimentos usar para navegar no app.',
    groups: [
      {
        title: 'Navegação por Movimento',
        note: 'Todo gesto é opcional: sempre existe um botão que faz a mesma coisa.',
        controls: [
          {
            type: 'switch',
            key: 'swipeBack',
            label: 'Deslizar o dedo para a direita para voltar',
          },
          {
            type: 'switch',
            key: 'shakeToStop',
            label: 'Chacoalhar o celular para parar a voz',
          },
        ],
      },
    ],
  },
];

const countControls = (category) =>
  category.groups.reduce((sum, g) => sum + g.controls.filter((c) => c.type !== 'test').length, 0);

const plural = (n) => `${n} ${n === 1 ? 'ajuste' : 'ajustes'}`;

function NumberBadge({ n, className = '' }) {
  return (
    <span
      aria-hidden="true"
      className={`shrink-0 rounded-full bg-primary text-on-primary font-bold flex items-center justify-center ${className}`}
    >
      {n}
    </span>
  );
}

function GroupChip({ children }) {
  return (
    <span className="inline-flex items-center px-3 py-0.5 rounded-full border-2 border-line text-[0.85rem] font-bold text-primary">
      {children}
    </span>
  );
}

/** Cartão da visão geral, como no quadro de diretrizes: número, nome, "em outras palavras" e subcategorias */
function OverviewCard({ category, n }) {
  const count = countControls(category);
  return (
    <li className="flex flex-col gap-3 p-5 rounded-lg bg-surface border-2 border-line">
      <div className="flex items-center gap-3">
        <NumberBadge n={n} className="w-10 h-10 text-[1.1rem]" />
        <h3 className="flex-1 text-[1.3rem] font-bold leading-tight">{category.title}</h3>
        <span className="shrink-0 px-2.5 py-0.5 rounded-md bg-primary-soft text-primary text-[0.85rem] font-bold">
          {plural(count)}
        </span>
      </div>
      <p>
        <strong>Em outras palavras:</strong> {category.plain}
      </p>
      <ul className="flex flex-wrap gap-2" aria-label="Partes desta categoria">
        {category.groups.map((g) => (
          <li key={g.title}>
            <GroupChip>{g.title}</GroupChip>
          </li>
        ))}
      </ul>
      <a href={`#ajuste-${category.id}`} className="mt-auto font-bold text-primary underline underline-offset-2 hover:no-underline">
        Ver os {plural(count)} de {category.title}
      </a>
    </li>
  );
}

function TextPreview() {
  return (
    <div className="p-4 rounded-lg border-2 border-dashed border-strong bg-page" aria-label="Exemplo de texto com os ajustes atuais">
      <p className="text-[0.85rem] font-bold text-muted mb-1">Assim fica o texto:</p>
      <p className="text-[1.25rem] font-bold">Losartana 50 mg</p>
      <p>Tome 1 comprimido por dia, de manhã, com um copo de água. Não pare de tomar sem falar com o seu médico.</p>
    </div>
  );
}

export function AccessibilitySettings({ accessibility, tts, notify, onHome }) {
  const { prefs, setPref, resetPrefs, increaseFontSize, decreaseFontSize } = accessibility;
  const [confirmReset, setConfirmReset] = useState(false);

  const handleChange = async (key, value) => {
    // No iPhone, o movimento do celular só pode ser lido depois que a pessoa autoriza
    if (key === 'shakeToStop' && value && typeof window.DeviceMotionEvent?.requestPermission === 'function') {
      try {
        if ((await window.DeviceMotionEvent.requestPermission()) !== 'granted') throw new Error('negado');
      } catch {
        notify('Não tenho permissão para sentir o movimento do celular.', { tone: 'warn' });
        return;
      }
    }
    setPref(key, value);
  };

  const runTest = (action) => {
    if (action === 'alert') notify('Este é um aviso de teste do Vivavós.', { tone: 'info' });
    else tts.speak(SAMPLE_SPEECH, null, { manual: true });
  };

  const handleReset = () => {
    resetPrefs();
    setConfirmReset(false);
    notify('Pronto! Os ajustes voltaram ao padrão.');
  };

  const renderControl = (control) => {
    switch (control.type) {
      case 'choice':
        return (
          <ChoiceGroup
            legend={control.label}
            help={control.help}
            value={prefs[control.key]}
            options={control.options}
            onChange={(v) => handleChange(control.key, v)}
          />
        );
      case 'switch':
        return (
          <Switch
            label={control.label}
            help={control.help}
            checked={Boolean(prefs[control.key])}
            onChange={(v) => handleChange(control.key, v)}
          />
        );
      case 'fontSize':
        return (
          <Stepper
            label="Tamanho da letra"
            valueText={prefs.fontSize === 18 ? '18 (padrão)' : String(prefs.fontSize)}
            onDecrease={decreaseFontSize}
            onIncrease={increaseFontSize}
            canDecrease={prefs.fontSize > MIN_FONT}
            canIncrease={prefs.fontSize < MAX_FONT}
            decreaseLabel="Diminuir a letra"
            increaseLabel="Aumentar a letra"
            decreaseText="A−"
            increaseText="A+"
          />
        );
      case 'speechRate':
        return (
          <Stepper
            label="Velocidade da voz"
            valueText={`${Number(tts.rate.toFixed(2))}x`}
            onDecrease={tts.decreaseSpeed}
            onIncrease={tts.increaseSpeed}
            canDecrease={tts.rate > 0.6}
            canIncrease={tts.rate < 1.3}
            decreaseLabel="Voz mais devagar"
            increaseLabel="Voz mais rápida"
            decreaseText="🐢"
            increaseText="🐇"
          />
        );
      case 'test':
        return (
          <Button variant="accent" icon={control.icon} onClick={() => runTest(control.action)} className="sm:max-w-xs">
            {control.label}
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-page border-t border-line">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 md:py-12">
        <BackLink onClick={onHome} />
        <h1 className="text-[2rem] leading-tight font-bold">Ajustes de acessibilidade</h1>
        <p className="mt-2 text-[1.1rem] max-w-2xl">
          Deixe o Vivavós do seu jeito. Cada mudança vale na hora e fica guardada neste aparelho.
        </p>

        {/* Visão geral: as 8 categorias */}
        <h2 className="sr-only">Categorias</h2>
        <ul className="mt-6 grid gap-4 md:grid-cols-2">
          {CATEGORIES.map((category, i) => (
            <OverviewCard key={category.id} category={category} n={i + 1} />
          ))}
        </ul>

        {/* Ajustes de cada categoria */}
        {CATEGORIES.map((category, i) => (
          <section
            key={category.id}
            id={`ajuste-${category.id}`}
            tabIndex={-1}
            aria-labelledby={`ajuste-${category.id}-titulo`}
            className="mt-10 scroll-mt-4"
          >
            <div className="flex items-center gap-3">
              <NumberBadge n={i + 1} className="w-11 h-11 text-[1.2rem]" />
              <h2 id={`ajuste-${category.id}-titulo`} className="text-[1.7rem] font-bold leading-tight">
                {category.title}
              </h2>
            </div>
            <p className="mt-2 max-w-2xl">
              <strong>Em outras palavras:</strong> {category.plain}
            </p>

            <div className="mt-4 space-y-4">
              {category.preview && <TextPreview />}
              {category.groups.map((group) => (
                <div key={group.title} className="rounded-lg bg-surface border-2 border-line">
                  <h3 className="px-5 pt-4">
                    <GroupChip>{group.title}</GroupChip>
                  </h3>
                  {group.note && <p className="px-5 pt-2 text-[0.95rem] text-muted">{group.note}</p>}
                  <ul className="divide-y-2 divide-line">
                    {group.controls.map((control, j) => (
                      <li key={control.key || `${control.type}-${j}`} className="px-5 py-4">
                        {renderControl(control)}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        ))}

        <section aria-labelledby="ajuste-padrao-titulo" className="mt-10 p-5 rounded-lg bg-surface border-2 border-line">
          <h2 id="ajuste-padrao-titulo" className="text-[1.3rem] font-bold">
            Voltar tudo ao padrão
          </h2>
          <p className="mt-1">Desfaz todos os ajustes desta página. A velocidade da voz continua como está.</p>
          {confirmReset ? (
            <div className="mt-4 space-y-3">
              <Notice label="Tem certeza?">Todos os ajustes voltam a ser como no primeiro uso.</Notice>
              <div className="grid gap-3 sm:grid-cols-2">
                <Button icon={RotateCcw} onClick={handleReset}>
                  Sim, voltar ao padrão
                </Button>
                <Button variant="outline" onClick={() => setConfirmReset(false)}>
                  Não, manter como está
                </Button>
              </div>
            </div>
          ) : (
            <Button variant="outlinePrimary" icon={RotateCcw} onClick={() => setConfirmReset(true)} className="mt-4 sm:max-w-xs">
              Voltar ao padrão
            </Button>
          )}
        </section>
      </div>
    </div>
  );
}
