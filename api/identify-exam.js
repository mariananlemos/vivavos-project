import { getVisionProvider } from './_lib/vision/index.js';
import { guardRequest } from './_lib/http/guard.js';
import { hasVisionKey, isDemoAllowed, VISION_UNAVAILABLE } from './_lib/vision/availability.js';
import { evaluateResult } from './_lib/exam/evaluateResult.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: { message: 'Método não permitido. Utilize POST.' } });
  }

  // Só o próprio site, com limite de uso, para proteger os créditos da OpenAI
  const rejection = guardRequest(req);
  if (rejection) {
    return res.status(rejection.status).json({ error: { code: rejection.code, message: rejection.message } });
  }

  try {
    const { imageBase64, userConsent } = req.body || {};

    // Validação LGPD
    if (!userConsent) {
      return res.status(400).json({
        error: {
          code: 'CONSENT_REQUIRED',
          message: 'É necessário o consentimento para processamento da imagem em conformidade com a LGPD.',
        },
      });
    }

    if (!imageBase64) {
      return res.status(400).json({
        error: {
          code: 'IMAGE_REQUIRED',
          message: 'Nenhuma imagem foi recebida para análise.',
        },
      });
    }

    let visionResult;
    const hasApiKey = hasVisionKey();

    if (!hasApiKey && !isDemoAllowed()) {
      const { status, code, message } = VISION_UNAVAILABLE;
      return res.status(status).json({ error: { code, message } });
    }

    if (!hasApiKey) {
      // Modo de demonstração para testar a interface antes de configurar a chave da API
      console.warn('AVISO: OPENAI_API_KEY não configurada no .env. Utilizando simulação de demonstração.');
      visionResult = {
        isLegible: true,
        confidence: 'high',
        reasonIfIllegible: null,
        tests: [
          { name: 'Glicemia em jejum', value: 112, valueText: '112', unit: 'mg/dL', refMin: 70, refMax: 99, refText: '70 a 99 mg/dL' },
        ],
      };
    } else {
      visionResult = await getVisionProvider().analyzeExam(imageBase64);
    }

    // Regra de segurança: laudo ilegível, borrado ou cortado -> nunca chuta, pede outra foto
    if (!visionResult.isLegible) {
      return res.status(200).json({
        success: true,
        isLegible: false,
        reason: visionResult.reasonIfIllegible || 'A foto ficou um pouco embaçada ou cortada.',
        voicePrompt: `A foto não ficou nítida o suficiente. ${visionResult.reasonIfIllegible || 'Não deu para ler os números com certeza.'} Por favor, tire outra foto do papel bem de frente e com boa luz.`,
      });
    }

    const tests = visionResult.tests.map(evaluateResult);
    const spoken = tests.map((t) => `${t.name}, resultado ${t.valueText}${t.unit ? ` ${t.unit}` : ''}`).join('; ');

    return res.status(200).json({
      success: true,
      isLegible: true,
      confidence: visionResult.confidence,
      tests,
      // Confirmação por voz que deve acontecer antes da explicação
      confirmation: {
        voiceText: `Li ${spoken}. Está certo?`,
        items: tests.map((t) => ({ title: t.name, detail: `${t.valueText}${t.unit ? ` ${t.unit}` : ''}` })),
      },
      usingMock: !hasApiKey,
    });
  } catch (error) {
    console.error('Erro em /api/identify-exam:', error);
    return res.status(500).json({
      error: {
        message: error.message || 'Falha ao analisar a foto do exame. Tente novamente.',
      },
    });
  }
}
