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
  {
    id: "m6", principioAtivo: "Paracetamol", concentracao: "750 mg",
    formaFarmaceutica: "Comprimido", tipo: "generico", classe: "N02BE01",
    nomeComercial: undefined, interacoes: [], restricoes: ["hepatopatas"],
  },
  {
    id: "m7", principioAtivo: "Paracetamol", concentracao: "750 mg",
    formaFarmaceutica: "Comprimido revestido", tipo: "referencia", classe: "N02BE01",
    nomeComercial: "Tylenol®", interacoes: [], restricoes: ["hepatopatas"],
  },
  {
    id: "m8", principioAtivo: "Paracetamol", concentracao: "200 mg/mL",
    formaFarmaceutica: "Solução oral (gotas)", tipo: "generico", classe: "N02BE01",
    nomeComercial: undefined, interacoes: [], restricoes: ["hepatopatas"],
  },
  {
    id: "m9", principioAtivo: "Dipirona monoidratada", concentracao: "500 mg",
    formaFarmaceutica: "Comprimido", tipo: "generico", classe: "N02BB02",
    nomeComercial: undefined, interacoes: [], restricoes: ["alergia a dipirona"],
  },
  {
    id: "m10", principioAtivo: "Dipirona monoidratada", concentracao: "1 g",
    formaFarmaceutica: "Comprimido", tipo: "referencia", classe: "N02BB02",
    nomeComercial: "Novalgina®", interacoes: [], restricoes: ["alergia a dipirona"],
  },
  {
    id: "m11", principioAtivo: "Dipirona monoidratada", concentracao: "500 mg/mL",
    formaFarmaceutica: "Solução oral (gotas)", tipo: "generico", classe: "N02BB02",
    nomeComercial: undefined, interacoes: [], restricoes: ["alergia a dipirona"],
  },
  {
    id: "m12", principioAtivo: "Dipirona + orfenadrina + cafeína", concentracao: "300 mg + 35 mg + 50 mg",
    formaFarmaceutica: "Comprimido", tipo: "referencia", classe: "M03BC51",
    nomeComercial: "Dorflex®", interacoes: [], restricoes: ["alergia a dipirona","glaucoma"],
  },
  {
    id: "m13", principioAtivo: "Ibuprofeno", concentracao: "600 mg",
    formaFarmaceutica: "Comprimido revestido", tipo: "generico", classe: "M01AE01",
    nomeComercial: undefined, interacoes: ["m5","m30"], restricoes: ["gestantes","úlcera péptica"],
  },
  {
    id: "m14", principioAtivo: "Ibuprofeno", concentracao: "400 mg",
    formaFarmaceutica: "Cápsula gelatinosa mole", tipo: "referencia", classe: "M01AE01",
    nomeComercial: "Advil®", interacoes: ["m5","m30"], restricoes: ["gestantes","úlcera péptica"],
  },
  {
    id: "m15", principioAtivo: "Nimesulida", concentracao: "100 mg",
    formaFarmaceutica: "Comprimido", tipo: "generico", classe: "M01AX17",
    nomeComercial: undefined, interacoes: [], restricoes: ["hepatopatas","gestantes"],
  },
  {
    id: "m16", principioAtivo: "Cetoprofeno", concentracao: "100 mg",
    formaFarmaceutica: "Comprimido revestido", tipo: "referencia", classe: "M01AE03",
    nomeComercial: "Profenid®", interacoes: ["m5","m30"], restricoes: ["úlcera péptica"],
  },
  {
    id: "m17", principioAtivo: "Amoxicilina", concentracao: "500 mg",
    formaFarmaceutica: "Cápsula", tipo: "generico", classe: "J01CA04",
    nomeComercial: undefined, interacoes: [], restricoes: ["alergia a penicilina"],
  },
  {
    id: "m18", principioAtivo: "Amoxicilina + clavulanato de potássio", concentracao: "875 mg + 125 mg",
    formaFarmaceutica: "Comprimido revestido", tipo: "generico", classe: "J01CR02",
    nomeComercial: undefined, interacoes: [], restricoes: ["alergia a penicilina"],
  },
  {
    id: "m19", principioAtivo: "Azitromicina", concentracao: "500 mg",
    formaFarmaceutica: "Comprimido revestido", tipo: "generico", classe: "J01FA10",
    nomeComercial: undefined, interacoes: [], restricoes: [],
  },
  {
    id: "m20", principioAtivo: "Cefalexina", concentracao: "500 mg",
    formaFarmaceutica: "Cápsula", tipo: "generico", classe: "J01DB01",
    nomeComercial: undefined, interacoes: [], restricoes: ["alergia a cefalosporinas"],
  },
  {
    id: "m21", principioAtivo: "Ciprofloxacino", concentracao: "500 mg",
    formaFarmaceutica: "Comprimido revestido", tipo: "generico", classe: "J01MA02",
    nomeComercial: undefined, interacoes: [], restricoes: ["gestantes"],
  },
  {
    id: "m22", principioAtivo: "Metronidazol", concentracao: "400 mg",
    formaFarmaceutica: "Comprimido", tipo: "generico", classe: "P01AB01",
    nomeComercial: undefined, interacoes: [], restricoes: ["gestantes (1º trimestre)","não ingerir álcool"],
  },
  {
    id: "m23", principioAtivo: "Sulfametoxazol + trimetoprima", concentracao: "400 mg + 80 mg",
    formaFarmaceutica: "Comprimido", tipo: "referencia", classe: "J01EE01",
    nomeComercial: "Bactrim®", interacoes: [], restricoes: ["gestantes"],
  },
  {
    id: "m24", principioAtivo: "Omeprazol", concentracao: "20 mg",
    formaFarmaceutica: "Cápsula", tipo: "generico", classe: "A02BC01",
    nomeComercial: undefined, interacoes: [], restricoes: [],
  },
  {
    id: "m25", principioAtivo: "Pantoprazol", concentracao: "40 mg",
    formaFarmaceutica: "Comprimido gastrorresistente", tipo: "generico", classe: "A02BC02",
    nomeComercial: undefined, interacoes: [], restricoes: [],
  },
  {
    id: "m26", principioAtivo: "Ondansetrona", concentracao: "8 mg",
    formaFarmaceutica: "Comprimido orodispersível", tipo: "generico", classe: "A04AA01",
    nomeComercial: undefined, interacoes: [], restricoes: [],
  },
  {
    id: "m27", principioAtivo: "Metoclopramida", concentracao: "10 mg",
    formaFarmaceutica: "Comprimido", tipo: "referencia", classe: "A03FA01",
    nomeComercial: "Plasil®", interacoes: [], restricoes: ["menores de 1 ano"],
  },
  {
    id: "m28", principioAtivo: "Butilbrometo de escopolamina", concentracao: "10 mg",
    formaFarmaceutica: "Comprimido revestido", tipo: "referencia", classe: "A03BB01",
    nomeComercial: "Buscopan®", interacoes: [], restricoes: ["glaucoma"],
  },
  {
    id: "m29", principioAtivo: "Simeticona", concentracao: "40 mg",
    formaFarmaceutica: "Comprimido", tipo: "referencia", classe: "A03AX13",
    nomeComercial: "Luftal®", interacoes: [], restricoes: [],
  },
  {
    id: "m30", principioAtivo: "Enoxaparina sódica", concentracao: "40 mg/0,4 mL",
    formaFarmaceutica: "Solução injetável (seringa)", tipo: "generico", classe: "B01AB05",
    nomeComercial: undefined, interacoes: ["m5","m13","m14","m16"], restricoes: ["sangramento ativo"],
  },
  {
    id: "m31", principioAtivo: "Tramadol", concentracao: "50 mg",
    formaFarmaceutica: "Cápsula", tipo: "generico", classe: "N02AX02",
    nomeComercial: undefined, interacoes: ["m39","m40"], restricoes: ["receita de controle especial"],
  },
  {
    id: "m32", principioAtivo: "Prednisona", concentracao: "20 mg",
    formaFarmaceutica: "Comprimido", tipo: "generico", classe: "H02AB07",
    nomeComercial: undefined, interacoes: [], restricoes: ["diabéticos (monitorar glicemia)"],
  },
  {
    id: "m33", principioAtivo: "Dexametasona", concentracao: "4 mg",
    formaFarmaceutica: "Comprimido", tipo: "generico", classe: "H02AB02",
    nomeComercial: undefined, interacoes: [], restricoes: [],
  },
  {
    id: "m34", principioAtivo: "Loratadina", concentracao: "10 mg",
    formaFarmaceutica: "Comprimido", tipo: "generico", classe: "R06AX13",
    nomeComercial: undefined, interacoes: [], restricoes: [],
  },
  {
    id: "m35", principioAtivo: "Dexclorfeniramina", concentracao: "2 mg",
    formaFarmaceutica: "Comprimido", tipo: "referencia", classe: "R06AB02",
    nomeComercial: "Polaramine®", interacoes: [], restricoes: ["causa sonolência"],
  },
  {
    id: "m36", principioAtivo: "Salbutamol", concentracao: "100 mcg/dose",
    formaFarmaceutica: "Aerossol oral", tipo: "referencia", classe: "R03AC02",
    nomeComercial: "Aerolin®", interacoes: [], restricoes: [],
  },
  {
    id: "m37", principioAtivo: "Metformina", concentracao: "850 mg",
    formaFarmaceutica: "Comprimido", tipo: "generico", classe: "A10BA02",
    nomeComercial: undefined, interacoes: [], restricoes: ["insuficiência renal"],
  },
  {
    id: "m38", principioAtivo: "Sinvastatina", concentracao: "20 mg",
    formaFarmaceutica: "Comprimido revestido", tipo: "generico", classe: "C10AA01",
    nomeComercial: undefined, interacoes: [], restricoes: ["gestantes"],
  },
  {
    id: "m39", principioAtivo: "Sertralina", concentracao: "50 mg",
    formaFarmaceutica: "Comprimido revestido", tipo: "generico", classe: "N06AB06",
    nomeComercial: undefined, interacoes: ["m31"], restricoes: [],
  },
  {
    id: "m40", principioAtivo: "Clonazepam", concentracao: "2 mg",
    formaFarmaceutica: "Comprimido", tipo: "referencia", classe: "N03AE01",
    nomeComercial: "Rivotril®", interacoes: ["m31"], restricoes: ["receita de controle especial (B1)"],
  },
  {
    id: "m41", principioAtivo: "Fluconazol", concentracao: "150 mg",
    formaFarmaceutica: "Cápsula", tipo: "generico", classe: "J02AC01",
    nomeComercial: undefined, interacoes: [], restricoes: [],
  },
  {
    id: "m42", principioAtivo: "Albendazol", concentracao: "400 mg",
    formaFarmaceutica: "Comprimido mastigável", tipo: "generico", classe: "P02CA03",
    nomeComercial: undefined, interacoes: [], restricoes: ["gestantes"],
  },
  {
    id: "m43", principioAtivo: "Ivermectina", concentracao: "6 mg",
    formaFarmaceutica: "Comprimido", tipo: "generico", classe: "P02CF01",
    nomeComercial: undefined, interacoes: [], restricoes: [],
  },
  {
    id: "m44", principioAtivo: "Losartana potássica", concentracao: "50 mg",
    formaFarmaceutica: "Comprimido revestido", tipo: "referencia", classe: "C09CA01",
    nomeComercial: "Cozaar®", interacoes: ["m3"], restricoes: [],
  },
  {
    id: "m45", principioAtivo: "Enalapril", concentracao: "10 mg",
    formaFarmaceutica: "Comprimido", tipo: "generico", classe: "C09AA02",
    nomeComercial: undefined, interacoes: [], restricoes: ["gestantes"],
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