// O que pode ser tocado/ativado e o que é só texto, para o leitor de toque e para a lupa
const INTERACTIVE = 'button, a[href], input, select, textarea, label, summary, [role="button"], [role="switch"]';
const TEXTUAL = 'h1, h2, h3, h4, p, li, legend, dt, dd, figcaption, th, td';

export function findInteractive(el) {
  return el?.closest?.(INTERACTIVE) || null;
}

/** Elemento que faz sentido ler: o botão/link tocado ou o parágrafo/título em volta */
export function findReadable(el) {
  if (!el?.closest || el.closest('[aria-hidden="true"], [data-a11y-ui]')) return null;
  return findInteractive(el) || el.closest(TEXTUAL);
}

/** Texto curto que descreve o elemento, como um leitor de tela falaria */
export function readableText(el) {
  if (!el) return '';
  let text;

  if (el.matches('input, select, textarea')) {
    const label = el.labels?.[0]?.innerText || el.getAttribute('aria-label') || el.placeholder || '';
    if (el.type === 'radio' || el.type === 'checkbox') {
      text = `${label}${el.checked ? ', marcado' : ''}`;
    } else {
      text = `${label}${el.value ? `: ${el.value}` : ', campo vazio'}`;
    }
  } else {
    text = el.getAttribute('aria-label') || el.innerText || '';
    if (el.getAttribute('role') === 'switch') text += el.getAttribute('aria-checked') === 'true' ? ', ligado' : ', desligado';
    if (el.getAttribute('aria-pressed') === 'true') text += ', ativado';
    if (el.hasAttribute('aria-expanded')) text += el.getAttribute('aria-expanded') === 'true' ? ', aberto' : ', fechado';
  }

  return text.replace(/\s+/g, ' ').trim().slice(0, 300);
}
