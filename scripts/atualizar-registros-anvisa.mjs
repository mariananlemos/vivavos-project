/**
 * Gera api/_lib/bulario/registrosAnvisa.js a partir dos Dados Abertos da ANVISA.
 *
 * Fonte: https://dados.anvisa.gov.br/dados/DADOS_ABERTOS_MEDICAMENTOS.csv
 * (lista de todos os medicamentos registrados; atualizada pela ANVISA com frequência).
 *
 * O CSV tem ~46 MB, então não é baixado a cada foto: este script roda à mão
 * (`npm run anvisa:atualizar`) e o arquivo gerado, bem menor, vai junto no deploy.
 * Só entram registros com situação "Ativo".
 *
 * Uso:
 *   npm run anvisa:atualizar                 -> baixa o CSV da ANVISA
 *   npm run anvisa:atualizar -- caminho.csv  -> usa um CSV já baixado
 */
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const FONTE_URL = 'https://dados.anvisa.gov.br/dados/DADOS_ABERTOS_MEDICAMENTOS.csv';
const SAIDA = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'api', '_lib', 'bulario', 'registrosAnvisa.js');

async function lerCsv() {
  const arquivoLocal = process.argv[2];
  let bytes;
  if (arquivoLocal) {
    console.log(`Lendo ${arquivoLocal}...`);
    bytes = await readFile(arquivoLocal);
  } else {
    console.log(`Baixando ${FONTE_URL}...`);
    const res = await fetch(FONTE_URL);
    if (!res.ok) throw new Error(`ANVISA respondeu ${res.status}`);
    bytes = Buffer.from(await res.arrayBuffer());
  }
  // O arquivo da ANVISA vem em Latin-1 (ISO-8859-1)
  return new TextDecoder('latin1').decode(bytes);
}

/** Parser de CSV com ";" que respeita aspas (alguns campos têm ";" e quebras de linha). */
function* linhasCsv(texto) {
  let campo = '';
  let linha = [];
  let entreAspas = false;
  for (let i = 0; i < texto.length; i++) {
    const c = texto[i];
    if (entreAspas) {
      if (c === '"') {
        if (texto[i + 1] === '"') {
          campo += '"';
          i++;
        } else entreAspas = false;
      } else campo += c;
    } else if (c === '"') entreAspas = true;
    else if (c === ';') {
      linha.push(campo);
      campo = '';
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && texto[i + 1] === '\n') i++;
      linha.push(campo);
      yield linha;
      linha = [];
      campo = '';
    } else campo += c;
  }
  if (campo || linha.length) {
    linha.push(campo);
    yield linha;
  }
}

const limpar = (s) => (s || '').replace(/\s+/g, ' ').trim();

async function main() {
  const texto = await lerCsv();
  const linhas = linhasCsv(texto);
  const cabecalho = linhas.next().value.map((h) => h.trim());
  const col = (nome) => {
    const i = cabecalho.indexOf(nome);
    if (i < 0) throw new Error(`Coluna ${nome} não encontrada. O formato do CSV da ANVISA mudou?`);
    return i;
  };
  const iNome = col('NOME_PRODUTO');
  const iRegistro = col('NUMERO_REGISTRO_PRODUTO');
  const iClasse = col('CLASSE_TERAPEUTICA');
  const iSituacao = col('SITUACAO_REGISTRO');
  const iPrincipio = col('PRINCIPIO_ATIVO');

  // Um registro por combinação nome + princípio ativo (os genéricos repetem muito)
  const porChave = new Map();
  let ativos = 0;
  for (const l of linhas) {
    if (l.length < cabecalho.length) continue;
    if (limpar(l[iSituacao]) !== 'Ativo') continue;
    ativos++;
    const nome = limpar(l[iNome]);
    const principio = limpar(l[iPrincipio]).toLowerCase();
    if (!nome) continue;
    const chave = `${nome.toLowerCase()}|${principio}`;
    if (porChave.has(chave)) continue;
    porChave.set(chave, [nome, principio, limpar(l[iClasse]), limpar(l[iRegistro])]);
  }

  const registros = [...porChave.values()].sort((a, b) => a[0].localeCompare(b[0], 'pt-BR'));
  const hoje = new Date().toISOString().slice(0, 10);
  const conteudo =
    `// ARQUIVO GERADO por scripts/atualizar-registros-anvisa.mjs — não edite à mão.\n` +
    `// Fonte: ${FONTE_URL} (registros ativos), gerado em ${hoje}.\n` +
    `// Campos: [nome do produto, princípio ativo, classe terapêutica, nº de registro]\n` +
    `export const GERADO_EM = '${hoje}';\n` +
    `export const REGISTROS = ${JSON.stringify(registros)};\n`;

  await writeFile(SAIDA, conteudo, 'utf8');
  console.log(`${ativos} registros ativos -> ${registros.length} produtos únicos.`);
  console.log(`Gravado em ${SAIDA} (${(Buffer.byteLength(conteudo) / 1024 / 1024).toFixed(1)} MB).`);
}

main().catch((e) => {
  console.error('Falha ao atualizar registros da ANVISA:', e.message);
  process.exit(1);
});
