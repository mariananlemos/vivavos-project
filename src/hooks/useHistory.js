import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'vivavos-historico';
const SAVE_KEY = 'vivavos-historico-ligado';
const MAX_ITEMS = 200;

function read(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

function newId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

/** Resumo de uma leitura confirmada, para a lista do histórico */
function summarize(kind, data) {
  if (kind === 'medicine') {
    const { name, dosage, form } = data.medicine;
    return { title: name, detail: [dosage, form].filter(Boolean).join(' · ') };
  }
  return {
    title: data.tests.map((t) => t.name).join(', '),
    detail: data.tests.map((t) => `${t.valueText}${t.unit ? ` ${t.unit}` : ''}: ${t.statusLabel}`).join(' · '),
  };
}

/**
 * Histórico de remédios e exames. Fica SÓ neste aparelho (localStorage):
 * guarda o texto que o Vivavós leu e explicou, nunca a foto.
 */
export function useHistory() {
  const [items, setItems] = useState(() => read(STORAGE_KEY, []));
  const [saveEnabled, setSaveEnabled] = useState(() => read(SAVE_KEY, true));

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Armazenamento cheio ou bloqueado
    }
  }, [items]);

  useEffect(() => {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(saveEnabled));
    } catch {
      // Armazenamento bloqueado
    }
  }, [saveEnabled]);

  const add = (item) => setItems((list) => [item, ...list].slice(0, MAX_ITEMS));

  /** Guarda uma leitura confirmada pela pessoa. Devolve false se o histórico estiver desligado. */
  const addFromResult = useCallback(
    (kind, data) => {
      if (!saveEnabled) return false;
      const { confirmation, ...result } = data;
      add({ id: newId(), kind, source: 'foto', createdAt: new Date().toISOString(), ...summarize(kind, data), data: result });
      return true;
    },
    [saveEnabled]
  );

  /** Anotação feita à mão (remédio que a pessoa toma, exame que fez), sem foto */
  const addManual = useCallback(({ kind, title, detail, note, date }) => {
    // Data escolhida no campo (AAAA-MM-DD) ao meio-dia, para não mudar de dia por causa do fuso
    const createdAt = date ? new Date(`${date}T12:00:00`).toISOString() : new Date().toISOString();
    add({ id: newId(), kind, source: 'anotacao', createdAt, title, detail: detail || '', note: note || '', data: null });
  }, []);

  const remove = useCallback((id) => setItems((list) => list.filter((item) => item.id !== id)), []);
  const clear = useCallback(() => setItems([]), []);

  return { items, saveEnabled, setSaveEnabled, addFromResult, addManual, remove, clear };
}
