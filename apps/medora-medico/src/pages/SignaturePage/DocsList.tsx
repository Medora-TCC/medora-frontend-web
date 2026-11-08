import { Calendar, Clock, FileBadge, FileText, TriangleAlert, User, type LucideIcon } from "lucide-react";
import type { DoctorSignature } from "../../api/services/Signatures";

const docInfo: Record<DoctorSignature["documentKind"], { label: string; icon: LucideIcon }> = {
  Prescription: { label: "Prescrição médica", icon: FileText },
  MedicalRecord: { label: "Prontuário", icon: FileBadge },
};

function formatDate(iso: string | null): string {
  return iso ? new Date(iso).toLocaleDateString("pt-BR") : "";
}

interface DocCardProps {
  doc: DoctorSignature;
  selected: boolean;
  onSelect: (doc: DoctorSignature) => void;
}

function DocCard({ doc, selected, onSelect }: DocCardProps) {
  const info = docInfo[doc.documentKind];
  const DocIcon = info.icon;
  const failed = doc.status === "Failed";
  const StatusIcon = failed ? TriangleAlert : Clock;
  const badge = failed
    ? { label: "Falhou", cls: "bg-danger-50 text-danger-700" }
    : doc.status === "AwaitingDoctor"
      ? { label: "Aguardando assinatura", cls: "bg-warning-50 text-warning-700" }
      : { label: "Em andamento", cls: "bg-surface-secondary text-foreground-secondary" };

  return (
    <article
      className={`flex flex-col gap-3 rounded-xl border bg-surface p-4 transition-colors hover:border-default-300 cursor-pointer ${selected ? "border-primary" : "border-divider"}`}
      onClick={() => onSelect(doc)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-50">
            <DocIcon size={18} className="text-primary" />
          </div>
          <span className="font-medium text-foreground">{info.label}</span>
        </div>
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${badge.cls}`}>
          <StatusIcon size={11} />
          {badge.label}
        </span>
      </div>

      <hr className="border-divider" />

      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-foreground-secondary">
        <span className="flex items-center gap-1.5 truncate">
          <User size={13} />
          <span className="truncate">{doc.patientName}</span>
        </span>
        <span className="flex items-center gap-1.5">
          <Calendar size={13} />
          {formatDate(doc.frozenAt)}
        </span>
      </div>
    </article>
  );
}

interface DocsListProps {
  docs: DoctorSignature[];
  selecionadoId: number | null;
  onSelect: (doc: DoctorSignature) => void;
}

export function DocsList({ docs, selecionadoId, onSelect }: DocsListProps) {
  const grupos = [
    { titulo: "Aguardando sua assinatura", itens: docs.filter((d) => d.status === "AwaitingDoctor") },
    { titulo: "Falharam", itens: docs.filter((d) => d.status === "Failed") },
    { titulo: "Em andamento", itens: docs.filter((d) => d.status === "Pending" || d.status === "Submitted") },
  ];

  return (
    <section aria-label="Documentos para assinar" className="flex flex-col gap-5">
      {docs.length === 0 && (
        <div className="text-center w-full text-muted mt-20 text-lg">Nenhuma pendência encontrada</div>
      )}
      {grupos.map(
        (g) =>
          g.itens.length > 0 && (
            <div key={g.titulo}>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-medium text-foreground">{g.titulo}</h2>
                <span className="rounded-full bg-surface-secondary px-2.5 py-0.5 text-xs text-foreground-secondary">
                  {g.itens.length}
                </span>
              </div>
              <div className="flex flex-col gap-2.5">
                {g.itens.map((doc) => (
                  <DocCard key={doc.signatureId} doc={doc} selected={doc.signatureId === selecionadoId} onSelect={onSelect} />
                ))}
              </div>
            </div>
          ),
      )}
    </section>
  );
}
