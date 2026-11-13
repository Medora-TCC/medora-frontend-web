import type { AuditResult } from "../../api/dtos/audit";

export const PROCESS_LABEL: Record<string, string> = {
  Login: "Login",
  Logout: "Logout",
  ForgotPassword: "Esqueceu a senha",
  ResetPassword: "Redefiniu a senha",
  ConfigureMfa: "Configurou MFA",
  UseBackupCode: "Usou código de backup",
  ViewPersonalData: "Viu dados pessoais",
  UpdatePersonalData: "Alterou dados pessoais",
  ScheduleAppointment: "Agendou consulta",
  ChangeAppointmentStatus: "Alterou status da consulta",
  EnterTeleconsultation: "Entrou na teleconsulta",
  AcceptTelemedicineConsent: "Aceitou termo de telemedicina",
  ViewMedicalRecord: "Viu prontuário",
  UpdateMedicalRecord: "Alterou prontuário",
  IssuePrescription: "Emitiu prescrição",
  ViewPrescription: "Viu prescrição",
  SignDocument: "Assinou documento",
  AuthorizePayment: "Autorizou pagamento",
  ConfirmTeleconsultation: "Confirmou teleconsulta",
  RejectTeleconsultation: "Recusou teleconsulta",
  RefundPayment: "Estornou pagamento",
  UpdatePixKey: "Alterou chave Pix",
  ReportAppointmentIssue: "Relatou problema na consulta",
  ReleasePayout: "Liberou repasse (relato recusado)",
  GeneratePayoutClosings: "Gerou fechamentos",
  ApprovePayoutClosing: "Aprovou fechamento",
  MarkPayoutClosingAsPaid: "Marcou fechamento como pago",
  DiscardPayoutClosing: "Descartou fechamento",
  HoldPayout: "Reteve repasse",
  ReleaseHeldPayout: "Liberou repasse retido",
  RegisterPatient: "Cadastro de paciente",
  DataChange: "Alteração de dados",
  ViewAuditLog: "Consultou a auditoria",
  AuditRetentionPurge: "Expurgo por retenção",
};

export const RESULT_CONFIG: Record<AuditResult, { label: string; className: string }> = {
  Success: { label: "Sucesso", className: "bg-success-subtle text-success-text" },
  Failure: { label: "Falha", className: "bg-danger-subtle text-danger-text" },
  Denied: { label: "Negado", className: "bg-warning-subtle text-warning-text" },
};

export const OPERATION_LABEL: Record<string, string> = {
  Added: "Criado",
  Modified: "Alterado",
  Deleted: "Excluído",
  SoftDeleted: "Excluído (lógico)",
};

export function processLabel(process: string | null) {
  if (!process) return null;
  return PROCESS_LABEL[process] ?? process;
}