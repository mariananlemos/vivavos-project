import React from 'react';
import { MicOff, VolumeX } from 'lucide-react';

const CAPTION_SIZES = { normal: 'text-[1.1rem]', grande: 'text-[1.45rem]', enorme: 'text-[1.9rem]' };
const CAPTION_STYLES = {
  escuro: 'bg-black/90 text-white',
  claro: 'bg-white text-black border-2 border-black',
};

/** Frase que está sendo falada agora, a partir da posição aproximada na fala */
function currentSentence({ text, charIndex }) {
  const sentences = text.match(/[^.!?…]+[.!?…]*\s*/g) || [text];
  let end = 0;
  for (const sentence of sentences) {
    end += sentence.length;
    if (charIndex < end) return sentence.trim();
  }
  return sentences[sentences.length - 1].trim();
}

/**
 * Aviso flutuante que só aparece enquanto o Vivavós fala ou escuta.
 * Com a legenda ligada, mostra por escrito a frase que está sendo falada.
 */
export function VoiceStatusIndicator({ voice, tts, captions }) {
  const { isListening, stopListening, transcript } = voice;
  const { isSpeaking, stop, caption } = tts;

  if (!isSpeaking && !isListening) return null;

  const showCaption = captions.enabled && isSpeaking && caption;

  return (
    <div className="fixed bottom-4 inset-x-4 z-40 mx-auto max-w-[40rem] flex flex-col items-center gap-2">
      {showCaption && (
        // A legenda é para quem não ouve bem; o leitor de tela já tem o áudio, por isso aria-hidden
        <p
          aria-hidden="true"
          data-a11y-ui
          className={`w-full rounded-lg px-4 py-2.5 text-center font-bold leading-snug shadow-card ${
            CAPTION_SIZES[captions.size] || CAPTION_SIZES.grande
          } ${CAPTION_STYLES[captions.style] || CAPTION_STYLES.escuro}`}
        >
          {currentSentence(caption)}
        </p>
      )}

      <aside
        aria-live="polite"
        aria-label="Status de voz"
        className="w-full max-w-[30rem] flex items-center justify-between gap-3 pl-5 pr-2 py-2 rounded-full bg-ink text-surface shadow-card"
      >
        <div className="flex items-center gap-3 min-w-0">
          {isListening ? (
            <span className="flex items-center gap-1 h-5" aria-hidden="true">
              <span className="w-1.5 h-3 bg-accent rounded-full animate-voice-1" />
              <span className="w-1.5 h-5 bg-accent rounded-full animate-voice-2" />
              <span className="w-1.5 h-3 bg-accent rounded-full animate-voice-3" />
            </span>
          ) : (
            <span className="relative flex h-3 w-3" aria-hidden="true">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-accent" />
            </span>
          )}
          <span className="font-bold truncate">
            {isListening ? (transcript ? `“${transcript}”` : 'Estou ouvindo… pode falar') : 'Vivavós falando…'}
          </span>
        </div>

        <button
          type="button"
          onClick={isListening ? stopListening : stop}
          className="shrink-0 flex items-center gap-1.5 px-4 min-h-[2.5rem] rounded-full bg-accent text-on-accent font-bold"
        >
          {isListening ? <MicOff className="w-5 h-5" aria-hidden="true" /> : <VolumeX className="w-5 h-5" aria-hidden="true" />}
          <span>{isListening ? 'Parar' : 'Silenciar'}</span>
        </button>
      </aside>
    </div>
  );
}
