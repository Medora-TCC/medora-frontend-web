import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface LevelConfig {
  label: string;
  className: string;
  icon: LucideIcon;
  iconClassName: string;
}

const LEVEL_CONFIG: Record<string, LevelConfig> = {
  Information: { label: "Informação", className: "bg-success-subtle text-success-text", icon: CheckCircle2, iconClassName: "text-success-text" },
  Warning: { label: "Aviso", className: "bg-warning-subtle text-warning-text", icon: AlertTriangle, iconClassName: "text-warning-text" },
  Error: { label: "Erro", className: "bg-danger-subtle text-danger-text", icon: XCircle, iconClassName: "text-danger-text" },
  Critical: { label: "Crítico", className: "bg-danger-subtle text-danger-text", icon: XCircle, iconClassName: "text-danger-text" },
};

const FALLBACK: LevelConfig = { label: "", className: "bg-surface-raised text-text-secondary", icon: Info, iconClassName: "text-text-muted" };

export function levelConfig(level: string): LevelConfig {
  return LEVEL_CONFIG[level] ?? { ...FALLBACK, label: level };
}