import { Calendar, CheckCircle, Clock, FileBadge, FileText, User, type LucideIcon } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";

interface Doc {
  id: string;
  type: string;
  status: 'pending' | 'signed';
  patient: string;
  date: string;
  path: string;
}

const statusConfig = {
  pending: {
    label: 'Assinatura pendente',
    icon: Clock,
    cardClass: 'border-l-4 border-l-warning',
    badgeClass: 'bg-warning-50 text-warning-700',
  },
  signed: {
    label: 'Assinado',
    icon: CheckCircle,
    cardClass: '',
    badgeClass: 'bg-success-50 text-success-700',
  },
};

const docTypeIcon: Record<string, LucideIcon> = {
  'Prescrição médica': FileText,
  'Atestado médico': FileBadge,
};

interface DocCardProps {
  doc: Doc;
  setDocumentoSelecionado: Dispatch<SetStateAction<string | null>>;
}

function DocCard({ doc, setDocumentoSelecionado }: DocCardProps) {
  const status = statusConfig[doc.status];
  const StatusIcon = status.icon;
  const DocIcon = docTypeIcon[doc.type] ?? FileText;

  return (
    <article className="flex flex-col gap-3 rounded-xl border border-divider bg-surface p-4 transition-colors hover:border-default-300 cursor-pointer" onClick={() => { setDocumentoSelecionado(doc.path) }}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-50">
            <DocIcon size={18} className="text-primary" />
          </div>
          <span className="font-medium text-foreground">{doc.type}</span>
        </div>
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${status.badgeClass}`}>
          <StatusIcon size={11} />
          {status.label}
        </span>
      </div>

      <hr className="border-divider" />

      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-foreground-secondary">
        <span className="flex items-center gap-1.5 truncate">
          <User size={13} />
          <span className="truncate">{doc.patient}</span>
        </span>
        <span className="flex items-center gap-1.5">
          <Calendar size={13} />
          {doc.date}
        </span>
      </div>
    </article>
  );
}

interface DocsListProps {
  docs: Doc[];
  setDocumentoSelecionado: Dispatch<SetStateAction<string | null>>;
}

export function DocsList({ docs, setDocumentoSelecionado }: DocsListProps) {
  const pendingCount = docs.filter(d => d.status === 'pending').length;

  return (
    <section aria-label="Documentos pendentes">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-medium text-foreground mx-auto">Documentos pendentes</h2>
        {pendingCount > 0 && (
          <span className="rounded-full bg-surface-secondary px-2.5 py-0.5 text-xs text-foreground-secondary">
            {pendingCount} pendente{pendingCount > 1 ? 's' : ''}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-2.5">
        {docs.length > 0 ? <>
          {docs.map(doc => (
            <DocCard key={doc.id} doc={doc} setDocumentoSelecionado={setDocumentoSelecionado} />
          ))}
        </> : <div className="text-center w-full text-muted mt-20 text-lg">Nenhuma pendência encontrada</div>}
      </div>
    </section>
  );
}