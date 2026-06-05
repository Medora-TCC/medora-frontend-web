import { AlertTriangle, Pill } from "lucide-react";
import type {
  ItemPrescricao,
  ViaAdministracao,
  FrequenciaUso,
  DuracaoTratamento
} from "./Prescritpion";
import {
  LABEL_VIA,
  LABEL_FREQUENCIA,
  LABEL_DURACAO,
} from "./Prescritpion";


function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-xs font-medium text-gray-500 mb-1">{children}</label>
  );
}

function Select<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
      className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2
                 bg-white text-gray-900 focus:outline-none focus:border-blue-500
                 focus:ring-1 focus:ring-blue-200 transition-all"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

const DOSES = [
  "½ comprimido", "1 comprimido", "2 comprimidos",
  "5 ml", "10 ml", "15 ml", "20 ml",
  "1 cápsula", "2 cápsulas",
  "1 aplicação", "2 aplicações",
].map((v) => ({ value: v, label: v }));

const VIAS = (Object.entries(LABEL_VIA) as [ViaAdministracao, string][]).map(
  ([value, label]) => ({ value, label })
);

const FREQUENCIAS = (Object.entries(LABEL_FREQUENCIA) as [FrequenciaUso, string][]).map(
  ([value, label]) => ({ value, label })
);

const DURACOES = (Object.entries(LABEL_DURACAO) as [DuracaoTratamento, string][]).map(
  ([value, label]) => ({ value, label })
);

const HORARIOS = [
  "Manhã (em jejum)", "Manhã (com alimento)", "Almoço",
  "Tarde", "Noite", "Antes de dormir",
].map((v) => ({ value: v, label: v }));

interface Props {
  item: ItemPrescricao;
  onChange: (campos: Partial<Omit<ItemPrescricao, "id" | "medicamento">>) => void;
  onConfirmar: () => void;
  onCancelar: () => void;
}

export function StepDosage({ item, onChange, onConfirmar, onCancelar }: Props) {
  const med = item.medicamento;

  return (
    <div className="flex flex-col gap-5">

      <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 border border-blue-100">
        <span className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center
                         text-blue-700 shrink-0">
          <Pill size={20} />
        </span>
        <div>
          <p className="text-sm font-medium text-blue-900">
            {med.nomeComercial ?? med.principioAtivo}
          </p>
          <p className="text-xs text-blue-700">
            {med.concentracao} · {med.formaFarmaceutica}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Dose por administração</Label>
          <Select
            value={item.dose}
            options={DOSES}
            onChange={(v) => onChange({ dose: v })}
          />
        </div>

        <div>
          <Label>Via de administração</Label>
          <Select
            value={item.via}
            options={VIAS}
            onChange={(v) => onChange({ via: v as ViaAdministracao })}
          />
        </div>

        <div>
          <Label>Frequência</Label>
          <Select
            value={item.frequencia}
            options={FREQUENCIAS}
            onChange={(v) => onChange({ frequencia: v as FrequenciaUso })}
          />
        </div>

        <div>
          <Label>Horário preferencial</Label>
          <Select
            value={item.horario ?? "Noite"}
            options={HORARIOS}
            onChange={(v) => onChange({ horario: v })}
          />
        </div>

        <div>
          <Label>Duração do tratamento</Label>
          <Select
            value={item.duracao}
            options={DURACOES}
            onChange={(v) => onChange({ duracao: v as DuracaoTratamento })}
          />
        </div>

        {item.duracao === "outro" && (
          <div>
            <Label>Dias de tratamento</Label>
            <input
              type="number"
              min={1}
              max={365}
              value={item.duracaoCustomDias ?? ""}
              onChange={(e) => onChange({ duracaoCustomDias: Number(e.target.value) })}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2
                         bg-white text-gray-900 focus:outline-none focus:border-blue-500
                         focus:ring-1 focus:ring-blue-200 transition-all"
              placeholder="Ex.: 21"
            />
          </div>
        )}

        <div>
          <Label>Quantidade total</Label>
          <input
            type="number"
            min={1}
            value={item.quantidade}
            onChange={(e) => onChange({ quantidade: Number(e.target.value) })}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2
                       bg-white text-gray-900 focus:outline-none focus:border-blue-500
                       focus:ring-1 focus:ring-blue-200 transition-all"
          />
        </div>
      </div>

      <div>
        <Label>Orientações ao paciente</Label>
        <textarea
          rows={3}
          value={item.orientacoes}
          onChange={(e) => onChange({ orientacoes: e.target.value })}
          placeholder="Ex.: Tomar em jejum. Não partir o comprimido. Evitar álcool durante o tratamento."
          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2
                     bg-white text-gray-900 focus:outline-none focus:border-blue-500
                     focus:ring-1 focus:ring-blue-200 transition-all resize-none"
        />
      </div>

      {med.restricoes.length > 0 && (
        <div className="flex gap-2 px-3 py-2.5 rounded-lg border border-amber-200
                        bg-amber-50 text-amber-800 text-xs">
          <AlertTriangle size={14} className="shrink-0 mt-0.5" />
          <span>
            <strong>Restrição:</strong> {med.restricoes.join(", ")}. Avalie
            contraindicações antes de confirmar.
          </span>
        </div>
      )}

      <div className="flex gap-3 pt-1">
        <button
          onClick={onCancelar}
          className="flex-1 text-sm px-4 py-2 rounded-lg border border-gray-200
                     text-gray-600 hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={onConfirmar}
          className="flex-1 text-sm px-4 py-2 rounded-lg bg-blue-900 text-white
                     font-medium hover:bg-blue-800 active:scale-[0.98] transition-all"
        >
          Confirmar e adicionar
        </button>
      </div>
    </div>
  );
}