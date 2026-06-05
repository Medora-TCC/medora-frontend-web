import { Pill, User, FileText } from "lucide-react";
import {
  type PrescricaoRascunho,
  LABEL_VIA,
  LABEL_FREQUENCIA,
  LABEL_DURACAO,
  LABEL_TIPO_RECEITA,
} from "./Prescritpion";

function SecaoPaciente({ paciente }: { paciente: PrescricaoRascunho["paciente"] }) {
  if (!paciente) return null;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
        <User size={15} />
        Paciente
      </div>
      <div className="grid grid-cols-2 gap-x-6 gap-y-1 pl-1">
        {[
          ["Nome", paciente.nome],
          ["CPF", paciente.cpf],
          ["Convênio", paciente.convenio ?? "Particular"],
        ].map(([label, val]) => (
          <div key={label} className="flex flex-col">
            <span className="text-xs text-gray-400">{label}</span>
            <span className="text-sm text-gray-900">{val}</span>
          </div>
        ))}
      </div>
    </div>
  );
}


interface Props {
  rascunho: PrescricaoRascunho;
  medico: { nome: string; crm: string; especialidade: string; uf: string };
  onEmitir: () => void;
  onVoltar: () => void;
  emitindo?: boolean;
}

export function StepRevision({ rascunho, medico, onEmitir, onVoltar, emitindo }: Props) {

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-base font-medium text-gray-900">Revisão da prescrição</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Confira todos os dados antes de emitir o receituário.
        </p>
      </div>

      {/* Tipo de receita */}
      <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-200">
        <FileText size={16} className="text-gray-400 shrink-0" />
        <div>
          <span className="text-xs text-gray-400">Tipo de receita</span>
          <p className="text-sm font-medium text-gray-900">
            {rascunho.tipoReceita ? LABEL_TIPO_RECEITA[rascunho.tipoReceita] : "—"}
          </p>
        </div>
      </div>

      <div className="p-4 rounded-xl border border-gray-200 bg-white">
        <SecaoPaciente paciente={rascunho.paciente} />
      </div>

      <div>
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
          <Pill size={15} />
          Medicamentos prescritos ({rascunho.itens.length})
        </div>

        <div className="flex flex-col gap-2">
          {rascunho.itens.map((item, idx) => (
            <div
              key={item.id}
              className="flex gap-3 px-4 py-3 rounded-xl border border-gray-200 bg-white"
            >
              <span className="w-6 h-6 rounded-full bg-blue-50 text-blue-700 flex items-center
                               justify-content-center text-xs font-medium shrink-0 mt-0.5
                               justify-center">
                {idx + 1}
              </span>
              <div className="flex flex-col gap-1 flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  {item.medicamento.principioAtivo}{" "}
                  <span className="font-normal text-gray-500">
                    {item.medicamento.concentracao}
                  </span>
                </p>
                <p className="text-xs text-gray-500">
                  {item.dose} · {LABEL_VIA[item.via]} · {LABEL_FREQUENCIA[item.frequencia]}
                  {item.horario ? ` · ${item.horario}` : ""}
                </p>
                <p className="text-xs text-gray-500">
                  {LABEL_DURACAO[item.duracao]} · {item.quantidade} unidades
                </p>
                {item.orientacoes && (
                  <p className="text-xs text-gray-400 italic mt-0.5">
                    "{item.orientacoes}"
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {rascunho.observacoesGerais && (
        <div>
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Observações gerais
          </span>
          <p className="text-sm text-gray-700 mt-1 pl-1">{rascunho.observacoesGerais}</p>
        </div>
      )}

      <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
        <div className="w-9 h-9 rounded-full bg-blue-900 text-blue-100 text-sm font-medium
                        flex items-center justify-center shrink-0">
          {medico.nome.split(" ").slice(0, 2).map((n) => n[0]).join("")}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">Dr. {medico.nome}</p>
          <p className="text-xs text-gray-500">
            CRM/{medico.uf} {medico.crm} · {medico.especialidade}
          </p>
        </div>
      </div>

      <div className="flex gap-3 pt-1">
        <button
          onClick={onVoltar}
          className="flex-1 text-sm px-4 py-2.5 rounded-lg border border-gray-200
                     text-gray-600 hover:bg-gray-50 transition-colors"
        >
          Voltar e editar
        </button>
        <button
          onClick={onEmitir}
          disabled={emitindo}
          className={`
            flex-1 text-sm px-4 py-2.5 rounded-lg font-medium transition-all
            ${emitindo
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-blue-900 text-white hover:bg-blue-800 active:scale-[0.98]"
            }
          `}
        >
          {emitindo ? "Emitindo..." : "Emitir receituário"}
        </button>
      </div>
    </div>
  );
}