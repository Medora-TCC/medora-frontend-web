import { useState, useMemo } from "react";
import { Search, Pill, Plus, Trash2, Edit2 } from "lucide-react";
import type { Medicamento,  ItemPrescricao } from "./Prescritpion";

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
    generico:   { label: "Genérico",   cls: "bg-blue-50 text-blue-700" },
    referencia: { label: "Referência", cls: "bg-purple-50 text-purple-700" },
    similar:    { label: "Similar",    cls: "bg-teal-50 text-teal-700" },
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
      className="flex items-center gap-3 px-4 py-3 rounded-lg border border-gray-200
                 bg-white hover:border-blue-400 hover:bg-blue-50 text-left
                 transition-all duration-150 w-full group"
    >
      <span className="w-9 h-9 rounded-lg bg-gray-100 group-hover:bg-blue-100
                       flex items-center justify-center shrink-0 text-gray-400
                       group-hover:text-blue-600 transition-colors">
        <Pill size={18} />
      </span>
      <div className="flex flex-col gap-0.5 flex-1 min-w-0">
        <span className="text-sm font-medium text-gray-900 truncate">
          {med.nomeComercial ?? med.principioAtivo}
        </span>
        <span className="text-xs text-gray-500">
          {med.nomeComercial ? `${med.principioAtivo} · ` : ""}
          {med.concentracao} · {med.formaFarmaceutica}
        </span>
      </div>
      <BadgeTipo tipo={med.tipo} />
      <span className="ml-1 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <Plus size={16} />
      </span>
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
    <div className="flex items-start gap-3 px-4 py-3 rounded-lg border border-gray-200 bg-white">
      <span className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center
                       shrink-0 text-blue-600 mt-0.5">
        <Pill size={15} />
      </span>
      <div className="flex flex-col gap-0.5 flex-1 min-w-0">
        <span className="text-sm font-medium text-gray-900">
          {item.medicamento.principioAtivo}{" "}
          <span className="font-normal text-gray-500">{item.medicamento.concentracao}</span>
        </span>
        <span className="text-xs text-gray-500">
          {item.dose} · {item.frequencia.replace("_", "x").replace("1x", "1x")} · {item.quantidade} un.
        </span>
      </div>
      <div className="flex gap-1 shrink-0">
        <button
          onClick={() => onEditar(item)}
          className="p-1.5 rounded-md text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
          aria-label="Editar posologia"
        >
          <Edit2 size={14} />
        </button>
        <button
          onClick={() => onRemover(item.id)}
          className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
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
      {/* Busca */}
      <div>
        <h2 className="text-base font-medium text-gray-900 mb-1">Buscar medicamento</h2>
        <div className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg
                        bg-white focus-within:border-blue-500 focus-within:ring-1
                        focus-within:ring-blue-200 transition-all">
          <Search size={16} className="text-gray-400 shrink-0" />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Nome, princípio ativo ou concentração..."
            className="flex-1 text-sm outline-none bg-transparent text-gray-900
                       placeholder:text-gray-400"
            autoFocus
          />
        </div>

        {resultados.length > 0 && (
          <div className="flex flex-col gap-2 mt-2">
            {resultados.map((med) => (
              <CardResultado
                key={med.id}
                med={med}
                onSelecionar={(m) => {
                  onSelecionarMedicamento(m);
                  setBusca("");
                }}
              />
            ))}
          </div>
        )}

        {busca.trim().length > 1 && resultados.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-4">
            Nenhum medicamento encontrado para "{busca}".
          </p>
        )}
      </div>

      {itensPrescritos.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            Medicamentos prescritos ({itensPrescritos.length})
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

      {itensPrescritos.length === 0 && busca.trim().length === 0 && (
        <div className="flex flex-col items-center justify-center py-8 gap-2 text-gray-400">
          <Pill size={32} strokeWidth={1.2} />
          <p className="text-sm">Use a busca acima para adicionar medicamentos.</p>
        </div>
      )}
    </div>
  );
}