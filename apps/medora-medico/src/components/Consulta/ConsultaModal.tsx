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
  XCircle,
  UserX,
  Building2,
  Hourglass,
  CalendarClock,
  CalendarCheck,
  Activity,
  CheckCheck,
  type LucideIcon,
} from "lucide-react";
import EnterConsultaButton from "../../components/Consulta/EnterConsultaButton";
import { canEnter } from "../../pages/ConsultaScreen/ConsultaHelpers";
import EnterReceitaButton from "../Receita/EnterReceitaButton";
import EnterMedicalRecordButton from "../Prontuario/EnterMedicalRecordButton";
import AppointmentsService, { canDoctorCancel } from "../../api/services/Appointments";
import { errorMessage } from "../../api/errors";

// Mesmas regras do domínio (Appointment.cs): estes status ainda podem ser cancelados
const CANCELAVEIS = ["agendado", "confirmado", "esperando_pagamento", "esperando_confirmacao"];

// CLAUDE [Task 6]: lista de status "abertos" extraída para constante de módulo + helper `canClose`.
// Antes essa regra ficava presa dentro do DoctorActions; agora o modal (botão do rodapé) e o
// painel usam EXATAMENTE a mesma regra, sem risco de ficarem divergentes.
const ABERTAS = ["agendado", "confirmado", "em_atendimento"];
// Concluir ou registrar falta só depois do horário, em consulta ainda aberta.
// A regra NÃO olha o tipo (presencial/teleconsulta), então vale para os dois.
function canClose(status: string, hasStarted: boolean) {
  return hasStarted && ABERTAS.includes(status);
}

type DoctorAction = "confirm" | "reject" | "complete" | "absent";

// CLAUDE [Confirmação]: cada ação que precisa de confirmação agora descreve o CONTEÚDO de um modal
// próprio (título, mensagem, rótulo do botão, ícone e tom de cor) em vez de uma string passada
// ao `window.confirm` do navegador. O alerta nativo não segue o tema, não dá para estilizar,
// não mostra contexto (paciente/horário) e tem aparência diferente em cada navegador.
type ConfirmTone = "success" | "danger" | "warning";
interface ConfirmCfg {
  title: string;
  message: string;
  confirmLabel: string;
  tone: ConfirmTone;
  icon: LucideIcon;
}
const TONE: Record<ConfirmTone, { iconBox: string; button: string }> = {
  success: { iconBox: "bg-success/10 text-success", button: "bg-success text-white" },
  danger: { iconBox: "bg-danger/10 text-danger", button: "bg-danger text-white" },
  warning: { iconBox: "bg-orange-500/10 text-orange-600", button: "bg-orange-500 text-white" },
};

const actionCfg: Record<DoctorAction, { confirm?: ConfirmCfg }> = {
  confirm: {},
  reject: {
    confirm: {
      title: "Recusar esta consulta?",
      message: "A reserva no cartão do paciente será liberada, sem cobrança.",
      confirmLabel: "Recusar consulta",
      tone: "danger",
      icon: XCircle,
    },
  },
  // CLAUDE [Task 6]: "complete" agora pede confirmação. A task fala em "confirmar fim da consulta"
  // e concluir é uma ação que muda o status e dispara o repasse, então um clique acidental
  // não deve finalizar a consulta direto.
  complete: {
    confirm: {
      title: "Finalizar esta consulta?",
      message: "Ela será marcada como concluída e entrará no repasse.",
      confirmLabel: "Finalizar consulta",
      tone: "success",
      icon: CheckCircle2,
    },
  },
  absent: {
    confirm: {
      title: "Registrar falta do paciente?",
      message: "Se a consulta foi paga, o paciente é reembolsado.",
      confirmLabel: "Registrar falta",
      tone: "warning",
      icon: UserX,
    },
  },
};

// CLAUDE [Task 6]: classes base dos botões de ação movidas para o módulo (antes eram uma const
// dentro do DoctorActions) para o botão "Finalizar consulta" do rodapé reaproveitar o mesmo estilo.
const actionBtnBase =
  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed";

// ─────────────────────────────────────────────────────────────────────────────
// CLAUDE [Task 2 + Task 7]: configuração visual do TIPO da consulta em um só lugar.
// Cada tipo tem ícone + cor próprios: teleconsulta = violeta + câmera; presencial = teal + prédio.
// O ícone `House` (casa) foi trocado por `Building2` porque "casa" sugere atendimento domiciliar,
// não consultório/clínica. As cores foram escolhidas para não colidir com as dos status
// (âmbar = pendente, azul = em andamento, verde = concluída, vermelho = cancelada).
const TIPO_TELE = {
  label: "Teleconsulta",
  icon: Video,
  className: "bg-violet-500/10 border-violet-500/30 text-violet-600",
};
const TIPO_PRESENCIAL = {
  label: "Presencial",
  icon: Building2,
  className: "bg-teal-500/10 border-teal-500/30 text-teal-600",
};

// CLAUDE [Task 2 + Task 7]: componente EXPORTADO para o ConsultaScreen reaproveitar o mesmo visual
// no card da lista (um único lugar define cor/ícone do tipo). O tag do tipo tem formato
// "retangular arredondado" (rounded-md) e o de status é "pílula" (rounded-full), assim os dois
// lado a lado não parecem a mesma coisa. `compact` mostra só o ícone (para cantos de card).
export function TipoConsultaTag({
  type,
  compact = false,
}: {
  type?: string | null;
  compact?: boolean;
}) {
  // mesmo fallback que o modal já usava: sem tipo = teleconsulta
  const isTele = (type ?? "teleconsulta") === "teleconsulta";
  const cfg = isTele ? TIPO_TELE : TIPO_PRESENCIAL;
  const Icon = cfg.icon;
  return (
    <span
      title={cfg.label}
      className={`inline-flex items-center gap-1.5 rounded-md border font-semibold ${
        compact ? "p-1" : "px-2.5 py-1 text-xs"
      } ${cfg.className}`}
    >
      <Icon className="w-3.5 h-3.5" aria-hidden />
      {compact ? <span className="sr-only">{cfg.label}</span> : cfg.label}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CLAUDE [Task 7]: antes a tag de status era um ternário com 4 cores e mostrava o valor cru do
// banco ("esperando_confirmacao", "em_atendimento"...) com underscore. Agora cada um dos 8 status
// tem rótulo legível em português, ícone e cor própria. Status desconhecido cai num fallback
// neutro mostrando o texto original (nunca quebra se o backend criar um status novo).
const STATUS_TAG: Record<string, { label: string; icon: LucideIcon; className: string }> = {
  agendado: { label: "Agendada", icon: CalendarClock, className: "bg-text/10 border-ring text-text-secondary" },
  esperando_pagamento: { label: "Aguardando pagamento", icon: CreditCard, className: "bg-amber-500/10 border-amber-500/30 text-amber-600" },
  esperando_confirmacao: { label: "Aguardando confirmação", icon: Hourglass, className: "bg-amber-500/10 border-amber-500/30 text-amber-600" },
  confirmado: { label: "Confirmada", icon: CalendarCheck, className: "bg-accent/10 border-accent/30 text-accent" },
  em_atendimento: { label: "Em andamento", icon: Activity, className: "bg-blue-500/10 border-blue-500/30 text-blue-500" },
  finalizado: { label: "Concluída", icon: CheckCheck, className: "bg-success-soft border-success-soft text-success" },
  cancelado: { label: "Cancelada", icon: XCircle, className: "bg-danger/10 border-danger-soft text-danger" },
  ausente: { label: "Ausente", icon: UserX, className: "bg-orange-500/10 border-orange-500/30 text-orange-600" },
};

export function StatusConsultaTag({ status }: { status: string }) {
  const cfg = STATUS_TAG[status] ?? {
    label: status,
    icon: CalendarClock,
    className: "bg-text/10 border-ring text-text-secondary",
  };
  const Icon = cfg.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${cfg.className}`}
    >
      <Icon className="w-3.5 h-3.5" aria-hidden />
      {cfg.label}
    </span>
  );
}

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
  // CLAUDE [Confirmação]: ação aguardando confirmação (null = nenhum modal de confirmação aberto).
  const [pendingAction, setPendingAction] = useState<DoctorAction | null>(null);

  useEffect(() => {
    if (isOpen) setActionError(null);
    // CLAUDE [Confirmação]: se o modal principal fechar, descarta qualquer confirmação pendente
    // para ela não reaparecer na próxima vez que abrir outra consulta.
    else setPendingAction(null);
  }, [isOpen, appointment]);

  async function runAction(action: DoctorAction) {
    if (!currentConsulta) return;
    // CLAUDE [Confirmação]: removido o `window.confirm`. A confirmação agora acontece ANTES de
    // chamar `runAction` (ver `requestAction`), então esta função só executa a ação.
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

  // CLAUDE [Confirmação]: ponto de entrada de TODOS os botões de ação. Se a ação tem confirmação
  // configurada, abre o modal customizado; se não (ex.: "confirm"), executa direto.
  function requestAction(action: DoctorAction) {
    if (actionCfg[action].confirm) setPendingAction(action);
    else runAction(action);
  }

  // CLAUDE [Confirmação]: chamada pelo botão do modal de confirmação. Espera a ação terminar e
  // só então fecha a confirmação; em caso de erro o modal fecha e a mensagem aparece no painel
  // de ações do modal principal (`actionError`).
  async function confirmPending() {
    if (!pendingAction) return;
    await runAction(pendingAction);
    setPendingAction(null);
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

  // CLAUDE [Task 6]: nova flag para o botão "Finalizar consulta" do rodapé. Usa o mesmo helper
  // `canClose` do painel, então aparece para presencial E teleconsulta (não depende do `type`).
  const podeFinalizar = !!currentConsulta && canClose(currentConsulta.status, hasStarted);

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

  const pendingCfg = pendingAction ? actionCfg[pendingAction].confirm : undefined;

  return (
    <>
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
                    {/* CLAUDE [Task 7]: o lado direito dessa linha estava vazio (justify-between com um
                        único filho). Aproveitei o espaço para exibir as tags de TIPO e STATUS logo
                        ao lado do paciente, que é onde o médico olha primeiro. Antes o status ficava
                        escondido no rodapé, longe do contexto. `flex-wrap` evita estouro em telas estreitas. */}
                    <div className="flex items-center justify-between gap-3 flex-wrap">
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

                      <div className="flex items-center gap-2">
                        <TipoConsultaTag type={currentConsulta.type} />
                        <StatusConsultaTag status={currentConsulta.status} />
                      </div>
                    </div>

                    {/* ── Cronológicos + Local ── */}
                    {/* CLAUDE [Task 2]: o card "Modalidade" foi REMOVIDO porque o tipo agora aparece
                        como tag colorida (ícone + cor) ao lado do paciente. Manter os dois seria
                        informação duplicada. A grade passou de 3 para 2 colunas para os cards
                        restantes (Horário e Local) ocuparem o espaço livre. */}
                    <div className="grid grid-cols-2 gap-3">
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
                      onAction={requestAction}
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
              {/* CLAUDE [Task 7]: o bloco da esquerda (tag de status com ternário) foi removido do
                  rodapé porque o status agora vive no topo, ao lado do paciente. Por isso o rodapé
                  usa `justify-end`. Adicionei `flex-wrap` porque com o novo botão "Finalizar
                  consulta" o rodapé pode ter 5 botões e estourar a largura em telas menores. */}
              <div className="flex items-center justify-end px-6 py-4 border-t border-ring bg-surface backdrop-blur-sm">
                <div className="flex flex-wrap items-center justify-end gap-2">
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
                    // CLAUDE [Task 8]: o fallback era `?? ""` (string vazia) para uma prop
                    // `number | null`: erro de tipo. Agora passa `null`; o botão trata isso
                    // ficando desabilitado.
                    <EnterConsultaButton
                      isJoinable={isJoinable}
                      id={currentConsulta?.id ?? null}
                    />
                  )}

                  {/* CLAUDE [Task 6]: NOVO botão "Finalizar consulta" no rodapé. Antes o "Concluir"
                      ficava dentro do painel no meio do modal, fácil de passar batido, principalmente
                      numa consulta PRESENCIAL (que nem tem o botão Entrar para guiar o fluxo).
                      Agora é a ação principal do rodapé, em verde, e funciona igual para presencial e
                      teleconsulta porque `podeFinalizar` não depende do tipo. Passa pela confirmação
                      agora abre o modal de confirmação customizado (requestAction → ConfirmActionModal) em vez do
                      alerta nativo do navegador. */}
                  {podeFinalizar && (
                    <button
                      className={`${actionBtnBase} bg-success text-white hover:opacity-90`}
                      disabled={acting}
                      onClick={() => requestAction("complete")}
                    >
                      <CheckCircle2 className="w-4 h-4" /> Finalizar consulta
                    </button>
                  )}
                </div>
              </div>
            </div>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>

    {/* CLAUDE [Confirmação]: modal de confirmação customizado, irmão do modal principal (não
        aninhado no DOM dele). Só é montado quando há uma ação pendente. */}
    {pendingCfg && (
      <ConfirmActionModal
        cfg={pendingCfg}
        loading={acting}
        patientName={currentConsulta?.patientNome}
        startDateTime={currentConsulta?.startDateTime}
        onCancel={() => setPendingAction(null)}
        onConfirm={confirmPending}
      />
    )}
    </>
  );
}

// CLAUDE [Confirmação]: componente do modal de confirmação. Usa o mesmo Modal do HeroUI e o
// mesmo visual do resto do sistema (bg-surface, bordas `ring`, ícone em caixa colorida).
//  - O tom (verde/vermelho/laranja) vem da ação: finalizar = verde, recusar = vermelho,
//    falta = laranja, para o médico perceber o peso da ação antes de clicar.
//  - Mostra paciente e horário num cartão para ele confirmar que está finalizando a consulta
//    CERTA (o alerta nativo não tinha esse contexto).
//  - Enquanto a ação roda (`loading`) os botões ficam desabilitados, o botão mostra Spinner e
//    Esc/clique no fundo NÃO fecham, evitando duplo clique e fechar no meio da requisição.
function ConfirmActionModal({
  cfg,
  loading,
  patientName,
  startDateTime,
  onCancel,
  onConfirm,
}: {
  cfg: ConfirmCfg;
  loading: boolean;
  patientName?: string;
  startDateTime?: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const tone = TONE[cfg.tone];
  const Icon = cfg.icon;
  const quando = startDateTime
    ? new Date(startDateTime).toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <Modal
      isOpen
      onOpenChange={(open) => {
        if (!open && !loading) onCancel();
      }}
    >
      <Modal.Backdrop>
        <Modal.Container>
          <Modal.Dialog className="max-w-md! w-full">
            <div className="flex flex-col gap-4 rounded-2xl bg-surface p-6">
              <div className="flex items-start gap-3">
                <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${tone.iconBox}`}>
                  <Icon className="w-5 h-5" aria-hidden />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-text-primary leading-tight">{cfg.title}</h3>
                  <p className="mt-1 text-sm text-text-secondary">{cfg.message}</p>
                </div>
              </div>

              {patientName && (
                <InfoCard>
                  <SectionLabel>Consulta</SectionLabel>
                  <p className="mt-1 text-sm font-semibold text-text-primary">{patientName}</p>
                  {quando && <p className="text-xs text-text-secondary">{quando}</p>}
                </InfoCard>
              )}

              <div className="flex justify-end gap-2">
                <button
                  className={`${actionBtnBase} border border-ring text-text-secondary hover:bg-surface-raised`}
                  disabled={loading}
                  onClick={onCancel}
                >
                  Voltar
                </button>
                <button
                  className={`${actionBtnBase} ${tone.button} hover:opacity-90`}
                  disabled={loading}
                  onClick={onConfirm}
                >
                  {loading && <Spinner size="sm" />}
                  {cfg.confirmLabel}
                </button>
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
  // CLAUDE [Task 6]: agora usa o helper `canClose` compartilhado com o rodapé (mesma regra nos dois lugares).
  const closable = canClose(status, hasStarted);

  if (!awaiting && !closable) return null;

  return (
    <InfoCard className="space-y-2">
      <SectionLabel>{awaiting ? "Aguardando sua confirmação" : "Consulta já passou"}</SectionLabel>
      {/* CLAUDE [Task 6]: texto ajustado: "Concluir" saiu daqui e foi para o botão
          "Finalizar consulta" do rodapé, então o texto aponta para lá. */}
      <p className="text-xs text-text-secondary">
        {awaiting
          ? "O paciente já pagou. Ao confirmar, o valor é cobrado; ao recusar, a reserva é liberada sem cobrança."
          : "Finalize a consulta pelo botão no rodapé para ela entrar no repasse, ou registre que o paciente faltou (ele é reembolsado)."}
      </p>
      <div className="flex flex-wrap gap-2">
        {awaiting ? (
          <>
            <button className={`${actionBtnBase} bg-success text-white hover:opacity-90`} disabled={disabled} onClick={() => onAction("confirm")}>
              <CheckCircle2 className="w-4 h-4" /> Confirmar
            </button>
            <button className={`${actionBtnBase} border border-ring text-danger-text hover:bg-danger/10`} disabled={disabled} onClick={() => onAction("reject")}>
              <XCircle className="w-4 h-4" /> Recusar
            </button>
          </>
        ) : (
          // CLAUDE [Task 6]: o botão "Concluir consulta" foi removido daqui (agora é o
          // "Finalizar consulta" do rodapé). Sobrou só "Paciente faltou", que é uma ação
          // secundária/de exceção e faz sentido ficar no painel.
          <button className={`${actionBtnBase} border border-ring text-text-secondary hover:bg-surface-raised`} disabled={disabled} onClick={() => onAction("absent")}>
            <UserX className="w-4 h-4" /> Paciente faltou
          </button>
        )}
      </div>
      {error && <p className="text-xs text-danger-text">{error}</p>}
    </InfoCard>
  );
}