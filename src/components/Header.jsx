import React from 'react';
import { AudioLines } from 'lucide-react';

export const NAV_ITEMS = [
  { id: 'inicio', label: 'Início' },
  { id: 'como-funciona', label: 'Como funciona' },
  { id: 'seguranca', label: 'Segurança' },
  { id: 'acessibilidade', label: 'Acessibilidade' },
];

export function Header({ onNavigate }) {
  const go = (id) => (e) => {
    e.preventDefault();
    onNavigate(id);
  };

  return (
    <header role="banner" className="sticky top-0 z-30 bg-surface border-t-[6px] border-primary border-b-2 border-b-strong">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
        <a href="#inicio" onClick={go('inicio')} className="flex items-center gap-2.5" aria-label="Vivavós, página inicial">
          <span className="w-10 h-10 rounded-md bg-primary flex items-center justify-center" aria-hidden="true">
            <AudioLines className="w-6 h-6 text-logo-wave" strokeWidth={2.5} />
          </span>
          <span>
            <span className="block text-[1.4rem] font-bold leading-none">Vivavós</span>
            <span className="block text-[0.8rem] text-muted mt-0.5">Informação para o paciente</span>
          </span>
        </a>

        <nav id="menu" aria-label="Menu principal" tabIndex={-1} className="w-full md:w-auto">
          <ul className="flex gap-x-1 -mx-2 md:mx-0 overflow-x-auto whitespace-nowrap no-scrollbar">
            {NAV_ITEMS.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  onClick={go(item.id)}
                  className="inline-flex items-center min-h-[2.75rem] px-2 md:px-3 font-bold text-primary rounded-md hover:bg-primary-soft hover:underline"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
