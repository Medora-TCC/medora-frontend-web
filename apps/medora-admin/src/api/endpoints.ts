export const Endpoints = {
  // Autenticação
  LOGIN: "/auth/login",
  REFRESH: "/auth/refresh",
  LOGOUT: "/auth/logout",
  VERIFY_MFA: "/mfa/auth/verify",

  // Auditoria
  AUDIT_ENTRIES: "/admin/audit-entries",
  AUDIT_PROCESSES: "/admin/audit-entries/processes",

  // Repasses
  PAYOUTS_PREVIEW: "/admin/payouts/preview",
  PAYOUTS_ATTENTION: "/admin/payouts/attention",
  PAYOUT_CLOSINGS: "/admin/payouts/closings",
  PAYOUT_CLOSING: (id: number) => `/admin/payouts/closings/${id}`,
  PAYOUT_CLOSING_APPROVE: (id: number) => `/admin/payouts/closings/${id}/approve`,
  PAYOUT_CLOSING_PAID: (id: number) => `/admin/payouts/closings/${id}/paid`,
  PAYOUT_HOLD: (appointmentId: number) => `/admin/payouts/appointments/${appointmentId}/hold`,

  // Relatos de problema na consulta
  ISSUE_RELEASE: (issueId: number) => `/admin/appointment-issues/${issueId}/release`,
  ISSUE_REFUND: (issueId: number) => `/admin/appointment-issues/${issueId}/refund`,
} as const;