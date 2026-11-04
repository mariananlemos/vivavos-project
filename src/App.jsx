import React, { useState, useRef, useEffect } from 'react';
import { Header } from './components/Header';
import { AccessibilityBar } from './components/AccessibilityBar';
import { SiteFooter } from './components/SiteFooter';
import { VoiceStatusIndicator } from './components/VoiceStatusIndicator';
import { ConsentModal } from './components/ConsentModal';
import { Toasts } from './components/Toasts';
import { DimOverlay, FlashOverlay, Magnifier } from './components/ScreenAids';
import { HomeScreen } from './screens/HomeScreen';
import { PhotoFlow } from './screens/PhotoFlow';
import { HistoryScreen, HistoryItemView } from './screens/HistoryScreen';
import { AccessibilitySettings } from './screens/AccessibilitySettings';
import { useAccessibility } from './hooks/useAccessibility';
import { useTextToSpeech } from './hooks/useTextToSpeech';
import { useVoiceRecognition } from './hooks/useVoiceRecognition';
import { useHistory } from './hooks/useHistory';
import { useNotifications } from './hooks/useNotifications';
import { useInteractionAids } from './hooks/useInteractionAids';

const CONSENT_KEY = 'vivavos-lgpd-consent-v2'; // v2: aviso do histórico guardado no aparelho

// Itens do menu que são páginas próprias (os outros são seções da página inicial)
const PAGES = { historico: 'history', ajustes: 'settings' };

// Quantas vezes o microfone reabre sozinho, conforme "Tempo para responder por voz"
const EXTRA_TRIES = { normal: 0, longo: 2, 'muito-longo': 4 };

export function App() {
  const accessibility = useAccessibility();
  const { prefs } = accessibility;
  const tts = useTextToSpeech(1, {
    autoSpeak: prefs.autoSpeak,
    volume: prefs.volume,
    voiceEngine: prefs.voiceEngine,
    pitch: prefs.pitch,
  }); // Começa na velocidade normal (1x); dá para ajustar de 0.6x a 1.3x
  const history = useHistory();
  const { toasts, dismiss, notify, flashKey } = useNotifications(prefs, tts);

  const [hasConsent, setHasConsent] = useState(() => {
    return localStorage.getItem(CONSENT_KEY) === 'true';
  });

  // Tela atual: home | flow { kind, file } | history | historyItem { item } | settings
  const [view, setView] = useState({ name: 'home' });
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

  const voice = useVoiceRecognition({
    onCommand: handleVoiceCommand,
    sounds: prefs.sounds,
    extraTries: EXTRA_TRIES[prefs.answerTime] || 0,
  });

  const handleAcceptConsent = () => {
    localStorage.setItem(CONSENT_KEY, 'true');
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
    setView({ name: 'flow', kind: pendingKindRef.current, file });
    window.scrollTo(0, 0);
  };

  const handleConfirmed = (kind, data) => {
    // Sem voz no aviso: a explicação do resultado começa a ser falada logo em seguida
    if (history.addFromResult(kind, data)) notify('Guardado no seu histórico.', { voice: false });
  };

  // Navegação do menu: páginas próprias abrem no topo; seções da página inicial rolam até o lugar
  const [scrollTarget, setScrollTarget] = useState(null);
  const navigateTo = (id) => {
    tts.stop();
    if (PAGES[id]) {
      setView({ name: PAGES[id] });
      setScrollTarget('conteudo');
    } else {
      setView({ name: 'home' });
      setScrollTarget(id);
    }
  };

  useEffect(() => {
    if (!scrollTarget) return;
    if (scrollTarget !== 'conteudo' && view.name !== 'home') return;
    const section = document.getElementById(scrollTarget);
    if (section) {
      if (scrollTarget === 'conteudo') window.scrollTo(0, 0);
      else section.scrollIntoView({ behavior: prefs.reduceMotion ? 'auto' : 'smooth', block: 'start' });
      section.focus({ preventScroll: true });
    }
    setScrollTarget(null);
  }, [view, scrollTarget]);

  const goHome = () => navigateTo('inicio');
  const openHistoryItem = (item) => {
    tts.stop();
    setView({ name: 'historyItem', item });
    setScrollTarget('conteudo');
  };

  // Gesto de deslizar para a direita: volta uma tela
  const goBack = () => {
    if (view.name === 'historyItem') navigateTo('historico');
    else if (view.name !== 'home') goHome();
  };

  useInteractionAids(prefs, tts, { onSwipeBack: goBack });

  const currentPage = { history: 'historico', historyItem: 'historico', settings: 'ajustes' }[view.name] || 'inicio';

  const card = (children) => (
    <div className="bg-page border-t border-line py-8 md:py-12 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto bg-surface rounded-lg border-2 border-line p-5 sm:p-8">{children}</div>
    </div>
  );

  return (
    <>
      <div className="app-zoom min-h-screen flex flex-col bg-surface text-ink font-sans">
        {/* Sem "capture": o celular oferece tirar foto ou escolher da galeria; no computador abre o seletor de arquivos */}
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChosen} />

        <AccessibilityBar accessibility={accessibility} tts={tts} onNavigate={navigateTo} />
        <Header onNavigate={navigateTo} currentPage={currentPage} />

        <main id="conteudo" tabIndex={-1} className="flex-1" role="main">
          {view.name === 'flow' &&
            card(
              <PhotoFlow
                key={view.kind}
                kind={view.kind}
                file={view.file}
                onRetake={() => openCamera(view.kind)}
                onHome={goHome}
                onConfirmed={handleConfirmed}
                tts={tts}
                voice={voice}
                commandHandlerRef={screenCommandHandlerRef}
              />
            )}

          {view.name === 'history' && (
            <HistoryScreen
              history={history}
              prefs={prefs}
              tts={tts}
              notify={notify}
              onHome={goHome}
              onOpenItem={openHistoryItem}
              onPickPhoto={openCamera}
            />
          )}

          {view.name === 'historyItem' &&
            card(<HistoryItemView item={view.item} tts={tts} onBack={() => navigateTo('historico')} />)}

          {view.name === 'settings' && (
            <AccessibilitySettings accessibility={accessibility} tts={tts} notify={notify} onHome={goHome} />
          )}

          {view.name === 'home' && (
            <HomeScreen
              onPickPhoto={openCamera}
              onNavigate={navigateTo}
              historyCount={history.items.length}
              tts={tts}
              voice={voice}
              commandHandlerRef={screenCommandHandlerRef}
            />
          )}
        </main>

        <SiteFooter onNavigate={navigateTo} />

        <VoiceStatusIndicator
          voice={voice}
          tts={tts}
          captions={{ enabled: prefs.captions, size: prefs.captionSize, style: prefs.captionStyle }}
        />
        <Toasts toasts={toasts} onDismiss={dismiss} />

        {/* Modal de Consentimento Obrigatório LGPD */}
        <ConsentModal isOpen={!hasConsent} onAccept={handleAcceptConsent} tts={tts} voice={voice} />
      </div>

      {/* Fora da área ampliada pelo zoom: cobrem a tela inteira */}
      <Magnifier enabled={prefs.magnifier} size={prefs.magnifierSize} follow={prefs.magnifierFollow} />
      <FlashOverlay flashKey={flashKey} />
      <DimOverlay level={prefs.dim} />
    </>
  );
}

export default App;
