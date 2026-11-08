import type { ReactNode } from "react";
import { Lock } from "lucide-react";

interface InfoCardProps {
  icon: ReactNode;
  title: string;
  description?: string;
  children: ReactNode;
  locked?: boolean;
  action?: ReactNode;
}

export function InfoCard({ icon, title, description, children, locked = false, action }: InfoCardProps) {
  return (
    <div className="bg-surface-alt border border-divider rounded-2xl">
      <div className="flex items-start justify-between gap-4 px-5 pt-5">
        <div className="flex items-start gap-3">
          <div className="h-9 w-9 shrink-0 rounded-lg bg-primary-subtle flex items-center justify-center text-primary-color">
            {icon}
          </div>
          <div>
            <h3 className="font-semibold text-text-primary flex items-center gap-1.5">
              {title}
              {locked && <Lock size={13} className="text-text-muted" />}
            </h3>
            {description && <p className="text-xs text-text-muted mt-0.5">{description}</p>}
          </div>
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

export function InfoGrid({ children, columns = 2 }: { children: ReactNode; columns?: 2 | 3 }) {
  const gridColumns = columns === 3 ? "sm:grid-cols-2 lg:grid-cols-3" : "sm:grid-cols-2";
  return <dl className={`grid grid-cols-1 ${gridColumns} gap-x-6 gap-y-4`}>{children}</dl>;
}

export function InfoItem({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-text-muted">{label}</dt>
      <dd className="mt-1 text-sm font-medium wrap-break-word">
        {value ? (
          <span className="text-text-primary">{value}</span>
        ) : (
          <span className="text-text-muted font-normal">—</span>
        )}
      </dd>
    </div>
  );
}