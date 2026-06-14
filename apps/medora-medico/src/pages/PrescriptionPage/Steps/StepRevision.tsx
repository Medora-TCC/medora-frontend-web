import { Pill, User, FileText } from "lucide-react";
import {
  type PrescricaoRascunho,
  LABEL_VIA,
  LABEL_FREQUENCIA,
  LABEL_DURACAO,
} from "../../../types/Prescritpion.ts";
import { ModalConfirmacao } from "@medora_web/shared";

function SecaoPaciente({ paciente }: { paciente: PrescricaoRascunho["paciente"] }) {
  if (!paciente) return null;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 text-sm font-medium text-text-secondary">
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
            <span className="text-xs text-text-muted">{label}</span>
            <span className="text-sm text-text-primary">{val}</span>
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
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-base font-semibold text-text-primary" >
          Revisão da prescrição
        </h2>
        <p className="text-sm mt-0.5 text-muted">
          Confira todos os dados antes de emitir o receituário.
        </p>
      </div>

      <div
        className="bg-surface-alt flex items-center gap-3 p-3 rounded-xl border border-border"
      >
        <FileText size={15} className="text-text-muted shrink-0" />
        <div>
          <span className="text-xs text-text-muted" >Tipo de receita</span>
          <p className="text-sm font-medium text-text-primary">
            Receituário Simples
          </p>
        </div>
      </div>

      <SecaoPaciente paciente={rascunho.paciente} />

      <div>
        <div className="flex items-center gap-2 mb-2 text-text-secondary">
          <Pill size={14} />
          <span className="text-sm font-medium">
            Medicamentos prescritos ({rascunho.itens.length})
          </span>
        </div>
        <div className="flex flex-col gap-2">
          {rascunho.itens.map((item, idx) => (
            <div
              key={item.id}
              className="bg-surface flex gap-3 px-4 py-3 rounded-xl border border-border "
            >
              <span
                className="bg-primary-subtle text-primary-text w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium shrink-0 mt-0.5"
              >
                {idx + 1}
              </span>
              <div className="flex flex-col gap-1 flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary" >
                  {item.medicamento.principioAtivo}{" "}
                  <span className="font-medium text-text-muted" >
                    {item.medicamento.concentracao}
                  </span>
                </p>
                <p className="text-xs text-text-muted">
                  {item.dose} · {LABEL_VIA[item.via]} · {LABEL_FREQUENCIA[item.frequencia]}
                  {item.horario ? ` · ${item.horario}` : ""}
                </p>
                <p className="text-xs text-text-muted">
                  {LABEL_DURACAO[item.duracao]} · {item.quantidade} unidades
                </p>
                {item.orientacoes && (
                  <p className="text-xs italic mt-0.5 text-text-muted" >
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
          <span className="text-xs font-semibold uppercase tracking-wide text-text-muted" >
            Observações gerais
          </span>
          <p className="text-sm mt-1 pl-1 text-text-secondary" >
            {rascunho.observacoesGerais}
          </p>
        </div>
      )}

      <div
        className="bg-surface-alt flex items-center gap-3 p-3 rounded-xl border border-border"
      >
        <div
          className="bg-primary-color w-9 h-9 rounded-full text-sm text-text-inverse font-semibold flex items-center justify-center shrink-0"
        >
          {medico.nome.split(" ").slice(0, 2).map((n) => n[0]).join("")}
        </div>
        <div>
          <p className="text-sm font-medium text-text-primary">
            Dr. {medico.nome}
          </p>
          <p className="text-xs text-text-muted" >
            CRM/{medico.uf} {medico.crm} · {medico.especialidade}
          </p>
        </div>
      </div>

      <div className="flex gap-3 pt-1">
        <button
          onClick={onVoltar}
          className="flex-1 text-sm px-4 py-2.5 rounded-xl border transition-colors"
          style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--text-secondary)" }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--border-hover)")}
          onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border)")}
        >
          Voltar e editar
        </button>
        <ModalConfirmacao onConfirm={onEmitir} disabled={emitindo ?? false} texto={"Deseja finalizar e emitir a prescrição ?"} textoBotao={emitindo ? "Emitindo..." : "Emitir receituário"} />
        
      </div>
    </div>
  );

}