import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Camera, Check, Loader2, Volume2 } from 'lucide-react';
import { compressImage } from '../utils/imageCompressor';
import { BackLink, Button, Divider, Notice, PhotoFrame, SmallPrint, Title } from '../components/ui';
import { MedicineResult, medicineSpeech } from './MedicineResult';
import { ExamResult, examSpeech } from './ExamResult';

const FLOWS = {
  medicine: {
    endpoint: '/api/identify-medicine',
    retakeHint: 'Tire a foto da frente da caixa, com boa luz.',
    Result: MedicineResult,
    resultSpeech: medicineSpeech,
  },
  exam: {
    endpoint: '/api/identify-exam',
    retakeHint: 'Tire a foto do papel bem de frente, com boa luz e sem cortar os números.',
    Result: ExamResult,
    resultSpeech: examSpeech,
  },
};

/**
 * Fluxo comum às fotos de remédio e de exame:
 * PROCESSING → (ILLEGIBLE | CONFIRMING) → RESULT, com RETAKE e ERROR como saídas.
 * Nada é explicado antes de a pessoa confirmar o que foi lido.
 */
export function PhotoFlow({ kind, file, onRetake, onHome, tts, voice, commandHandlerRef }) {
  const flow = FLOWS[kind];
  const { speak, stop } = tts;
  const { startListening, stopListening } = voice;

  const [phase, setPhase] = useState('PROCESSING');
  const [preview, setPreview] = useState(null);
  const [data, setData] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  // Evita que uma resposta antiga (foto anterior ou tela já fechada) mude a tela atual
  const requestIdRef = useRef(0);

  useEffect(() => {
    if (!file) return;
    const requestId = ++requestIdRef.current;
    const isCurrent = () => requestIdRef.current === requestId;

    (async () => {
      try {
        setPhase('PROCESSING');
        setData(null);
        setErrorMessage(null);
        setPreview(null);
        stop();

        // 1. Redução da imagem no cliente (Canvas API)
        const compressed = await compressImage(file, { maxWidth: 1600, maxHeight: 1600, quality: 0.82 });
        if (!isCurrent()) return;
        setPreview(compressed.base64);

        // 2. Envio para a função serverless
        const response = await fetch(flow.endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: compressed.base64, userConsent: true }),
        });
        const result = await response.json().catch(() => ({}));
        if (!isCurrent()) return;

        if (!response.ok) {
          throw new Error(result?.error?.message || 'Falha ao analisar a imagem no servidor.');
        }

        setData(result);

        // Regra 1: foto ilegível ou borrada → nunca adivinha, pede outra
        if (!result.isLegible) {
          setPhase('ILLEGIBLE');
          return;
        }

        // Regra 2: confirmação OBRIGATÓRIA antes de qualquer explicação
        setPhase('CONFIRMING');
      } catch (err) {
        if (!isCurrent()) return;
        console.error('Erro no processamento da imagem:', err);
        setErrorMessage(err.message || 'Ocorreu um erro ao processar a foto.');
        setPhase('ERROR');
      }
    })();
  }, [file]);

  // Invalida respostas pendentes quando a tela é fechada
  useEffect(() => () => void requestIdRef.current++, []);

  const handleConfirm = () => {
    if (!data) return;
    stop();
    stopListening();
    setPhase('RESULT');
  };

  const handleRejectByVoice = () => {
    stop();
    stopListening();
    setPhase('RETAKE');
  };

  const handleRepeatConfirmation = () => {
    if (!data?.confirmation) return;
    stopListening();
    speak(data.confirmation.voiceText, () => startListening());
  };

  const handleListenResult = () => {
    if (data) speak(flow.resultSpeech(data));
  };

  const handleRetake = () => {
    stop();
    stopListening();
    onRetake();
  };

  const handleHome = () => {
    stop();
    stopListening();
    onHome();
  };

  const handleVoiceCommand = useCallback(
    (command) => {
      if (phase === 'CONFIRMING') {
        if (command.type === 'CONFIRM') handleConfirm();
        else if (command.type === 'REJECT') handleRejectByVoice();
        else if (command.type === 'REPEAT') handleRepeatConfirmation();
      } else if (phase === 'RESULT') {
        if (command.type === 'REPEAT') handleListenResult();
      }
    },
    [phase, data]
  );

  // Registra o handler no App, que recebe os comandos do hook de voz e os repassa para cá
  useEffect(() => {
    if (!commandHandlerRef) return;
    commandHandlerRef.current = handleVoiceCommand;
    return () => {
      commandHandlerRef.current = null;
    };
  }, [commandHandlerRef, handleVoiceCommand]);

  const demoNotice = data?.usingMock && (
    <div className="mb-4">
      <Notice label="Modo demonstração:">este resultado é um exemplo e não veio da sua foto.</Notice>
    </div>
  );

  if (phase === 'PROCESSING') {
    return (
      <div aria-busy="true">
        <BackLink onClick={handleHome} />
        <Title>Lendo a foto…</Title>
        <p className="text-muted mt-1 mb-5">Aguarde alguns segundinhos.</p>
        <PhotoFrame src={preview} alt="Foto enviada">
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="w-16 h-16 rounded-full bg-surface/90 flex items-center justify-center shadow-card">
              <Loader2 className="w-9 h-9 text-primary animate-spin" aria-hidden="true" />
            </span>
          </span>
        </PhotoFrame>
      </div>
    );
  }

  if (phase === 'ILLEGIBLE' || phase === 'RETAKE' || phase === 'ERROR') {
    const title =
      phase === 'RETAKE' ? 'Vamos tirar outra foto' : phase === 'ERROR' ? 'Não consegui ler a foto' : 'Não consegui ler com certeza';
    const isError = phase === 'ERROR';
    const reason =
      phase === 'ERROR'
        ? errorMessage
        : phase === 'ILLEGIBLE'
        ? data?.reason || 'A foto ficou embaçada ou cortada.'
        : null;

    return (
      <div>
        <BackLink onClick={handleHome} />
        <Title>{title}</Title>
        {reason && <p className="text-[1.1rem] mt-2">{reason}</p>}
        <div className="my-5">
          {isError ? (
            <Notice label="Nada foi inventado.">O Vivavós só mostra resultados que realmente leu.</Notice>
          ) : (
            <Notice label="O Vivavós nunca adivinha.">{flow.retakeHint}</Notice>
          )}
        </div>
        <div className="space-y-3">
          <Button icon={Camera} onClick={handleRetake}>
            {isError ? 'Tentar de novo' : 'Tirar outra foto'}
          </Button>
          <Button variant="accent" icon={Volume2} onClick={() => speak(`${title}. ${reason || ''} ${isError ? '' : flow.retakeHint}`)}>
            Ouvir
          </Button>
          <Button variant="outlinePrimary" onClick={handleHome}>
            Voltar ao início
          </Button>
        </div>
      </div>
    );
  }

  if (phase === 'CONFIRMING' && data?.confirmation) {
    return (
      <div>
        <BackLink onClick={handleHome} />
        {demoNotice}
        <Title>Conferindo a foto</Title>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 items-center mt-4">
          <PhotoFrame src={preview} alt="Foto que você enviou" />
          <div>
            <p className="text-[0.9rem] text-muted">Eu li:</p>
            <ul className="space-y-3">
              {data.confirmation.items.map((item, i) => (
                <li key={i}>
                  <p className="text-[1.6rem] font-bold leading-tight">{item.title}</p>
                  {item.detail && <p className="text-[1.05rem] mt-0.5">{item.detail}</p>}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Divider className="my-5" />

        <h2 className="text-[1.3rem] font-bold mb-3">Está certo?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button icon={Check} onClick={handleConfirm}>
            Sim, está certo
          </Button>
          <Button variant="outline" icon={Camera} onClick={handleRetake}>
            Não, tirar outra foto
          </Button>
        </div>
        <Button variant="accent" icon={Volume2} onClick={handleRepeatConfirmation} className="mt-3">
          Ouvir o que li
        </Button>

        <Divider className="mt-5 mb-3" />
        <SmallPrint>Só explico depois que você confirmar.</SmallPrint>
      </div>
    );
  }

  if (phase === 'RESULT' && data) {
    const { Result } = flow;
    return (
      <>
        {demoNotice}
        <Result data={data} onListen={handleListenResult} onHome={handleHome} />
      </>
    );
  }

  return null;
}
