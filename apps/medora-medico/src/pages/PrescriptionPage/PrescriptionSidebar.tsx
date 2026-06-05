import { Pill } from "lucide-react";
import { type Paciente, type ItemPrescricao, LABEL_TIPO_RECEITA, type TipoReceita } from "./Prescritpion";

interface Props {
  paciente: Paciente | null;
  tipoReceita: TipoReceita | null;
  itensPrescritos: ItemPrescricao[];
  itemEmEdicao: ItemPrescricao | null;
}

export function PrescriptionSidebar({ paciente, tipoReceita, itensPrescritos, itemEmEdicao }: Props) {
  return (
    <aside className="w-56 shrink-0 border-l border-gray-100 bg-gray-50
                      flex flex-col gap-5 px-4 py-5 overflow-y-auto">

      {tipoReceita && (
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
            Tipo de receita
          </p>
          <span className="text-xs font-medium text-blue-700 bg-blue-50 border border-blue-100
                           px-2 py-1 rounded-full">
            {LABEL_TIPO_RECEITA[tipoReceita]}
          </span>
        </div>
      )}

      {paciente ? (
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
            Paciente
          </p>
          <div className="flex flex-col gap-1.5">
            <p className="text-sm font-medium text-gray-900">{paciente.nome}</p>
            <div className="flex flex-col gap-0.5">
              {[
                ["Nasc.", new Date(paciente.dataNascimento).toLocaleDateString("pt-BR")],
                paciente.peso ? ["Peso", `${paciente.peso} kg`] : null,
                paciente.convenio ? ["Convênio", paciente.convenio] : null,
              ]
                .filter(Boolean)
                .filter((item): item is [string, string] => item !== null)
                .map(([k, v]) => (
                  <p key={k as string} className="text-xs text-gray-500">
                    <span className="text-gray-400">{k}: </span>{v}
                  </p>
                ))}
            </div>

          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
            Paciente
          </p>
          <p className="text-xs text-gray-400">Não identificado nesta sessão.</p>
        </div>
      )}

      <div>
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
          Prescritos ({itensPrescritos.length})
        </p>

        {itensPrescritos.length === 0 && !itemEmEdicao && (
          <p className="text-xs text-gray-400">Nenhum medicamento adicionado.</p>
        )}

        <div className="flex flex-col gap-1.5">
          {itensPrescritos.map((item) => (
            <div
              key={item.id}
              className="flex gap-2 px-2.5 py-2 rounded-lg bg-white border border-gray-200"
            >
              <Pill size={12} className="text-gray-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-gray-800 leading-tight">
                  {item.medicamento.principioAtivo}
                </p>
                <p className="text-xs text-gray-400">{item.medicamento.concentracao}</p>
              </div>
            </div>
          ))}

          {itemEmEdicao && (
            <div className="flex gap-2 px-2.5 py-2 rounded-lg bg-blue-50 border border-blue-200">
              <Pill size={12} className="text-blue-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-blue-800 leading-tight">
                  {itemEmEdicao.medicamento.principioAtivo}
                </p>
                <p className="text-xs text-blue-500">Em configuração...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}