import { Pill } from "lucide-react";
import { type Paciente, type ItemPrescricao } from "../../types/Prescritpion";

interface Props {
  paciente: Paciente | null;
  itensPrescritos: ItemPrescricao[];
  itemEmEdicao: ItemPrescricao | null;
}
 
export function PrescriptionSidebar({ paciente, itensPrescritos, itemEmEdicao }: Props) {
  return (
    <aside
      className="w-52 bg-surface-alt border-border shrink-0 border-l flex flex-col gap-5 px-4 py-5 overflow-y-auto"
    >
      {paciente ? (
        <div>
          <p
            className="text-xs text-muted font-semibold uppercase tracking-wide mb-2"
          >
            Paciente
          </p>
          <div className="flex flex-col gap-1.5">
            <p className="text-sm font-medium text-text-primary">
              {paciente.nome}
            </p>
            <div className="flex flex-col gap-0.5">
              {[
                ["Nasc.", new Date(paciente.dataNascimento).toLocaleDateString("pt-BR")],
                paciente.peso    ? ["Peso",     `${paciente.peso} kg`]   : null,
                paciente.convenio ? ["Convênio", paciente.convenio]       : null,
              ]
                .filter((item): item is [string, string] => item !== null)
                .map(([k, v]) => (
                  <p key={k as string} className="text-xs text-text-muted">
                    <span className="text-text-muted">{k}: </span>
                    <span className="text-text-secondary">{v}</span>
                  </p>
                ))}
            </div>
          </div>
        </div>
      ) : (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide mb-1 text-text-muted" >
            Paciente
          </p>
          <p className="text-xs text-text-muted">
            Não identificado nesta sessão.
          </p>
        </div>
      )}
 
      <div>
        <p
          className="text-xs font-semibold uppercase tracking-wide mb-2"
          style={{ color: "var(--text-muted)" }}
        >
          Prescritos ({itensPrescritos.length})
        </p>
 
        {itensPrescritos.length === 0 && !itemEmEdicao && (
          <p className="text-xs text-text-muted">
            Nenhum medicamento adicionado.
          </p>
        )}
 
        <div className="flex flex-col gap-1.5">
          {itensPrescritos.map((item) => (
            <div
              key={item.id}
              className="flex gap-2 px-2.5 py-2 rounded-xl border bg-surface border-border"
            >
              <Pill size={12} className="text-text-muted shrink-0 mt-2"/>
              <div>
                <p className="text-xs text-text-primary font-medium leading-tight">
                  {item.medicamento.principioAtivo}
                </p>
                <p className="text-xs text-text-muted">
                  {item.medicamento.concentracao}
                </p>
              </div>
            </div>
          ))}
 
          {itemEmEdicao && (
            <div
              className="flex gap-2 px-2.5 py-2 rounded-xl border bg-primary-subtle border-primary-color"
            >
              <Pill size={12} className="text-primary-color shrink-0 mt-2" />
              <div>
                <p className="text-xs font-medium leading-tight text-primary-text" style={{ color: "var(--primary-text)" }}>
                  {itemEmEdicao.medicamento.principioAtivo}
                </p>
                <p className="text-xs text-primary-text opacity-70">
                  Em configuração...
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
