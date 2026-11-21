import type { UserRole } from "../dtos/users";

export const ROLE_CONFIG: Record<UserRole, { label: string; className: string }> = {
  ADMIN: { label: "Admin", className: "bg-primary-subtle text-primary-text" },
  DOCTOR: { label: "Médico", className: "bg-success-subtle text-success-text" },
  PATIENT: { label: "Paciente", className: "bg-surface-raised text-text-secondary" },
};