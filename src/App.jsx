import React, { useState, useRef, useEffect } from 'react';
import { Header } from './components/Header';
import { AccessibilityBar } from './components/AccessibilityBar';
import { SiteFooter } from './components/SiteFooter';
import { VoiceStatusIndicator } from './components/VoiceStatusIndicator';
import { ConsentModal } from './components/ConsentModal';
import { HomeScreen } from './screens/HomeScreen';
import { PhotoFlow } from './screens/PhotoFlow';
import { useAccessibility } from './hooks/useAccessibility';
import { useTextToSpeech } from './hooks/useTextToSpeech';
import { useVoiceRecognition } from './hooks/useVoiceRecognition';

export function App() {
  const accessibility = useAccessibility();
  const tts = useTextToSpeech(0.85); // Velocidade inicial calma para idosos (0.85x)

  const [hasConsent, setHasConsent] = useState(() => {
    return localStorage.getItem('vivavos-lgpd-consent') === 'true';
  });

  // Fluxo atual: null = tela inicial; { kind: 'medicine' | 'exam', file }
  const [flow, setFlow] = useState(null);
  const pendingKindRef = useRef('medicine');
  const fileInputRef = useRef(null);

  // Handler da tela ativa (início ou fluxo de foto), registrado pela própria tela
  const screenCommandHandlerRef = useRef(null);

  // Manipulador de comandos de voz no nível do App (ex: aceitar consentimento ou pausar)
  const handleVoiceCommand = (command) => {
    if (!hasConsent) {
      if (command.type === 'CONFIRM' || command.text.toLowerCase().includes('concordo')) {
        handleAcceptConsent();
      }
    } else if (command.type === 'SLOWER') {
      tts.decreaseSpeed();
    } else if (command.type === 'FASTER') {
      tts.increaseSpeed();
    } else if (screenCommandHandlerRef.current) {
      screenCommandHandlerRef.current(command);
    }
  };

  const voice = useVoiceRecognition({ onCommand: handleVoiceCommand });

  const handleAcceptConsent = () => {
    localStorage.setItem('vivavos-lgpd-consent', 'true');
    setHasConsent(true);
    tts.stop();
  };

  // Abrir a câmera precisa acontecer dentro de um toque do usuário
  const openCamera = (kind) => {
    pendingKindRef.current = kind;
    fileInputRef.current?.click();
  };

  const handleFileChosen = (e) => {
    const file = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!file) return;
    setFlow({ kind: pendingKindRef.current, file });
    window.scrollTo(0, 0);
  };

  // Navegação do menu: volta para a página inicial (se estiver num fluxo) e rola até a seção
  const [scrollTarget, setScrollTarget] = useState(null);
  const navigateTo = (sectionId) => {
    setFlow(null);
    setScrollTarget(sectionId);
  };

  useEffect(() => {
    if (flow || !scrollTarget) return;
    const section = document.getElementById(scrollTarget);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      section.focus({ preventScroll: true });
    }
    setScrollTarget(null);
  }, [flow, scrollTarget]);

  const goHome = () => navigateTo('inicio');

  return (
    <div className="min-h-screen flex flex-col bg-surface text-ink font-sans">
      {/* Sem "capture": o celular oferece tirar foto ou escolher da galeria; no computador abre o seletor de arquivos */}
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChosen} />

      <AccessibilityBar accessibility={accessibility} tts={tts} onNavigate={navigateTo} />
      <Header onNavigate={navigateTo} />

      <main id="conteudo" tabIndex={-1} className="flex-1" role="main">
        {flow ? (
          <div className="bg-page border-t border-line py-8 md:py-12 px-4 sm:px-6">
            <div className="max-w-3xl mx-auto bg-surface rounded-lg border-2 border-line p-5 sm:p-8">
              <PhotoFlow
                key={flow.kind}
                kind={flow.kind}
                file={flow.file}
                onRetake={() => openCamera(flow.kind)}
                onHome={goHome}
                tts={tts}
                voice={voice}
                commandHandlerRef={screenCommandHandlerRef}
              />
            </div>
          </div>
        ) : (
          <HomeScreen
            onPickPhoto={openCamera}
            tts={tts}
            voice={voice}
            commandHandlerRef={screenCommandHandlerRef}
          />
        )}
      </main>

      <SiteFooter onNavigate={navigateTo} />

      <VoiceStatusIndicator voice={voice} tts={tts} />

      {/* Modal de Consentimento Obrigatório LGPD */}
      <ConsentModal isOpen={!hasConsent} onAccept={handleAcceptConsent} tts={tts} voice={voice} />
    </div>
  );
}

export default App;
