import { BadgeCheck, Clock, ShieldAlert, XCircle, type LucideIcon } from "lucide-react";
import { formatVerificationDate } from "./formatVerificationDate";
import type { DoctorStatus, VerificationBadge as VerificationBadgeKind } from "../../api/dtos/Doctors/ProfessionalRegistrationDto";

type Tone = { label: string; className: string; icon: LucideIcon };

const SUCCESS = "bg-success-subtle text-success-text";
const WARNING = "bg-warning-subtle text-warning-text";
const DANGER = "bg-danger-subtle text-danger-text";

const STATUS_TONE: Record<DoctorStatus, Tone> = {
  Approved: { label: "Verificado", className: SUCCESS, icon: BadgeCheck },
  Pending:  { label: "Em análise", className: WARNING, icon: Clock },
  Rejected: { label: "Não aprovado", className: DANGER, icon: XCircle },
};

const BADGE_TONE: Record<VerificationBadgeKind, Tone> = {
  Verified:              { label: "Verificado", className: SUCCESS, icon: BadgeCheck },
  PendingReverification: { label: "Em reverificação", className: WARNING, icon: Clock },
  Suspended:             { label: "Suspenso", className: DANGER, icon: ShieldAlert },
};

// a data aparece sempre, absoluta e relativa, como o paciente vê no app
function badgeText(badge: VerificationBadgeKind, formattedDate: string) {
  switch (badge) {
    case "Verified":
      return `Verificado em ${formattedDate}`;
    case "PendingReverification":
      return `Verificado em ${formattedDate} · reverificação em andamento`;
    case "Suspended":
      return `Credenciais não reconfirmadas junto ao conselho desde ${formattedDate}`;
  }
}

export default function VerificationBadge({ status, verificationBadge, verificationDate }: Readonly<{
  status: DoctorStatus;
  verificationBadge?: VerificationBadgeKind | null;
  verificationDate?: string | null;
}>) {
  const tone = verificationBadge ? BADGE_TONE[verificationBadge] : STATUS_TONE[status];
  const Icon = tone.icon;

  const formattedDate = verificationDate ? formatVerificationDate(verificationDate) : null;
  const text = verificationBadge && formattedDate ? badgeText(verificationBadge, formattedDate) : tone.label;

  return (
    <span className={`shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${tone.className}`}>
      <Icon size={14} />
      {text}
    </span>
  );
}
