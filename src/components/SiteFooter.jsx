import React from 'react';
import { NAV_ITEMS } from './Header';

export function SiteFooter({ onNavigate }) {
  return (
    <footer id="rodape" tabIndex={-1} className="bg-primary text-on-primary">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 grid gap-8 md:grid-cols-3">
        <div>
          <p className="text-[1.3rem] font-bold">Vivavós</p>
          <p className="mt-2 text-[0.95rem]">
            Ajuda pessoas idosas a entender remédios e exames, com explicação em voz alta e em palavras simples.
          </p>
        </div>

        <nav aria-label="Links do rodapé">
          <p className="font-bold mb-2">Navegação</p>
          <ul className="space-y-1">
            {NAV_ITEMS.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate(item.id);
                  }}
                  className="underline underline-offset-2 hover:no-underline"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <p className="font-bold mb-2">Aviso importante</p>
          <p className="text-[0.95rem]">
            Este site ajuda você a ler. Ele não substitui o médico nem o farmacêutico. As fotos são apagadas logo
            depois da leitura, e o histórico fica só neste aparelho (LGPD).
          </p>
        </div>
      </div>
      <div className="border-t border-on-primary">
        <p className="max-w-5xl mx-auto px-4 sm:px-6 py-4 text-[0.8rem]">
          Projeto acadêmico · Informações de bulas registradas na ANVISA · Conteúdo acessível em Libras com o VLibras
        </p>
      </div>
    </footer>
  );
}
