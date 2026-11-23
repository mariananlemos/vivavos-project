/**
 * Consulta à lista de medicamentos com registro ativo na ANVISA (Dados Abertos).
 *
 * Serve para os remédios que não estão na base de bulas simplificadas: confirma que o
 * remédio existe e está registrado, e devolve princípio ativo, classe e nº de registro.
 * NÃO traz texto de bula, então nunca é usado para orientar como tomar.
 *
 * A busca é conservadora: prefere não achar a apontar o remédio errado.
 */
import { REGISTROS, GERADO_EM } from './registrosAnvisa.js';

const BULARIO_URL = 'https://consultas.anvisa.gov.br/#/bulario/q/?nomeProduto=';

// Palavras que a leitura da caixa costuma trazer junto do nome, mas não fazem parte dele
const RUIDO = new Set([
  'mg', 'mcg', 'ml', 'g', 'ui', 'comprimido', 'comprimidos', 'capsula', 'capsulas', 'cp', 'caps',
  'revestido', 'revestidos', 'gotas', 'solucao', 'oral', 'xarope', 'suspensao', 'generico',
  'medicamento', 'de', 'liberacao', 'prolongada',
]);

function normalize(str) {
  return (str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/** Tira doses ("50 mg", "500mg") e palavras de forma farmacêutica. */
function cleanQuery(str) {
  return normalize(str)
    .split(' ')
    .filter((w) => w && !/^\d/.test(w) && !RUIDO.has(w))
    .join(' ');
}

let indices;
function getIndices() {
  if (indices) return indices;
  const byName = new Map();
  const byIngredient = new Map();
  for (const r of REGISTROS) {
    const nome = cleanQuery(r[0]);
    const principio = normalize(r[1]);
    if (nome) (byName.get(nome) || byName.set(nome, []).get(nome)).push(r);
    if (principio) (byIngredient.get(principio) || byIngredient.set(principio, []).get(principio)).push(r);
  }
  indices = { byName, byIngredient, ingredientKeys: [...byIngredient.keys()] };
  return indices;
}

const isCombination = (registros) => registros[0][1].includes(',') || registros[0][1].includes('+');

function formatRegistro(numero) {
  const d = String(numero || '').replace(/\D/g, '');
  if (d.length === 9) return `MS ${d[0]}.${d.slice(1, 5)}.${d.slice(5)}`;
  return d ? `MS ${d}` : null;
}

function capitalize(str) {
  const s = (str || '').toLowerCase();
  return s ? s[0].toUpperCase() + s.slice(1) : '';
}

/** Classe mais comum entre os produtos encontrados. */
function mostCommon(values) {
  const counts = new Map();
  for (const v of values.filter(Boolean)) counts.set(v, (counts.get(v) || 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || '';
}

function toResult(registros, { queryName, matchedBy }) {
  const principal = registros[0];
  // Nome comercial (marca) tem um registro próprio. Já um genérico ("CAPTOPRIL") é fabricado
  // por vários laboratórios, então não dá para afirmar qual registro é o da caixa.
  const isBrand = matchedBy === 'nome' && normalize(principal[0]) !== normalize(principal[1]);
  return {
    nomeProduto: isBrand ? principal[0] : capitalize(principal[1]),
    principioAtivo: capitalize(principal[1]) || 'Não informado no registro',
    classeTerapeutica: capitalize(mostCommon(registros.map((r) => r[2]))) || 'Não informada no registro',
    registroAnvisa: isBrand ? formatRegistro(principal[3]) : null,
    linkBulario: BULARIO_URL + encodeURIComponent(matchedBy === 'nome' ? principal[0] : queryName),
    fonte: `Dados Abertos da ANVISA (registros ativos, atualizado em ${GERADO_EM.split('-').reverse().join('/')})`,
  };
}

/**
 * @param {string} medicineName - nome lido na caixa
 * @param {string} [activeIngredient] - princípio ativo lido na caixa
 * @returns {object|null} dados do registro, ou null se não houver correspondência segura
 */
export function findAnvisaRegistration(medicineName, activeIngredient = '') {
  const { byName, byIngredient, ingredientKeys } = getIndices();
  const nome = cleanQuery(medicineName);
  const principio = normalize(activeIngredient);

  // 1. Nome comercial exato (ex.: "Aradois", "Glifage XR")
  if (nome && byName.has(nome)) {
    return toResult(byName.get(nome), { queryName: medicineName, matchedBy: 'nome' });
  }

  // 2. Princípio ativo exato (ex.: genérico "Losartana potássica")
  for (const q of [principio, nome]) {
    if (q && byIngredient.has(q)) {
      return toResult(byIngredient.get(q), { queryName: q, matchedBy: 'principio' });
    }
  }

  // 3. Princípio escrito sem o sal (ex.: "metformina" -> "cloridrato de metformina").
  //    Só aceita se houver um único princípio ativo isolado que contenha o termo.
  for (const q of [principio, nome]) {
    if (!q || q.length < 5) continue;
    const pattern = new RegExp(`(^| )${q}( |$)`);
    // normalize() troca vírgulas por espaço, então associações são detectadas pelo texto original
    const unicos = ingredientKeys.filter((k) => pattern.test(k) && !isCombination(byIngredient.get(k)));
    if (unicos.length === 1) {
      return toResult(byIngredient.get(unicos[0]), { queryName: q, matchedBy: 'principio' });
    }
  }

  return null;
}
