import { Modal, Spinner } from "@heroui/react";
import { ModalConfirmacao, type IConsultaDetailed } from "@medora_web/shared";
import { useEffect, useState } from "react";
import {
  Video,
  User,
  Clock,
  MapPin,
  CreditCard,
  AlertCircle,
  Stethoscope,
  CheckCircle2,
  X,
  House,
  XCircle,
  UserX,
} from "lucide-react";
import EnterConsultaButton from "../../components/Consulta/EnterConsultaButton";
import { canEnter } from "../../pages/ConsultaScreen/ConsultaHelpers";
import EnterReceitaButton from "../Receita/EnterReceitaButton";
import EnterMedicalRecordButton from "../Prontuario/EnterMedicalRecordButton";
import AppointmentsService, { canDoctorCancel } from "../../api/services/Appointments";
import { errorMessage } from "../../api/errors";

// Mesmas regras do domínio (Appointment.cs): estes status ainda podem ser cancelados
const CANCELAVEIS = ["agendado", "confirmado", "esperando_pagamento", "esperando_confirmacao"];

type DoctorAction = "confirm" | "reject" | "complete" | "absent";

const actionCfg: Record<DoctorAction, { confirm?: string }> = {
  confirm: {},
  reject: { confirm: "Recusar esta consulta? A reserva no cartão do paciente será liberada, sem cobrança." },
  complete: {},
  absent: { confirm: "Registrar que o paciente faltou? Se a consulta foi paga, o paciente é reembolsado." },
};

interface ConsultaModalProps {
  appointment: IConsultaDetailed | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  /** Chamado depois que o médico confirma, recusa, conclui, registra falta ou cancela. */
  onChanged?: () => void;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[10px] font-semibold tracking-widest uppercase text-text">
      {children}
    </span>
  );
}

function InfoCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl bg-surface-raised border border-ring px-4 py-3 ${className}`}
    >
      {children}
    </div>
  );
}

export default function ConsultaModal({
  appointment,
  isOpen,
  onOpenChange,
  onChanged,
}: ConsultaModalProps) {
  const [acting, setActing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) setActionError(null);
  }, [isOpen, appointment]);

  async function runAction(action: DoctorAction) {
    if (!currentConsulta) return;
    const question = actionCfg[action].confirm;
    if (question && !window.confirm(question)) return;

    setActing(true);
    setActionError(null);
    try {
      const id = currentConsulta.id;
      if (action === "confirm") await AppointmentsService.confirmTeleconsultation(id);
      if (action === "reject") await AppointmentsService.rejectTeleconsultation(id);
      if (action === "complete") await AppointmentsService.changeAppointmentStatus(id, "Completed");
      if (action === "absent") await AppointmentsService.changeAppointmentStatus(id, "Absent");
      onChanged?.();
      onOpenChange(false);
    } catch (err) {
      setActionError(errorMessage(err, "Não foi possível atualizar a consulta."));
    } finally {
      setActing(false);
    }
  }

  const [currentConsulta, setCurrentConsulta] =
    useState<IConsultaDetailed | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isJoinable, setIsJoinable] = useState<boolean>(false);
  // calculado ao abrir: Date.now() não pode ser chamado durante a renderização
  const [hasStarted, setHasStarted] = useState(false);

  const [cancelando, setCancelando] = useState(false);

  const podeCancelar = !!currentConsulta
    && CANCELAVEIS.includes(currentConsulta.status)
    && canDoctorCancel(currentConsulta.startDateTime);

  async function cancelar() {
    if (!currentConsulta) return;

    setCancelando(true);
    setError(null);
    try {
      await AppointmentsService.changeAppointmentStatus(currentConsulta.id, "Canceled");
      onOpenChange(false);
      onChanged?.();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erro ao cancelar a consulta.");
    } finally {
      setCancelando(false);
    }
  }

  useEffect(() => {
    if (!appointment || !isOpen) return;

    setLoading(true);
    setError(null);
    setIsJoinable(false);
    try {
      setCurrentConsulta(appointment);
      setIsJoinable(canEnter(appointment))
      setHasStarted(new Date(appointment.startDateTime).getTime() <= Date.now());
    } catch {
      setError("Não foi possível carregar as informações da consulta")
    }
    finally {
      setLoading(false)
    }
  }, [appointment, isOpen]);

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <Modal.Backdrop>
        <Modal.Container>
          <Modal.Dialog className="max-w-2xl! w-full">
            {/* ── Custom Dialog Shell ── */}
            <div className="relative flex flex-col rounded-2xl bg-surface overflow-hidden max-h-[90vh]">
              {/* Header */}
              <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-ring">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-accent/10 border border-ring">
                    <Stethoscope className="w-4 h-4 text-accent" />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold tracking-widest uppercase text-text-secondary">
                      #{currentConsulta?.id ?? appointment?.id ?? "—"}
                    </p>
                    <h2 className="text-lg font-bold text-text-primary leading-tight">
                      Detalhes da Consulta
                    </h2>
                  </div>
                </div>
                <button
                  onClick={() => onOpenChange(false)}
                  className="flex items-center justify-center w-8 h-8 rounded-lg text-text hover:text-surface hover:bg-text-primary hover:cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable Body */}
              <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
                {loading && (
                  <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <Spinner size="lg" />
                    <p className="text-sm text-text-primary">
                      Carregando consulta…
                    </p>
                  </div>
                )}

                {error && (
                  <div className="flex items-center gap-3 rounded-xl bg-danger/10 border border-danger-soft-hover px-4 py-3">
                    <AlertCircle className="w-4 h-4 text-danger-text shrink-0" />
                    <p className="text-sm text-danger-text">{error}</p>
                  </div>
                )}

                {currentConsulta && !loading && (
                  <>
                    {/* ── Paciente ── */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-accent-soft border border-ring">
                          <User className="w-5 h-5 text-accent" />
                        </div>
                        <div>
                          <SectionLabel>Paciente</SectionLabel>
                          <p className="text-accent font-semibold text-base leading-tight">
                            {currentConsulta.patientNome}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* ── Cronológicos + Modalidade ── */}
                    <div className="grid grid-cols-3 gap-3">
                      <InfoCard>
                        <SectionLabel>Horário</SectionLabel>
                        <div className="flex items-center gap-1.5 mt-1">
                          <Clock className="w-3.5 h-3.5 text-accent" />
                          <p className="text-sm font-semibold text-text-primary">
                            {formatDate(currentConsulta.startDateTime)}
                          </p>
                        </div>
                      </InfoCard>

                      <InfoCard>
                        <SectionLabel>Modalidade</SectionLabel>
                        <div className="flex items-center gap-1.5 mt-1">
                          {currentConsulta?.type === "teleconsulta" ? (
                            <Video className="w-3.5 h-3.5 text-accent" />
                          ) : (
                            <House className="w-3.5 h-3.5 text-accent" />
                          )}
                          <p className="text-sm font-semibold  text-text-primary">
                            {currentConsulta.type ?? "teleconsulta"}
                          </p>
                        </div>
                      </InfoCard>

                      <InfoCard>
                        <SectionLabel>Local</SectionLabel>
                        <div className="flex items-center gap-1.5 mt-1">
                          <MapPin className="w-3.5 h-3.5 text-accent" />
                          <p className="text-sm font-semibold  text-text-primary truncate">
                            {currentConsulta.locationAdress ?? "Sala Virtual"}
                          </p>
                        </div>
                      </InfoCard>
                    </div>

                    <DoctorActions
                      status={currentConsulta.status}
                      hasStarted={hasStarted}
                      disabled={acting}
                      error={actionError}
                      onAction={runAction}
                    />

                    <div className="flex flex-col gap-3">
                      {currentConsulta?.type != "teleconsulta" && (
                        <InfoCard>
                          <SectionLabel>Convênio</SectionLabel>
                          <div className="flex items-center gap-1.5 mt-1">
                            <CreditCard className="w-3.5 h-3.5  text-accent" />
                            <p className="text-sm text-text-primary">
                              {currentConsulta.healthInsurance ?? "Particular"}
                            </p>
                          </div>
                        </InfoCard>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-6 py-4 border-t border-ring bg-surface backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  {currentConsulta && (
                    <span
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                        currentConsulta.status === "finalizado"
                          ? "bg-success-soft border-success-soft text-success"
                          : currentConsulta.status === "em_atendimento"
                            ? "bg-blue-500/10 border-blue-500/20 text-blue-400"
                            : currentConsulta.status === "cancelado"
                              ? "bg-danger/10 border-danger-soft text-danger"
                              : "bg-text/20 border-text text-text-secondary"
                      }`}
                    >
                      {currentConsulta.status === "finalizado" && (
                        <CheckCircle2 className="w-3 h-3" />
                      )}
                      {currentConsulta.status}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {podeCancelar && (
                    <ModalConfirmacao
                      onConfirm={cancelar}
                      disabled={cancelando}
                      texto={"Deseja realmente cancelar esta consulta? O pagamento do paciente será estornado."}
                      textoBotao={"Cancelar consulta"}
                      variant="danger"
                    />
                  )}
                  <EnterReceitaButton
                    appointmentId={currentConsulta?.id}
                    state={{ patientName: currentConsulta?.patientNome }}
                  />
                  <EnterMedicalRecordButton
                    appointmentId={currentConsulta?.id}
                    state={{ patientName: currentConsulta?.patientNome }}
                  />
                  {currentConsulta?.type === "teleconsulta" && (
                    <EnterConsultaButton
                      isJoinable={isJoinable}
                      id={currentConsulta?.id ?? ""}
                    />
                  )}
                </div>
              </div>
            </div>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}

function DoctorActions({
  status,
  hasStarted,
  disabled,
  error,
  onAction,
}: {
  status: IConsultaDetailed["status"];
  hasStarted: boolean;
  disabled: boolean;
  error: string | null;
  onAction: (action: DoctorAction) => void;
}) {
  const awaiting = status === "esperando_confirmacao";
  // concluir ou registrar falta só depois do horário, em consulta ainda aberta
  const closable = hasStarted && ["agendado", "confirmado", "em_atendimento"].includes(status);

  if (!awaiting && !closable) return null;

  const base = "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed";

  return (
    <InfoCard className="space-y-2">
      <SectionLabel>{awaiting ? "Aguardando sua confirmação" : "Consulta já passou"}</SectionLabel>
      <p className="text-xs text-text-secondary">
        {awaiting
          ? "O paciente já pagou. Ao confirmar, o valor é cobrado; ao recusar, a reserva é liberada sem cobrança."
          : "Conclua para a consulta entrar no repasse, ou registre que o paciente faltou (ele é reembolsado)."}
      </p>
      <div className="flex flex-wrap gap-2">
        {awaiting ? (
          <>
            <button className={`${base} bg-success text-white hover:opacity-90`} disabled={disabled} onClick={() => onAction("confirm")}>
              <CheckCircle2 className="w-4 h-4" /> Confirmar
            </button>
            <button className={`${base} border border-ring text-danger-text hover:bg-danger/10`} disabled={disabled} onClick={() => onAction("reject")}>
              <XCircle className="w-4 h-4" /> Recusar
            </button>
          </>
        ) : (
          <>
            <button className={`${base} bg-accent text-white hover:opacity-90`} disabled={disabled} onClick={() => onAction("complete")}>
              <CheckCircle2 className="w-4 h-4" /> Concluir consulta
            </button>
            <button className={`${base} border border-ring text-text-secondary hover:bg-surface-raised`} disabled={disabled} onClick={() => onAction("absent")}>
              <UserX className="w-4 h-4" /> Paciente faltou
            </button>
          </>
        )}
      </div>
      {error && <p className="text-xs text-danger-text">{error}</p>}
    </InfoCard>
  );
}
