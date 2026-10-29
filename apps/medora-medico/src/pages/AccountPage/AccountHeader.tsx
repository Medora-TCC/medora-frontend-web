import { Mail, Stethoscope } from "lucide-react";
import { useMainLayout } from "../../components/MainLayout/mainLayoutContext";

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

export default function AccountHeader() {
  const { doctorRqes } = useMainLayout();

  if (!doctorRqes) {
    return <div className="h-24 rounded-2xl bg-surface-alt border border-divider animate-pulse" />;
  }

  const mainSpecialty = [...doctorRqes.rqes]
    .filter((r) => r.priority !== null)
    .sort((a, b) => a.priority! - b.priority!)[0]?.specialtyName;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-divider bg-surface-alt">
      <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-r from-primary-subtle to-transparent" />

      <div className="relative flex items-center gap-4 p-5">
        <div className="h-16 w-16 shrink-0 rounded-full bg-primary-color text-text-inverse flex items-center justify-center text-xl font-bold ring-4 ring-surface-alt">
          {getInitials(doctorRqes.doctorName)}
        </div>

        <div className="min-w-0">
          <h2 className="text-lg font-bold text-text-primary truncate">{doctorRqes.doctorName}</h2>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-text-secondary">
            <span className="inline-flex items-center gap-1.5">
              <Stethoscope size={14} />
              {mainSpecialty ?? "Sem especialidade principal"}
            </span>
            <span className="inline-flex items-center gap-1.5 min-w-0">
              <Mail size={14} />
              <span className="truncate">{doctorRqes.email}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}