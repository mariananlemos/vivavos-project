import React, { useMemo } from 'react';
import { ArrowDownRight, ArrowRight, ArrowUpRight, CircleCheck, TrendingUp, TriangleAlert, Volume2 } from 'lucide-react';
import { Button, StatusPill } from './ui';

// Quantas medições aparecem no gráfico (as mais recentes)
const MAX_POINTS = 4;
// Diferença menor que 2% do valor anterior conta como "ficou quase igual"
const SAME_MARGIN = 0.02;

const normalize = (t) => (t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').trim();

function toNumber(text) {
  const match = String(text ?? '').match(/-?\d+(?:[.,]\d+)?/);
  if (!match) return null;
  const n = Number(match[0].replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}

const formatNumber = (n) => n.toLocaleString('pt-BR', { maximumFractionDigits: 2 });
const shortDate = (d) => d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' }).replace(/\.|de /g, '');
const longDate = (d) => d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });

/** Junta as medições do mesmo exame (lidas da foto ou anotadas à mão) em ordem de data */
function buildTrends(items) {
  const byName = new Map();
  const push = (name, point) => {
    const key = normalize(name);
    if (!key) return;
    if (!byName.has(key)) byName.set(key, { name, points: [] });
    byName.get(key).points.push(point);
  };

  for (const item of items) {
    if (item.kind !== 'exam') continue;
    const date = new Date(item.createdAt);
    if (item.data?.tests) {
      for (const t of item.data.tests) {
        const value = typeof t.value === 'number' ? t.value : toNumber(t.valueText);
        if (value === null) continue;
        push(t.name, {
          id: `${item.id}-${t.name}`,
          date,
          value,
          unit: t.unit || null,
          refMin: t.refMin ?? null,
          refMax: t.refMax ?? null,
          refText: t.refText || null,
          statusLabel: t.statusLabel,
          tone: t.tone,
        });
      }
    } else {
      const value = toNumber(item.detail);
      if (value === null) continue;
      const unit = String(item.detail).replace(/^[^\d-]*-?\d+(?:[.,]\d+)?\s*/, '').trim() || null;
      push(item.title, { id: item.id, date, value, unit });
    }
  }

  return [...byName.values()]
    .map((trend) => {
      const sorted = trend.points.sort((a, b) => a.date - b.date);
      const latest = sorted[sorted.length - 1];
      // Só compara medições na mesma unidade da mais recente
      const points = sorted.filter((p) => !p.unit || !latest.unit || normalize(p.unit) === normalize(latest.unit));
      return { name: trend.name, unit: latest.unit, points };
    })
    .filter((trend) => trend.points.length >= 2)
    .sort((a, b) => b.points[b.points.length - 1].date - a.points[a.points.length - 1].date);
}

/** Frase simples: subiu, desceu ou ficou quase igual. Sem dizer se é bom ou ruim, isso é com o médico. */
function describeChange(trend) {
  const first = trend.points[0];
  const last = trend.points[trend.points.length - 1];
  const unit = trend.unit ? ` ${trend.unit}` : '';
  const diff = last.value - first.value;
  const base = Math.max(Math.abs(first.value), 1);

  if (Math.abs(diff) <= base * SAME_MARGIN) {
    return { direction: 'same', text: `Ficou quase igual: ${formatNumber(first.value)} e agora ${formatNumber(last.value)}${unit}.` };
  }
  const verb = diff > 0 ? 'Subiu' : 'Desceu';
  return {
    direction: diff > 0 ? 'up' : 'down',
    text: `${verb} de ${formatNumber(first.value)} para ${formatNumber(last.value)}${unit}.`,
  };
}

export function trendSpeech(trend) {
  const first = trend.points[0];
  const last = trend.points[trend.points.length - 1];
  const unit = trend.unit ? ` ${trend.unit}` : '';
  const steps = trend.points.map((p) => `${longDate(p.date)}: ${formatNumber(p.value)}${unit}`).join('. ');
  return [
    `${trend.name}. Você tem ${trend.points.length} medições, de ${longDate(first.date)} até ${longDate(last.date)}.`,
    `${steps}.`,
    describeChange(trend).text,
    last.statusLabel && `A última medição ficou: ${last.statusLabel.toLowerCase()}.`,
    'Mostre esta evolução ao seu médico. Isto não é diagnóstico.',
  ]
    .filter(Boolean)
    .join(' ');
}

/** Gráfico de linha simples: poucos pontos, valor escrito em cima de cada um e data embaixo */
function TrendChart({ trend }) {
  const points = trend.points.slice(-MAX_POINTS);
  const last = points[points.length - 1];
  const W = 400;
  const H = 230;
  const pad = { top: 46, right: 50, bottom: 46, left: 50 };

  const values = points.map((p) => p.value);
  const refs = [last.refMin, last.refMax].filter((v) => typeof v === 'number');
  let min = Math.min(...values, ...refs);
  let max = Math.max(...values, ...refs);
  const span = Math.max(max - min, Math.abs(max) * 0.1, 1);
  min -= span * 0.25;
  max += span * 0.25;

  const x = (i) => (points.length === 1 ? W / 2 : pad.left + (i * (W - pad.left - pad.right)) / (points.length - 1));
  const y = (v) => pad.top + ((max - v) / (max - min)) * (H - pad.top - pad.bottom);

  const hasBand = refs.length > 0;
  const bandTop = y(typeof last.refMax === 'number' ? last.refMax : max);
  const bandBottom = y(typeof last.refMin === 'number' ? last.refMin : min);
  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i)},${y(p.value)}`).join(' ');

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-[28rem] h-auto" aria-hidden="true" style={{ fontFamily: 'inherit' }}>
        {hasBand && (
          <rect
            x={pad.left - 30}
            y={bandTop}
            width={W - pad.left - pad.right + 60}
            height={Math.max(bandBottom - bandTop, 2)}
            fill="var(--c-ok-soft)"
            stroke="var(--c-ok)"
            strokeDasharray="6 6"
            strokeWidth="2"
          />
        )}
        <line x1={pad.left - 30} x2={W - pad.right + 30} y1={H - pad.bottom} y2={H - pad.bottom} stroke="var(--c-line)" strokeWidth="2" />
        <path d={path} fill="none" stroke="var(--c-primary)" strokeWidth="5" strokeLinejoin="round" strokeLinecap="round" />
        {points.map((p, i) => {
          const isLast = i === points.length - 1;
          return (
            <g key={p.id}>
              <circle cx={x(i)} cy={y(p.value)} r={isLast ? 11 : 8} fill={isLast ? 'var(--c-primary)' : 'var(--c-surface)'} stroke="var(--c-primary)" strokeWidth="4" />
              <text x={x(i)} y={y(p.value) - 18} textAnchor="middle" fontSize="26" fontWeight="700" fill="var(--c-ink)">
                {formatNumber(p.value)}
              </text>
              <text x={x(i)} y={H - pad.bottom + 32} textAnchor="middle" fontSize="20" fill="var(--c-muted)">
                {shortDate(p.date)}
              </text>
            </g>
          );
        })}
      </svg>
      {hasBand && (
        <p className="mt-1 flex items-center gap-2 text-[0.95rem]">
          <span className="inline-block w-6 h-4 rounded-sm bg-ok-soft border-2 border-dashed border-ok" aria-hidden="true" />
          Faixa verde: valor esperado no último laudo{last.refText ? ` (${last.refText})` : ''}.
        </p>
      )}
      {trend.points.length > MAX_POINTS && (
        <p className="mt-1 text-[0.9rem] text-muted">Mostrando as {MAX_POINTS} medições mais recentes.</p>
      )}
    </div>
  );
}

const DIRECTION_ICONS = { up: ArrowUpRight, down: ArrowDownRight, same: ArrowRight };

function TrendCard({ trend, onListen }) {
  const change = describeChange(trend);
  const Arrow = DIRECTION_ICONS[change.direction];
  const first = trend.points[0];
  const last = trend.points[trend.points.length - 1];

  return (
    <li className="p-4 sm:p-5 rounded-lg bg-surface border-2 border-line">
      <h3 className="text-[1.3rem] font-bold leading-tight break-words">{trend.name}</h3>
      <p className="text-[0.95rem] text-muted">
        {trend.points.length} medições · de {longDate(first.date)} até {longDate(last.date)}
      </p>

      <p className="mt-3 flex items-start gap-2 text-[1.25rem] font-bold">
        <Arrow className="w-7 h-7 shrink-0 text-primary" strokeWidth={2.75} aria-hidden="true" />
        {change.text}
      </p>
      {last.statusLabel && (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="text-[1rem]">Última medição:</span>
          <StatusPill tone={last.tone} icon={last.tone === 'ok' ? CircleCheck : last.tone === 'warn' ? TriangleAlert : null}>
            {last.statusLabel}
          </StatusPill>
        </div>
      )}

      <div className="mt-4">
        <TrendChart trend={trend} />
      </div>

      <Button variant="accent" icon={Volume2} onClick={() => onListen(trend)} className="mt-4" aria-label={`Ouvir a evolução de ${trend.name}`}>
        Ouvir a evolução
      </Button>
    </li>
  );
}

/**
 * Evolução dos exames repetidos. Aparece só quando o mesmo exame tem 2 ou mais medições.
 * Para o público idoso, a frase simples ("Subiu de 210 para 245") vem antes do gráfico,
 * o gráfico tem o valor escrito em cada ponto e tudo pode ser ouvido.
 */
export function ExamTrends({ items, onListen }) {
  const trends = useMemo(() => buildTrends(items), [items]);
  if (trends.length === 0) return null;

  return (
    <section aria-labelledby="evolucao-titulo" className="mt-8">
      <h2 id="evolucao-titulo" className="flex items-center gap-2 text-[1.5rem] font-bold">
        <TrendingUp className="w-7 h-7 text-primary" strokeWidth={2.5} aria-hidden="true" />
        Como seus exames mudaram
      </h2>
      <p className="mt-1 text-[1.05rem]">
        Quando você confere o mesmo exame mais de uma vez, mostramos aqui se o valor subiu ou desceu. Quem diz se isso é bom ou
        ruim é o seu médico.
      </p>
      <ul className="mt-4 space-y-4">
        {trends.map((trend) => (
          <TrendCard key={trend.name} trend={trend} onListen={onListen} />
        ))}
      </ul>
    </section>
  );
}
