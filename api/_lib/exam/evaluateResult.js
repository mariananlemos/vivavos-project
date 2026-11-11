/**
 * Compara um resultado de exame com o valor de referência IMPRESSO NO LAUDO.
 * A comparação é feita aqui, em código, e não pela IA: nenhuma faixa vem da memória
 * de um modelo, e o texto nunca interpreta o resultado clinicamente.
 */

// Até 20% além do limite do laudo é descrito como "um pouco" acima/abaixo
const SLIGHT_MARGIN = 0.2;

function toNumber(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value === 'string' && value.trim() !== '') {
    const n = Number(value.replace(',', '.'));
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function classify(value, refMin, refMax) {
  if (value === null || (refMin === null && refMax === null)) return 'unknown';
  if (refMin !== null && value < refMin) {
    return refMin - value <= Math.abs(refMin) * SLIGHT_MARGIN ? 'slightlyBelow' : 'below';
  }
  if (refMax !== null && value > refMax) {
    return value - refMax <= Math.abs(refMax) * SLIGHT_MARGIN ? 'slightlyAbove' : 'above';
  }
  return 'within';
}

const STATUS = {
  within: { label: 'Dentro do esperado', tone: 'ok', phrase: 'ficou dentro do valor esperado no laudo' },
  slightlyAbove: { label: 'Um pouco acima do esperado', tone: 'warn', phrase: 'ficou um pouco acima do valor esperado no laudo' },
  above: { label: 'Acima do esperado', tone: 'warn', phrase: 'ficou acima do valor esperado no laudo' },
  slightlyBelow: { label: 'Um pouco abaixo do esperado', tone: 'warn', phrase: 'ficou um pouco abaixo do valor esperado no laudo' },
  below: { label: 'Abaixo do esperado', tone: 'warn', phrase: 'ficou abaixo do valor esperado no laudo' },
  unknown: { label: 'Sem valor esperado no laudo', tone: 'neutral', phrase: null },
};

/** Posições (0–100%) para a barra visual: faixa do laudo em verde e o ponto do resultado */
function buildBar(value, refMin, refMax) {
  if (value === null || (refMin === null && refMax === null)) return null;

  const low = refMin ?? 0;
  const high = refMax ?? Math.max(value, low) * 1.5;
  const span = Math.max(high - low, Math.abs(high) * 0.1, 1);
  const start = Math.min(low, value) - span * 0.6;
  const end = Math.max(high, value) + span * 0.6;
  const pos = (v) => Math.round(((v - start) / (end - start)) * 1000) / 10;

  return {
    refStart: refMin === null ? 0 : pos(low),
    refEnd: refMax === null ? 100 : pos(high),
    value: pos(value),
  };
}

export function evaluateResult(test) {
  const value = toNumber(test.value);
  const refMin = toNumber(test.refMin);
  const refMax = toNumber(test.refMax);
  const statusKey = classify(value, refMin, refMax);
  const status = STATUS[statusKey];

  return {
    name: String(test.name),
    valueText: String(test.valueText),
    unit: test.unit || null,
    refText: test.refText || null,
    // Números guardados no histórico para acompanhar a evolução do exame
    value,
    refMin,
    refMax,
    status: statusKey,
    statusLabel: status.label,
    tone: status.tone,
    meaning: status.phrase
      ? `O resultado de ${test.name} ${status.phrase}.`
      : `O laudo não mostra um valor esperado claro para ${test.name}. Seu médico sabe avaliar este resultado.`,
    bar: buildBar(value, refMin, refMax),
  };
}
