import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, History, House, ListOrdered, Menu, Settings2, ShieldCheck, Accessibility, X } from 'lucide-react';
import { Logo } from './Logo';

export const NAV_ITEMS = [
  { id: 'inicio', label: 'Início', description: 'Foto do remédio ou do exame', icon: House },
  { id: 'historico', label: 'Meu histórico', description: 'Remédios e exames que você já viu', icon: History },
  { id: 'ajustes', label: 'Ajustes de acessibilidade', description: 'Letra, cores, voz, legendas e mais', icon: Settings2 },
  { id: 'como-funciona', label: 'Como funciona', description: 'Os três passos do Vivavós', icon: ListOrdered },
  { id: 'seguranca', label: 'Segurança', description: 'Regras que o Vivavós sempre segue', icon: ShieldCheck },
  { id: 'acessibilidade', label: 'Sobre a acessibilidade', description: 'Libras, voz, atalhos de teclado', icon: Accessibility },
];

/**
 * Menu suspenso de navegação (padrão "disclosure"): um botão abre a lista de páginas.
 * Fecha com Esc, com um toque fora ou ao escolher um item. As setas andam pela lista.
 */
function MenuDropdown({ onNavigate, currentPage }) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);
  const buttonRef = useRef(null);
  const listRef = useRef(null);

  const links = () => Array.from(listRef.current?.querySelectorAll('a') || []);

  useEffect(() => {
    if (!open) return;
    links()[0]?.focus();

    const onPointerDown = (e) => {
      if (!wrapperRef.current?.contains(e.target)) setOpen(false);
    };
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const handleListKeyDown = (e) => {
    const items = links();
    const index = items.indexOf(document.activeElement);
    const moves = { ArrowDown: index + 1, ArrowUp: index - 1, Home: 0, End: items.length - 1 };
    if (!(e.key in moves)) return;
    e.preventDefault();
    items[(moves[e.key] + items.length) % items.length]?.focus();
  };

  const go = (id) => (e) => {
    e.preventDefault();
    setOpen(false);
    onNavigate(id);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls="menu-lista"
        onClick={() => setOpen((o) => !o)}
        className={`inline-flex items-center gap-2 min-h-[3rem] pl-3 pr-2.5 rounded-full border-2 font-bold transition ${
          open ? 'bg-primary text-on-primary border-primary' : 'bg-surface text-primary border-primary hover:bg-primary-soft'
        }`}
      >
        {open ? <X className="w-6 h-6" strokeWidth={2.5} aria-hidden="true" /> : <Menu className="w-6 h-6" strokeWidth={2.5} aria-hidden="true" />}
        <span>Menu</span>
        <ChevronDown className={`w-5 h-5 transition-transform ${open ? 'rotate-180' : ''}`} strokeWidth={2.5} aria-hidden="true" />
      </button>

      {open && (
        <ul
          id="menu-lista"
          ref={listRef}
          onKeyDown={handleListKeyDown}
          className="absolute right-0 top-full mt-2 z-50 w-[min(23rem,calc(100vw-2rem))] p-2 rounded-lg bg-surface border-2 border-strong shadow-card"
        >
          {NAV_ITEMS.map((item) => {
            const current = item.id === currentPage;
            return (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  onClick={go(item.id)}
                  aria-current={current ? 'page' : undefined}
                  className={`flex items-center gap-3 min-h-[3.5rem] px-3 py-2 rounded-md hover:bg-primary-soft ${
                    current ? 'bg-primary-soft' : ''
                  }`}
                >
                  <span
                    className="shrink-0 w-10 h-10 rounded-full bg-primary-soft text-primary flex items-center justify-center"
                    aria-hidden="true"
                  >
                    <item.icon className="w-5 h-5" strokeWidth={2.25} />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-bold text-primary leading-snug">{item.label}</span>
                    <span className="block text-[0.85rem] text-muted leading-snug">{item.description}</span>
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export function Header({ onNavigate, currentPage }) {
  const go = (id) => (e) => {
    e.preventDefault();
    onNavigate(id);
  };

  return (
    <header role="banner" className="sticky top-0 z-30 bg-surface border-t-[6px] border-primary border-b-2 border-b-strong">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
        <a href="#inicio" onClick={go('inicio')} className="flex items-center gap-2.5 min-w-0" aria-label="Vivavós, página inicial">
          <Logo className="w-12 h-12 shrink-0" />
          <span className="min-w-0">
            <span className="block text-[1.4rem] font-bold leading-none">Vivavós</span>
            <span className="block text-[0.8rem] text-muted mt-0.5">Informação para o paciente</span>
          </span>
        </a>

        <nav id="menu" aria-label="Menu principal" tabIndex={-1} className="flex items-center gap-2 shrink-0">
          <a
            href="#historico"
            onClick={go('historico')}
            aria-current={currentPage === 'historico' ? 'page' : undefined}
            className="hidden sm:inline-flex items-center gap-2 min-h-[3rem] px-3 font-bold text-primary rounded-full hover:bg-primary-soft hover:underline"
          >
            <History className="w-5 h-5" strokeWidth={2.5} aria-hidden="true" />
            Meu histórico
          </a>
          <MenuDropdown onNavigate={onNavigate} currentPage={currentPage} />
        </nav>
      </div>
    </header>
  );
}
