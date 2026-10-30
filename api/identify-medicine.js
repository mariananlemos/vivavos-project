import { getVisionProvider } from './_lib/vision/index.js';
import { guardRequest } from './_lib/http/guard.js';
import { hasVisionKey, isDemoAllowed, VISION_UNAVAILABLE } from './_lib/vision/availability.js';
import { searchOfficialBula } from './_lib/bulario/anvisaService.js';

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
      // Modo de demonstração instrutivo para permitir que o usuário teste a interface de voz
      // e os fluxos de acessibilidade antes de colar o token da API
      console.warn('AVISO: OPENAI_API_KEY não configurada no .env. Utilizando simulação de demonstração.');
      visionResult = {
        isLegible: true,
        confidence: 'high',
        medicineName: 'Losartana Potássica',
        dosage: '50 mg',
        form: 'comprimido',
        activeIngredient: 'Losartana potássica',
        laboratory: 'Genérico demonstrativo (Configure OPENAI_API_KEY no .env)',
        reasonIfIllegible: null,
      };
    } else {
      const visionProvider = getVisionProvider();
      visionResult = await visionProvider.analyzeMedicineBox(imageBase64);
    }

    // Regra de segurança 1: Imagem ilegível, borrada ou cortada -> nunca chuta, pede outra
    if (!visionResult.isLegible) {
      return res.status(200).json({
        success: true,
        isLegible: false,
        reason: visionResult.reasonIfIllegible || 'A foto ficou um pouco embaçada ou cortada.',
        voicePrompt: `A foto não ficou nítida o suficiente. ${visionResult.reasonIfIllegible || 'Não deu para ler com certeza.'} Por favor, tire outra foto com a caixa bem de frente e boa luz.`,
      });
    }

    // Regra de segurança 2: Busca OBRIGATÓRIA na fonte oficial (Bula ANVISA)
    const bulaResult = await searchOfficialBula(visionResult.medicineName, visionResult.activeIngredient);

    // Texto de confirmação obrigatório antes de qualquer explicação
    const voiceConfirmationText = `Li ${visionResult.medicineName}${visionResult.dosage ? ` ${visionResult.dosage}` : ''}. Está certo?`;
    const detail = [visionResult.dosage, visionResult.form].filter(Boolean).join(' · ');

    return res.status(200).json({
      success: true,
      isLegible: true,
      confidence: visionResult.confidence,
      medicine: {
        name: visionResult.medicineName,
        dosage: visionResult.dosage,
        form: visionResult.form,
        activeIngredient: visionResult.activeIngredient,
        laboratory: visionResult.laboratory,
      },
      // Confirmação por voz que deve acontecer antes da explicação
      confirmation: {
        voiceText: voiceConfirmationText,
        items: [{ title: visionResult.medicineName, detail: detail || null }],
      },
      // Informações oficiais da bula para serem liberadas após o "Sim"
      bulaOfficial: bulaResult.found ? bulaResult.bula : null,
      bulaFound: bulaResult.found,
      bulaMessageIfNotReceived: bulaResult.found ? null : bulaResult.message,
      usingMock: !hasApiKey,
    });
  } catch (error) {
    console.error('Erro em /api/identify-medicine:', error);
    return res.status(500).json({
      error: {
        message: error.message || 'Falha ao analisar a foto do medicamento. Tente novamente.',
      },
    });
  }
}
