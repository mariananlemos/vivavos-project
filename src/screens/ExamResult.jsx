import React from 'react';
import { Check, CircleCheck, TriangleAlert, Volume2 } from 'lucide-react';
import { BackLink, Button, Divider, NumberedSection, SmallPrint, StatusPill, Title } from '../components/ui';

const WHAT_TO_DO = 'Mostre este exame ao seu médico. Ele diz se você precisa de algum cuidado.';

export function examSpeech(data) {
  const parts = data.tests.map((t) => {
    const ref = t.refText ? ` O valor esperado no laudo é ${t.refText}.` : '';
    return `${t.name}: ${t.valueText}${t.unit ? ` ${t.unit}` : ''}. ${t.statusLabel}.${ref} ${t.meaning}`;
  });
  return `${parts.join(' ')} O que devo fazer: ${WHAT_TO_DO} Isto não é diagnóstico e não substitui o seu médico.`;
}

function RangeBar({ bar }) {
  if (!bar) return null;
  return (
    <div className="relative h-2.5 max-w-sm rounded-full bg-line my-3" aria-hidden="true">
      <span
        className="absolute inset-y-0 rounded-full bg-ok"
        style={{ left: `${bar.refStart}%`, width: `${Math.max(bar.refEnd - bar.refStart, 1)}%` }}
      />
      <span
        className="absolute top-1/2 w-4 h-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ink border-2 border-surface"
        style={{ left: `${bar.value}%` }}
      />
    </div>
  );
}

function TestResult({ test }) {
  return (
    <div>
      {test.showName && <p className="font-bold mb-1">{test.name}</p>}
      <p className="flex items-baseline gap-2">
        <span className="text-[2.4rem] leading-none font-bold">{test.valueText}</span>
        {test.unit && <span className="text-[1.05rem]">{test.unit}</span>}
      </p>
      <div className="mt-3">
        <StatusPill tone={test.tone} icon={test.tone === 'ok' ? CircleCheck : test.tone === 'warn' ? TriangleAlert : null}>
          {test.statusLabel}
        </StatusPill>
      </div>
      <RangeBar bar={test.bar} />
      {test.refText && <p className="text-[0.85rem]">Esperado no laudo: {test.refText}</p>}
    </div>
  );
}

export function ExamResult({ data, onListen, onHome, homeLabel = 'Voltar ao início' }) {
  const tests = data.tests.map((t) => ({ ...t, showName: data.tests.length > 1 }));
  const names = data.tests.map((t) => t.name).join(', ');

  return (
    <div>
      <BackLink onClick={onHome} />
      <Title>Seu exame</Title>
      <p className="flex items-center gap-2 mt-2 mb-4">
        <Check className="w-5 h-5 text-ok shrink-0" strokeWidth={3} aria-hidden="true" />
        <span>
          <strong>{names}</strong> · você confirmou
        </span>
      </p>

      <Button variant="accent" icon={Volume2} onClick={onListen}>
        Ouvir explicação
      </Button>

      <Divider strong className="mt-5" />

      <div className="divide-y-2 divide-line">
        <NumberedSection n={1} title={tests.length > 1 ? 'Quais foram os seus resultados?' : 'Qual foi o seu resultado?'}>
          <div className="space-y-6">
            {tests.map((t, i) => (
              <TestResult key={i} test={t} />
            ))}
          </div>
        </NumberedSection>
        <NumberedSection n={2} title="O que isso quer dizer?">
          <div className="space-y-2">
            {tests.map((t, i) => (
              <p key={i}>{t.meaning}</p>
            ))}
          </div>
        </NumberedSection>
        <NumberedSection n={3} title="O que devo fazer?">
          {WHAT_TO_DO}
        </NumberedSection>
      </div>

      <Divider strong className="mb-3" />
      <SmallPrint>Não é diagnóstico. Não substitui o seu médico.</SmallPrint>
      <Button variant="outlinePrimary" onClick={onHome} className="mt-4">
        {homeLabel}
      </Button>
    </div>
  );
}
