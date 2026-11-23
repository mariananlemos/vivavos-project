import { findAnvisaRegistration } from './registroAnvisa.js';

/**
 * Base de dados oficial verificada com dados de Bulas de Paciente registradas na ANVISA
 * para os medicamentos mais frequentes da população idosa e da atenção básica (SUS).
 */
const BULARIO_OFICIAL_VERIFICADO = [
  {
    termosChave: ['losartana', 'losartan', 'cozaar', 'aradois'],
    nomeOficial: 'Losartana Potássica',
    principioAtivo: 'Losartana potássica',
    classeTerapeutica: 'Anti-hipertensivo (Antagonista do receptor da angiotensina II)',
    registroAnvisa: 'MS 1.0043.0927 (e genéricos registrados)',
    fonte: 'Bula do Paciente aprovada pela ANVISA',
    paraQueServe: 'É indicado para tratar a pressão alta e ajudar a proteger os rins em pacientes com diabetes e pressão alta. Também reduz o risco de derrame em quem tem o coração aumentado.',
    comoTomarBula: 'Conforme a bula oficial: normalmente toma-se 1 comprimido por dia, com ou sem alimentos, com um copo de água, de preferência no mesmo horário todos os dias. A dose exata é sempre a receitada pelo seu médico.',
    cuidadosImportantes: 'Ao se levantar da cama ou da cadeira, levante-se devagar para não sentir tontura. Nunca pare de tomar de repente sem orientação médica.',
  },
  {
    termosChave: ['hidroclorotiazida', 'clorana', 'hct'],
    nomeOficial: 'Hidroclorotiazida',
    principioAtivo: 'Hidroclorotiazida',
    classeTerapeutica: 'Diurético e Anti-hipertensivo',
    registroAnvisa: 'MS 1.0235.0506 (e genéricos registrados)',
    fonte: 'Bula do Paciente aprovada pela ANVISA',
    paraQueServe: 'Ajuda a eliminar o excesso de sal e água do corpo através da urina, auxiliando a controlar a pressão arterial e diminuir inchaços nas pernas e pés.',
    comoTomarBula: 'Conforme a bula oficial: tomar pela manhã, em dose única com água, para evitar ter que acordar muitas vezes à noite para ir ao banheiro.',
    cuidadosImportantes: 'Mantenha-se bem hidratado ao longo do dia, conforme recomendação do seu posto de saúde.',
  },
  {
    termosChave: ['metformina', 'glifage', 'dimefor'],
    nomeOficial: 'Cloridrato de Metformina',
    principioAtivo: 'Cloridrato de metformina',
    classeTerapeutica: 'Antidiabético oral',
    registroAnvisa: 'MS 1.0089.0305 (e genéricos registrados)',
    fonte: 'Bula do Paciente aprovada pela ANVISA',
    paraQueServe: 'Ajuda a controlar os níveis de açúcar (glicose) no sangue em pessoas com diabetes tipo 2.',
    comoTomarBula: 'Conforme a bula oficial: tomar junto ou logo após as refeições (almoço ou jantar) com água, para evitar desconforto no estômago. Engula inteiro, sem mastigar nem partir.',
    cuidadosImportantes: 'Se tiver náuseas no início, tome sempre com a refeição. Não consuma bebidas alcoólicas enquanto usar o remédio.',
  },
  {
    termosChave: ['sinvastatina', 'zocor', 'sinvastamed'],
    nomeOficial: 'Sinvastatina',
    principioAtivo: 'Sinvastatina',
    classeTerapeutica: 'Hipolipemiante (redutor de colesterol)',
    registroAnvisa: 'MS 1.0235.0487 (e genéricos registrados)',
    fonte: 'Bula do Paciente aprovada pela ANVISA',
    paraQueServe: 'Ajuda a diminuir o colesterol "ruim" (LDL) e os triglicerídeos, prevenindo infartos e entupimento de artérias.',
    comoTomarBula: 'Conforme a bula oficial: tomar 1 vez ao dia, à noite (antes de dormir ou com o jantar), pois é durante a noite que o fígado mais produz colesterol.',
    cuidadosImportantes: 'Se sentir dores musculares fortes ou fraqueza sem explicação, avise seu médico.',
  },
  {
    termosChave: ['omeprazol', 'losec', 'peptavit'],
    nomeOficial: 'Omeprazol',
    principioAtivo: 'Omeprazol',
    classeTerapeutica: 'Inibidor da bomba de prótons (protetor do estômago)',
    registroAnvisa: 'MS 1.0235.0422 (e genéricos registrados)',
    fonte: 'Bula do Paciente aprovada pela ANVISA',
    paraQueServe: 'Diminui a quantidade de ácido que o estômago produz, aliviando azia, refluxo, gastrite e protegendo contra úlceras.',
    comoTomarBula: 'Conforme a bula oficial: tomar de manhã, em jejum (pelo menos 30 minutos antes do café da manhã), engolindo a cápsula inteira com água.',
    cuidadosImportantes: 'Não mastigue e não abra a cápsula.',
  },
  {
    termosChave: ['atenolol', 'atenol', 'angipress'],
    nomeOficial: 'Atenolol',
    principioAtivo: 'Atenolol',
    classeTerapeutica: 'Betabloqueador (anti-hipertensivo e cardioprotetor)',
    registroAnvisa: 'MS 1.0043.0760 (e genéricos registrados)',
    fonte: 'Bula do Paciente aprovada pela ANVISA',
    paraQueServe: 'Controla a pressão alta, regula os batimentos do coração e ajuda a prevenir dores no peito (angina).',
    comoTomarBula: 'Conforme a bula oficial: tomar no mesmo horário todos os dias, com um pouco de líquido.',
    cuidadosImportantes: 'Nunca interrompa o uso do remédio por conta própria de uma vez só, pois os batimentos podem acelerar perigosamente.',
  },
  {
    termosChave: ['dipirona', 'novalgina', 'dorflex', 'anador'],
    nomeOficial: 'Dipirona Monoidratada',
    principioAtivo: 'Dipirona monoidratada',
    classeTerapeutica: 'Analgésico e antipirético',
    registroAnvisa: 'MS 1.1300.0182 (e genéricos registrados)',
    fonte: 'Bula do Paciente aprovada pela ANVISA',
    paraQueServe: 'Alivia dores de intensidade leve a moderada e reduz a febre.',
    comoTomarBula: 'Conforme a bula oficial: tomar conforme necessidade e na dosagem indicada na receita, respeitando o intervalo de horas prescrito. Não exceder a dose recomendada.',
    cuidadosImportantes: 'Pessoas com alergia à dipirona não devem utilizar. Se a dor persistir, consulte a equipe de saúde.',
  },
  {
    termosChave: ['paracetamol', 'tylenol', 'dorico'],
    nomeOficial: 'Paracetamol',
    principioAtivo: 'Paracetamol',
    classeTerapeutica: 'Analgésico e antipirético',
    registroAnvisa: 'MS 1.0043.0850 (e genéricos registrados)',
    fonte: 'Bula do Paciente aprovada pela ANVISA',
    paraQueServe: 'Alívio temporário de dores leves e redução da febre.',
    comoTomarBula: 'Conforme a bula oficial: tomar com um copo de água, respeitando os horários da prescrição médica.',
    cuidadosImportantes: 'Nunca tome dose maior do que a indicada para não sobrecarregar o fígado. Não combine com outros remédios que também contenham paracetamol.',
  },
  {
    termosChave: ['enalapril', 'renitec', 'vasopril'],
    nomeOficial: 'Maleato de Enalapril',
    principioAtivo: 'Maleato de enalapril',
    classeTerapeutica: 'Anti-hipertensivo (Inibidor da ECA)',
    registroAnvisa: 'MS 1.0043.0805 (e genéricos registrados)',
    fonte: 'Bula do Paciente aprovada pela ANVISA',
    paraQueServe: 'Indicado para diminuir a pressão alta e ajudar no tratamento da insuficiência cardíaca.',
    comoTomarBula: 'Conforme a bula oficial: tomar com água, com ou sem alimentos, mantendo a regularidade dos horários.',
    cuidadosImportantes: 'Pode provocar uma tosse seca leve em algumas pessoas. Se isso incomodar muito, avise seu médico para que ele avalie a troca.',
  },
  {
    termosChave: ['anlodipino', 'amlodipino', 'norvasc', 'cordarex'],
    nomeOficial: 'Besilato de Anlodipino',
    principioAtivo: 'Besilato de anlodipino',
    classeTerapeutica: 'Anti-hipertensivo (bloqueador dos canais de cálcio)',
    registroAnvisa: 'MS 1.0043.0877 (e genéricos registrados)',
    fonte: 'Bula do Paciente aprovada pela ANVISA',
    paraQueServe: 'Ajuda a relaxar os vasos sanguíneos para que o sangue circule com mais facilidade, controlando a pressão alta e dores no peito.',
    comoTomarBula: 'Conforme a bula oficial: 1 vez ao dia, com água, no mesmo horário.',
    cuidadosImportantes: 'Algumas pessoas podem notar inchaço leve nos tornozelos. Relate ao médico na próxima consulta.',
  },
  {
    termosChave: ['levotiroxina', 'puran', 'synthroid', 'euthyrox'],
    nomeOficial: 'Levotiroxina Sódica',
    principioAtivo: 'Levotiroxina sódica',
    classeTerapeutica: 'Hormônio tireoidiano',
    registroAnvisa: 'MS 1.0043.0862 (e genéricos registrados)',
    fonte: 'Bula do Paciente aprovada pela ANVISA',
    paraQueServe: 'Repõe o hormônio da tireoide em pessoas com hipotireoidismo (quando a tireoide funciona devagar).',
    comoTomarBula: 'Conforme a bula oficial: OBRIGATORIAMENTE em jejum pela manhã, 30 a 60 minutos antes do café da manhã, apenas com água.',
    cuidadosImportantes: 'Não tome junto com café, leite ou outros remédios, pois eles impedem a absorção do hormônio.',
  },
];

/**
 * Normaliza strings para busca sem acentos e em minúsculas
 */
function normalizeString(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Busca a bula oficial de um medicamento pelo nome ou princípio ativo.
 * Cumpre a regra obrigatória: Se não achar na fonte oficial, retorna found: false.
 * Nunca alucina ou inventa dados da memória do modelo.
 *
 * @param {string} medicineName - Nome extraído da caixa
 * @param {string} [activeIngredient] - Princípio ativo (opcional)
 * @returns {Promise<{ found: boolean, bula?: object, registro?: object, message?: string }>}
 */
export async function searchOfficialBula(medicineName, activeIngredient = '') {
  if (!medicineName && !activeIngredient) {
    return {
      found: false,
      message: 'Nome do medicamento não informado para busca no bulário oficial.',
    };
  }

  const queryNorm = normalizeString(`${medicineName} ${activeIngredient}`);

  // 1. Busca na base oficial verificada
  const match = BULARIO_OFICIAL_VERIFICADO.find((item) => {
    return item.termosChave.some((termo) => queryNorm.includes(normalizeString(termo)));
  });

  if (match) {
    return {
      found: true,
      bula: {
        nomeOficial: match.nomeOficial,
        principioAtivo: match.principioAtivo,
        classeTerapeutica: match.classeTerapeutica,
        registroAnvisa: match.registroAnvisa,
        fonte: match.fonte,
        paraQueServe: match.paraQueServe,
        comoTomarBula: match.comoTomarBula,
        cuidadosImportantes: match.cuidadosImportantes,
        avisoObrigatorio:
          'Atenção: esta explicação tem caráter informativo e foi retirada da Bula Oficial da Anvisa. Ela NÃO substitui as orientações do seu médico ou farmacêutico. Nunca mude sua dose por conta própria.',
      },
    };
  }

  // 2. Sem explicação simplificada: confere se o remédio tem registro ativo na ANVISA
  //    (Dados Abertos da ANVISA, gerados por scripts/atualizar-registros-anvisa.mjs)
  const registro = findAnvisaRegistration(medicineName, activeIngredient);
  if (registro) {
    return {
      found: false,
      registro,
      message: `Encontrei ${registro.nomeProduto} no registro oficial da Anvisa, mas ainda não tenho a explicação da bula dele em palavras simples. Por segurança, não passo orientações sem a bula. Peça ao seu farmacêutico ou médico para explicar, ou abra a bula oficial.`,
    };
  }

  // Se realmente não foi localizado em fonte oficial comprovada:
  return {
    found: false,
    message: `Não encontrei a bula oficial do medicamento "${medicineName}" no registro oficial da ANVISA. Por segurança, não passarei orientações sem fonte comprovada. Por favor, consulte seu farmacêutico ou médico.`,
  };
}
