/**
 * Define se a leitura de fotos pode acontecer.
 * Os resultados de exemplo existem só para testar a interface no computador de quem desenvolve:
 * no site publicado, sem chave, a rota responde com erro e nunca mostra um resultado inventado.
 */
export function hasVisionKey() {
  const key = process.env.OPENAI_API_KEY;
  return Boolean(key && key !== 'sua-chave-aqui');
}

export function isDemoAllowed() {
  return !process.env.VERCEL;
}

export const VISION_UNAVAILABLE = {
  status: 503,
  code: 'VISION_UNAVAILABLE',
  message: 'A leitura de fotos está indisponível no momento. Nenhum resultado foi gerado. Tente mais tarde.',
};
