import { useState, useMemo } from "react";
import { Search, Pill, Plus, Trash2, Edit2 } from "lucide-react";
import type { Medicamento,  ItemPrescricao } from "../../../types/Prescritpion";

const MEDICAMENTOS_MOCK: Medicamento[] = [
  {
    id: "m1", principioAtivo: "Losartana potássica", concentracao: "50 mg",
    formaFarmaceutica: "Comprimido", tipo: "generico", classe: "C09CA01",
    nomeComercial: undefined, interacoes: ["m3"], restricoes: [],
  },
  {
    id: "m2", principioAtivo: "Hidroclorotiazida", concentracao: "25 mg",
    formaFarmaceutica: "Comprimido", tipo: "generico", classe: "C03AA03",
    nomeComercial: undefined, interacoes: [], restricoes: ["insuficiencia_renal"],
  },
  {
    id: "m3", principioAtivo: "Atorvastatina cálcica", concentracao: "20 mg",
    formaFarmaceutica: "Comprimido revestido", tipo: "generico", classe: "C10AA05",
    nomeComercial: undefined, interacoes: ["m1"], restricoes: [],
  },
  {
    id: "m4", principioAtivo: "Atorvastatina cálcica", concentracao: "40 mg",
    formaFarmaceutica: "Comprimido revestido", tipo: "referencia", nomeComercial: "Lipitor®",
    classe: "C10AA05", interacoes: ["m1"], restricoes: [],
  },
  {
    id: "m5", principioAtivo: "AAS", concentracao: "100 mg",
    formaFarmaceutica: "Comprimido gastrorresistente", tipo: "generico",
    nomeComercial: undefined, classe: "B01AC06", interacoes: [], restricoes: ["gestantes"],
  },
];

function BadgeTipo({ tipo }: { tipo: Medicamento["tipo"] }) {
  const map: Record<Medicamento["tipo"], { label: string; cls: string }> = {
    generico:   { label: "Genérico",   cls: "bg-primary-subtle text-primary-text" },
    referencia: { label: "Referência", cls: "bg-surface-raised text-text-secondary" },
    similar:    { label: "Similar",    cls: "bg-sucess-subtle text-sucess-text" },
  };
  const { label, cls } = map[tipo];
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cls}`}>{label}</span>
  );
}

function CardResultado({
  med,
  onSelecionar,
}: {
  med: Medicamento;
  onSelecionar: (m: Medicamento) => void;
}) {
  return (
    <button
      onClick={() => onSelecionar(med)}
      className="group bg-surface flex items-center gap-3 px-4 py-3 rounded-xl border border-border text-left w-full transition-all duration-150 hover:border-primary-color hover:bg-primary-subtle"
    >
      <span
        className="bg-surface-raised w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors"
        style={{ background: "var(--surface-raised)", color: "var(--text-muted)" }}
      >
        <Pill size={17} />
      </span>
      <div className="flex flex-col gap-0.5 flex-1 min-w-0">
        <span className="text-sm text-text-primary font-medium truncate">
          {med.nomeComercial ?? med.principioAtivo}
        </span>
        <span className="text-xs text-text-muted">
          {med.nomeComercial ? `${med.principioAtivo} · ` : ""}
          {med.concentracao} · {med.formaFarmaceutica}
        </span>
      </div>
      <BadgeTipo tipo={med.tipo} />
      <Plus size={15} className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-primary-color" />
    </button>
  );
}
 
function CardItemPrescrito({
  item,
  onEditar,
  onRemover,
}: {
  item: ItemPrescricao;
  onEditar: (item: ItemPrescricao) => void;
  onRemover: (id: string) => void;
}) {
  return (
    <div
      className="bg-surface flex items-start gap-3 px-4 py-3 rounded-xl border border-border"
    >
      <span
        className="bg-primary-subtle text-primary-text w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
      >
        <Pill size={15} />
      </span>
      <div className="flex flex-col gap-0.5 flex-1 min-w-0">
        <span className="text-sm font-medium text-text-primary">
          {item.medicamento.principioAtivo}{" "}
          <span className="text-text-muted font-medium">
            {item.medicamento.concentracao}
          </span>
        </span>
        <span className="text-xs text-text-muted">
          {item.dose} · {item.quantidade} un.
        </span>
      </div>
      <div className="flex gap-1 shrink-0">
        <button
          onClick={() => onEditar(item)}
          className="p-1.5 rounded-md transition-colors text-text-muted hover:text-primary-color hover:bg-primary-subtle"
          aria-label="Editar posologia"
        >
          <Edit2 size={14} />
        </button>
        <button
          onClick={() => onRemover(item.id)}
          className="p-1.5 rounded-md transition-colors text-text-muted hover:text-danger hover:bg-danger-subtle"
          aria-label="Remover medicamento"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}



interface Props {
  itensPrescritos: ItemPrescricao[];
  onSelecionarMedicamento: (med: Medicamento) => void;
  onEditarItem: (item: ItemPrescricao) => void;
  onRemoverItem: (id: string) => void;
}

export function StepMedication({
  itensPrescritos,
  onSelecionarMedicamento,
  onEditarItem,
  onRemoverItem,
}: Props) {
  const [busca, setBusca] = useState("");

  const resultados = useMemo(() => {
    const q = busca.toLowerCase().trim();
    if (!q) return [];
    return MEDICAMENTOS_MOCK.filter(
      (m) =>
        m.principioAtivo.toLowerCase().includes(q) ||
        m.nomeComercial?.toLowerCase().includes(q) ||
        m.concentracao.toLowerCase().includes(q)
    ).slice(0, 6);
  }, [busca]);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-base font-semibold mb-1 text-text-primary">
          Buscar medicamento
        </h2>
        <p className="text-sm mb-3 text-text-muted">
          Digite o nome, princípio ativo ou concentração.
        </p>
 
        <div
          className="bg-surface flex items-center gap-2 px-3 py-2 rounded-xl border border-border focus:border-primary-color transition-all"
        >
          <Search size={16} className="text-text-muted shrink-0" />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Ex.: Atorvastatina, Losartana..."
            className="flex-1 text-sm outline-none bg-transparent text-primary-color"
            autoFocus
          />
        </div>
 
        {resultados.length > 0 && (
          <div className="flex flex-col gap-2 mt-2">
            {resultados.map((med) => (
              <CardResultado
                key={med.id}
                med={med}
                onSelecionar={(m) => { onSelecionarMedicamento(m); setBusca(""); }}
              />
            ))}
          </div>
        )}
 
        {busca.trim().length > 1 && resultados.length === 0 && (
          <p className="text-sm text-center py-4 text-text-muted">
            Nenhum resultado para "{busca}".
          </p>
        )}
      </div>
 
      {itensPrescritos.length > 0 && (
        <div>
          <h3 className="text-sm font-medium mb-2 text-text-secondary">
            Adicionados ({itensPrescritos.length})
          </h3>
          <div className="flex flex-col gap-2">
            {itensPrescritos.map((item) => (
              <CardItemPrescrito
                key={item.id}
                item={item}
                onEditar={onEditarItem}
                onRemover={onRemoverItem}
              />
            ))}
          </div>
        </div>
      )}
      {/* Estado vazio */}
      {itensPrescritos.length === 0 && busca.trim().length === 0 && (
        <div className="flex flex-col items-center justify-center py-10 gap-2">
          <Pill size={32} strokeWidth={1.2} className="text-text-muted" />
          <p className="text-sm text-text-muted">
            Use a busca acima para adicionar medicamentos.
          </p>
        </div>
      )}
    </div>
  );

}