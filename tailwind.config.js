/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Cores vêm de variáveis CSS (src/index.css) para o modo de alto contraste trocar tudo de uma vez
      colors: {
        page: 'var(--c-page)',
        surface: 'var(--c-surface)',
        ink: 'var(--c-ink)',
        muted: 'var(--c-muted)',
        line: 'var(--c-line)',
        strong: 'var(--c-strong)',
        primary: 'var(--c-primary)',
        'primary-soft': 'var(--c-primary-soft)',
        'primary-icon': 'var(--c-primary-icon)',
        'on-primary': 'var(--c-on-primary)',
        accent: 'var(--c-accent)',
        'on-accent': 'var(--c-on-accent)',
        'warn-soft': 'var(--c-warn-soft)',
        ok: 'var(--c-ok)',
        'ok-soft': 'var(--c-ok-soft)',
        danger: 'var(--c-danger)',
      },
      fontFamily: {
        // Tipo de letra escolhido em "Ajustes de acessibilidade" (src/index.css)
        sans: ['var(--font-body)'],
      },
      boxShadow: {
        card: '0 10px 30px -12px rgba(19, 23, 26, 0.25)',
      },
    },
  },
  plugins: [],
}
