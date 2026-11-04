import React, { useId, useMemo, useRef, useState } from 'react';
import { Camera, Eye, FileText, History, PencilLine, Pill, Save, Search, Trash2, Volume2 } from 'lucide-react';
import { BackLink, Button, Notice, StatusPill, Title } from '../components/ui';
import { ChoiceGroup, Switch } from '../components/controls';
import { MedicineResult, medicineSpeech } from './MedicineResult';
import { ExamResult, examSpeech } from './ExamResult';

const KINDS = {
  medicine: { label: 'Remédio', icon: Pill, Result: MedicineResult, speech: medicineSpeech },
  exam: { label: 'Exame', icon: FileText, Result: ExamResult, speech: examSpeech },
};

// Sugestões para digitar menos (Entrada de Dados > Preenchimento)
const COMMON_NAMES = {
  medicine: [
    'Losartana', 'Metformina', 'Sinvastatina', 'Atorvastatina', 'Omeprazol', 'Ácido acetilsalicílico (AAS)',
    'Hidroclorotiazida', 'Anlodipino', 'Atenolol', 'Levotiroxina', 'Insulina', 'Glibenclamida', 'Enalapril',
    'Captopril', 'Dipirona', 'Paracetamol', 'Carbonato de cálcio', 'Vitamina D',
  ],
  exam: [
    'Glicemia em jejum', 'Hemoglobina glicada', 'Colesterol total', 'Colesterol HDL', 'Colesterol LDL',
    'Triglicerídeos', 'Hemograma', 'Creatinina', 'Ureia', 'TSH', 'Vitamina D', 'Vitamina B12', 'Ácido úrico', 'PSA',
  ],
};
const MEDICINE_TIMES = ['De manhã', 'Na hora do almoço', 'À tarde', 'À noite', 'Antes de dormir'];

const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

function dayLabel(date) {
  const startOf = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diff = Math.round((startOf(new Date()) - startOf(date)) / 86400000);
  if (diff === 0) return 'Hoje';
  if (diff === 1) return 'Ontem';
  return date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
}

const timeLabel = (date) => date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

/** O que o Vivavós fala ao tocar em "Ouvir" num item do histórico */
export function historySpeech(item) {
  if (item.data) return KINDS[item.kind].speech(item.data);
  const date = new Date(item.createdAt);
  return [
    `${KINDS[item.kind].label}: ${item.title}.`,
    item.detail && `${item.detail}.`,
    item.note && `Anotação: ${item.note}.`,
    `Anotado em ${dayLabel(date).toLowerCase()}.`,
  ]
    .filter(Boolean)
    .join(' ');
}

/** Explicação completa de uma leitura guardada, reaproveitando as telas de resultado */
export function HistoryItemView({ item, tts, onBack }) {
  const { Result } = KINDS[item.kind];
  const date = new Date(item.createdAt);

  return (
    <div>
      <p className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full bg-primary-soft text-primary font-bold text-[0.9rem]">
        <History className="w-4 h-4" strokeWidth={2.5} aria-hidden="true" />
        Do seu histórico · {dayLabel(date)}, às {timeLabel(date)}
      </p>
      <Result
        data={item.data}
        onListen={() => tts.speak(historySpeech(item), null, { manual: true })}
        onHome={onBack}
        homeLabel="Voltar ao histórico"
      />
    </div>
  );
}

function ManualEntryForm({ items, suggestions, onSave, onCancel }) {
  const [kind, setKind] = useState('medicine');
  const [title, setTitle] = useState('');
  const [detail, setDetail] = useState('');
  const [times, setTimes] = useState([]);
  const [date, setDate] = useState(today);
  const [note, setNote] = useState('');
  const [error, setError] = useState(null);
  const titleRef = useRef(null);
  const id = useId();

  const names = useMemo(() => {
    const own = items.filter((i) => i.kind === kind).map((i) => i.title);
    return [...new Set([...own, ...COMMON_NAMES[kind]])];
  }, [items, kind]);

  const toggleTime = (t) => setTimes((list) => (list.includes(t) ? list.filter((x) => x !== t) : [...list, t]));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError(kind === 'medicine' ? 'Escreva o nome do remédio.' : 'Escreva o nome do exame.');
      titleRef.current?.focus();
      return;
    }
    const fullDetail = [detail.trim(), kind === 'medicine' && times.length ? times.join(', ') : null].filter(Boolean).join(' · ');
    onSave({ kind, title: title.trim(), detail: fullDetail, note: note.trim(), date });
  };

  const field = 'w-full min-h-[3.25rem] px-4 py-2 rounded-lg border-2 border-strong bg-surface text-ink text-[1.05rem]';
  const isMedicine = kind === 'medicine';

  return (
    <form onSubmit={handleSubmit} noValidate className="mt-4 p-5 rounded-lg bg-surface border-2 border-primary space-y-5">
      <h2 className="text-[1.3rem] font-bold">Anotar à mão</h2>

      <ChoiceGroup
        legend="O que você quer anotar?"
        value={kind}
        onChange={(k) => {
          setKind(k);
          setError(null);
        }}
        options={[
          { value: 'medicine', label: 'Um remédio que eu tomo' },
          { value: 'exam', label: 'Um exame que eu fiz' },
        ]}
      />

      <div>
        <label htmlFor={`${id}-nome`} className="block font-bold text-[1.05rem]">
          {isMedicine ? 'Nome do remédio' : 'Nome do exame'}
        </label>
        <input
          ref={titleRef}
          id={`${id}-nome`}
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setError(null);
          }}
          list={suggestions ? `${id}-sugestoes` : undefined}
          autoComplete={suggestions ? 'on' : 'off'}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-erro` : undefined}
          className={`${field} mt-1`}
        />
        {suggestions && (
          <datalist id={`${id}-sugestoes`}>
            {names.map((n) => (
              <option key={n} value={n} />
            ))}
          </datalist>
        )}
        {error && (
          <p id={`${id}-erro`} role="alert" className="mt-1 font-bold text-danger">
            {error}
          </p>
        )}
      </div>

      <div>
        <label htmlFor={`${id}-detalhe`} className="block font-bold text-[1.05rem]">
          {isMedicine ? 'Dose (se souber)' : 'Resultado (se souber)'}
        </label>
        <p className="text-[0.9rem] text-muted">{isMedicine ? 'Por exemplo: 50 mg, 1 comprimido' : 'Por exemplo: 112 mg/dL'}</p>
        <input
          id={`${id}-detalhe`}
          type="text"
          value={detail}
          onChange={(e) => setDetail(e.target.value)}
          className={`${field} mt-1`}
        />
      </div>

      {isMedicine && (
        <fieldset>
          <legend className="font-bold text-[1.05rem]">Quando você toma?</legend>
          <p className="text-[0.9rem] text-muted">Toque em quantos quiser.</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {MEDICINE_TIMES.map((t) => {
              const on = times.includes(t);
              return (
                <button
                  key={t}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggleTime(t)}
                  className={`min-h-[3rem] px-4 rounded-full border-2 font-bold ${
                    on ? 'bg-primary text-on-primary border-primary' : 'bg-surface text-ink border-strong hover:bg-page'
                  }`}
                >
                  {on ? '✓ ' : ''}
                  {t}
                </button>
              );
            })}
          </div>
        </fieldset>
      )}

      <div>
        <label htmlFor={`${id}-data`} className="block font-bold text-[1.05rem]">
          {isMedicine ? 'Desde quando' : 'Data do exame'}
        </label>
        <input
          id={`${id}-data`}
          type="date"
          value={date}
          max={today()}
          onChange={(e) => setDate(e.target.value)}
          className={`${field} mt-1 sm:max-w-xs`}
        />
      </div>

      <div>
        <label htmlFor={`${id}-nota`} className="block font-bold text-[1.05rem]">
          Anotação (opcional)
        </label>
        <p className="text-[0.9rem] text-muted">Por exemplo: o médico pediu para tomar por 30 dias.</p>
        <textarea
          id={`${id}-nota`}
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className={`${field} mt-1`}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Button type="submit" icon={Save}>
          Guardar anotação
        </Button>
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}

function HistoryCard({ item, onOpen, onListen, onRemove }) {
  const [confirming, setConfirming] = useState(false);
  const { label, icon: Icon } = KINDS[item.kind];
  const date = new Date(item.createdAt);

  return (
    <li className="p-4 sm:p-5 rounded-lg bg-surface border-2 border-line">
      <div className="flex gap-4">
        <span className="shrink-0 w-12 h-12 rounded-full bg-primary-soft text-primary flex items-center justify-center" aria-hidden="true">
          <Icon className="w-6 h-6" strokeWidth={2.25} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[0.9rem] text-muted">
            {label} · {item.source === 'foto' ? `lido da foto às ${timeLabel(date)}` : 'anotado à mão'}
          </p>
          <h3 className="text-[1.3rem] font-bold leading-tight break-words">{item.title}</h3>
          {item.kind === 'exam' && item.data ? (
            <ul className="mt-2 flex flex-wrap gap-2">
              {item.data.tests.map((t, i) => (
                <li key={i}>
                  <StatusPill tone={t.tone}>
                    {item.data.tests.length > 1 ? `${t.name}: ` : ''}
                    {t.valueText}
                    {t.unit ? ` ${t.unit}` : ''} · {t.statusLabel}
                  </StatusPill>
                </li>
              ))}
            </ul>
          ) : (
            item.detail && <p className="mt-0.5 text-[1.05rem]">{item.detail}</p>
          )}
          {item.note && (
            <p className="mt-2 px-3 py-1.5 rounded-md bg-warn-soft">
              <strong>Anotação:</strong> {item.note}
            </p>
          )}
        </div>
      </div>

      {confirming ? (
        <div className="mt-4 space-y-3">
          <Notice label="Apagar do histórico?">{item.title} vai sair da lista. Isso não pode ser desfeito.</Notice>
          <div className="grid gap-3 sm:grid-cols-2">
            <Button variant="outline" icon={Trash2} onClick={() => onRemove(item)}>
              Sim, apagar
            </Button>
            <Button variant="outlinePrimary" onClick={() => setConfirming(false)}>
              Não, manter
            </Button>
          </div>
        </div>
      ) : (
        <div className={`mt-4 grid gap-3 ${item.data ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}>
          {item.data && (
            <Button icon={Eye} onClick={() => onOpen(item)} aria-label={`Ver explicação de ${item.title}`}>
              Ver explicação
            </Button>
          )}
          <Button variant="accent" icon={Volume2} onClick={() => onListen(item)} aria-label={`Ouvir ${item.title}`}>
            Ouvir
          </Button>
          <Button variant="outline" icon={Trash2} onClick={() => setConfirming(true)} aria-label={`Apagar ${item.title}`}>
            Apagar
          </Button>
        </div>
      )}
    </li>
  );
}

export function HistoryScreen({ history, prefs, tts, notify, onHome, onOpenItem, onPickPhoto }) {
  const { items, saveEnabled, setSaveEnabled, addManual, remove, clear } = history;
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const searchId = useId();

  const counts = {
    all: items.length,
    medicine: items.filter((i) => i.kind === 'medicine').length,
    exam: items.filter((i) => i.kind === 'exam').length,
  };

  // Mais recentes primeiro, agrupados por dia
  const groups = useMemo(() => {
    const normalize = (t) => (t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    const q = normalize(query.trim());
    const visible = items
      .filter((i) => filter === 'all' || i.kind === filter)
      .filter((i) => !q || normalize(`${i.title} ${i.detail} ${i.note}`).includes(q))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const byDay = new Map();
    for (const item of visible) {
      const label = dayLabel(new Date(item.createdAt));
      if (!byDay.has(label)) byDay.set(label, []);
      byDay.get(label).push(item);
    }
    return [...byDay.entries()];
  }, [items, filter, query]);

  const handleSave = (entry) => {
    addManual(entry);
    setFormOpen(false);
    setFilter('all');
    notify('Anotação guardada no seu histórico.');
  };

  const handleRemove = (item) => {
    remove(item.id);
    notify(`${item.title} saiu do seu histórico.`, { tone: 'info' });
  };

  const handleClear = () => {
    clear();
    setConfirmClear(false);
    notify('Seu histórico foi apagado.', { tone: 'info' });
  };

  return (
    <div className="bg-page border-t border-line">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 md:py-12">
        <BackLink onClick={onHome} />
        <Title>Meu histórico</Title>
        <p className="mt-2 text-[1.1rem]">
          Os remédios e exames que você conferiu no Vivavós. Fica guardado <strong>só neste aparelho</strong>, e só o texto: as
          fotos nunca são guardadas.
        </p>

        {formOpen ? (
          <ManualEntryForm items={items} suggestions={prefs.suggestions} onSave={handleSave} onCancel={() => setFormOpen(false)} />
        ) : (
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Button variant="outlinePrimary" icon={PencilLine} onClick={() => setFormOpen(true)}>
              Anotar à mão
            </Button>
            <Button variant="outlinePrimary" icon={Camera} onClick={() => onPickPhoto('medicine')}>
              Nova foto de remédio
            </Button>
          </div>
        )}

        {items.length > 0 && (
          <div className="mt-8 space-y-4">
            <ChoiceGroup
              legend="Mostrar"
              value={filter}
              onChange={setFilter}
              options={[
                { value: 'all', label: `Tudo (${counts.all})` },
                { value: 'medicine', label: `Remédios (${counts.medicine})` },
                { value: 'exam', label: `Exames (${counts.exam})` },
              ]}
            />
            <div>
              <label htmlFor={searchId} className="block font-bold text-[1.05rem]">
                Procurar pelo nome
              </label>
              <div className="relative mt-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" aria-hidden="true" />
                <input
                  id={searchId}
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full min-h-[3.25rem] pl-12 pr-4 py-2 rounded-lg border-2 border-strong bg-surface text-ink text-[1.05rem]"
                />
              </div>
            </div>
          </div>
        )}

        <div className="mt-6">
          {items.length === 0 ? (
            <div className="p-6 rounded-lg bg-surface border-2 border-dashed border-strong text-center">
              <History className="w-10 h-10 mx-auto text-primary" strokeWidth={2} aria-hidden="true" />
              <h2 className="mt-2 text-[1.3rem] font-bold">Seu histórico está vazio</h2>
              <p className="mt-1">
                Quando você confirmar a leitura de um remédio ou exame, ele aparece aqui. Você também pode anotar à mão.
              </p>
            </div>
          ) : groups.length === 0 ? (
            <p className="p-4 rounded-lg bg-surface border-2 border-line font-bold">Nada encontrado com esse nome.</p>
          ) : (
            groups.map(([day, dayItems]) => (
              <section key={day} aria-label={day} className="mb-6">
                <h2 className="mb-3 text-[1.2rem] font-bold">{day}</h2>
                <ul className="space-y-3">
                  {dayItems.map((item) => (
                    <HistoryCard
                      key={item.id}
                      item={item}
                      onOpen={onOpenItem}
                      onListen={(i) => tts.speak(historySpeech(i), null, { manual: true })}
                      onRemove={handleRemove}
                    />
                  ))}
                </ul>
              </section>
            ))
          )}
        </div>

        <section aria-labelledby="historico-privacidade" className="mt-8 p-5 rounded-lg bg-surface border-2 border-line space-y-5">
          <h2 id="historico-privacidade" className="text-[1.3rem] font-bold">
            Privacidade do histórico
          </h2>
          <Switch
            label="Guardar novos resultados no histórico"
            help="Desligado, o Vivavós explica normalmente, mas não guarda mais nada."
            checked={saveEnabled}
            onChange={setSaveEnabled}
          />
          {items.length > 0 &&
            (confirmClear ? (
              <div className="space-y-3">
                <Notice label="Apagar todo o histórico?">Todos os remédios, exames e anotações saem da lista.</Notice>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Button variant="outline" icon={Trash2} onClick={handleClear}>
                    Sim, apagar tudo
                  </Button>
                  <Button variant="outlinePrimary" onClick={() => setConfirmClear(false)}>
                    Não, manter
                  </Button>
                </div>
              </div>
            ) : (
              <Button variant="outline" icon={Trash2} onClick={() => setConfirmClear(true)} className="sm:max-w-xs">
                Apagar todo o histórico
              </Button>
            ))}
        </section>
      </div>
    </div>
  );
}
