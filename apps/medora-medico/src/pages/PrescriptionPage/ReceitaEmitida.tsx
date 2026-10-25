import { Button } from "@heroui/react";
import { CheckCircle2, FileDown } from "lucide-react";

interface Props {
  secretCode: string;
  temPdf: boolean;
  onAbrirPdf: () => void;
  onVoltar?: () => void;
}

export function ReceitaEmitida({ secretCode, temPdf, onAbrirPdf, onVoltar }: Props) {
  return (
    <div className="bg-surface my-auto flex flex-col items-center gap-5 w-full max-w-lg mx-auto rounded-2xl shadow-sm border border-border px-6 py-8 text-center">
      <CheckCircle2 size={40} className="text-success" />
      <div>
        <h2 className="text-base font-semibold text-text-primary">Receita emitida</h2>
        <p className="text-sm mt-1 text-text-secondary">
          A receita foi enviada para assinatura digital e será entregue ao paciente depois de assinada.
        </p>
      </div>

      <div className="w-full rounded-xl border border-border bg-surface-alt p-3">
        <p className="text-xs text-text-muted">Código de acesso do paciente</p>
        <p className="font-mono text-lg tracking-widest text-text-primary">{secretCode}</p>
        <p className="text-xs text-text-muted mt-1">Ele não aparece no PDF e não será mostrado de novo.</p>
      </div>

      <div className="flex w-full gap-3">
        {onVoltar && (
          <Button variant="secondary" className="flex-1" onPress={onVoltar}>
            Voltar
          </Button>
        )}
        {temPdf && (
          <Button variant="primary" className="flex-1" onPress={onAbrirPdf}>
            <FileDown size={16} />
            Abrir PDF
          </Button>
        )}
      </div>
    </div>
  );
}
