import React from 'react';
import { Volume2 } from 'lucide-react';
import { BackLink, Button, Divider, Notice, NumberedSection, SmallPrint, Title } from '../components/ui';

const INTERACTIONS_TEXT = 'Conte ao seu médico ou ao farmacêutico todos os remédios que você usa.';

export function medicineSpeech(data) {
  const name = `${data.medicine.name}${data.medicine.dosage ? ` ${data.medicine.dosage}` : ''}`;
  if (!data.bulaFound || !data.bulaOfficial) {
    return (
      data.bulaMessageIfNotReceived ||
      'Não encontrei a bula oficial deste remédio no registro da Anvisa. Por segurança, consulte seu farmacêutico ou médico.'
    );
  }
  const bula = data.bulaOfficial;
  return `${name}. Para que serve: ${bula.paraQueServe} Como devo tomar: ${bula.comoTomarBula} O que devo cuidar: ${bula.cuidadosImportantes} Posso usar com outros remédios? ${INTERACTIONS_TEXT} ${bula.avisoObrigatorio}`;
}

export function MedicineResult({ data, onListen, onHome, homeLabel = 'Voltar ao início' }) {
  const { medicine, bulaFound, bulaOfficial: bula } = data;

  return (
    <div>
      <BackLink onClick={onHome} />
      <Title>
        {medicine.name}
        {medicine.dosage ? ` ${medicine.dosage}` : ''}
      </Title>
      <p className="text-muted mt-1 mb-4">As informações da bula, em palavras simples.</p>

      <Button variant="accent" icon={Volume2} onClick={onListen}>
        Ouvir explicação
      </Button>

      <Divider strong className="mt-5" />

      {bulaFound && bula ? (
        <div className="divide-y-2 divide-line">
          <NumberedSection n={1} title="Para que serve?">
            {bula.paraQueServe}
          </NumberedSection>
          <NumberedSection n={2} title="Como devo tomar?">
            {bula.comoTomarBula}
          </NumberedSection>
          <NumberedSection n={3} title="O que devo cuidar?">
            <Notice>{bula.cuidadosImportantes}</Notice>
          </NumberedSection>
          <NumberedSection n={4} title="Posso usar com outros remédios?">
            {INTERACTIONS_TEXT}
          </NumberedSection>
        </div>
      ) : (
        <div className="py-4">
          <Notice label="Bula oficial não encontrada.">
            {data.bulaMessageIfNotReceived ||
              'Por segurança, não passo orientações sem fonte oficial. Consulte seu farmacêutico ou médico.'}
          </Notice>
        </div>
      )}

      <Divider strong className="mb-3" />
      <SmallPrint>
        Fonte: {bula ? `${bula.fonte}${bula.registroAnvisa ? ` (${bula.registroAnvisa})` : ''}` : 'bula do medicamento'}. Não
        substitui o médico nem o farmacêutico.
      </SmallPrint>
      <Button variant="outlinePrimary" onClick={onHome} className="mt-4">
        {homeLabel}
      </Button>
    </div>
  );
}
