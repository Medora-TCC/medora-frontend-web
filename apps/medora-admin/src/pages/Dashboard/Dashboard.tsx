import { useCallback, useEffect, useState } from "react";
import { Button, Spinner } from "@heroui/react";
import { useNavigate } from "react-router";
import {
  AlertTriangle, BadgeCheck, ChevronRight, Cpu, RefreshCw, ShieldAlert, Stethoscope, UserCheck, Users, Wifi,
} from "lucide-react";
import AdminHeader from "../../components/Header/Header";
import { searchUsers } from "../../api/services/AdminUserService";
import { searchWorkerLogs } from "../../api/services/WorkerLogService";
import { searchAuditEntries } from "../../api/services/AuditService";
import { getAttention, listClosings } from "../../api/services/PayoutService";
import { getCredentialsOverview } from "../../api/services/DashboardService";
import type { AdminUserSummary } from "../../api/dtos/users";
import type { WorkerLogItem } from "../../api/dtos/workerLogs";
import type { CredentialsOverview } from "../../api/dtos/dashboard";
import { levelConfig } from "../../api/mappers/workerLogLabels";

interface DashboardData {
  users: AdminUserSummary | null;
  workerErrors: number | null;
  workerWarnings: number | null;
  recentWorkerEvents: WorkerLogItem[] | null;
  deniedAccesses: number | null;
  failedRequests: number | null;
  pendingIssues: number | null;
  heldPayouts: number | null;
  pendingClosings: number | null;
  credentials: CredentialsOverview | null;
}

const EMPTY: DashboardData = {
  users: null, workerErrors: null, workerWarnings: null, recentWorkerEvents: null,
  deniedAccesses: null, failedRequests: null, pendingIssues: null, heldPayouts: null, pendingClosings: null,
  credentials: null,
};

const DOCTOR_STATUS_LABEL: Record<string, string> = {
  Approved: "Aprovados",
  Pending: "Pendentes",
  Rejected: "Rejeitados",
};

function previousMonth() {
  const now = new Date();
  const d = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

// "desde ontem" no fuso de quem está olhando, no mesmo formato do filtro de data das telas
function yesterday() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function timeAgo(iso: string) {
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return "agora";
  if (minutes < 60) return `há ${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `há ${hours} h`;
  return `há ${Math.round(hours / 24)} dias`;
}

// cada bloco é independente: se um endpoint falhar, só aquele bloco fica indisponível
const valueOf = <T,>(result: PromiseSettledResult<T>): T | null =>
  result.status === "fulfilled" ? result.value : null;

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData>(EMPTY);
  const [isLoading, setIsLoading] = useState(true);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    const since = new Date(`${yesterday()}T00:00:00`).toISOString();

    const [users, errors, warnings, recent, denied, failures, attention, closings, credentials] = await Promise.allSettled([
      searchUsers({ page: 1, pageSize: 1 }),
      searchWorkerLogs({ from: since, level: "Error", page: 1, pageSize: 1 }),
      searchWorkerLogs({ from: since, level: "Warning", page: 1, pageSize: 1 }),
      searchWorkerLogs({ page: 1, pageSize: 5 }),
      searchAuditEntries({ from: since, result: "Denied", page: 1, pageSize: 1 }),
      searchAuditEntries({ from: since, result: "Failure", page: 1, pageSize: 1 }),
      getAttention(),
      listClosings(previousMonth()),
      getCredentialsOverview(),
    ]);

    const attentionItems = valueOf(attention);
    const closingItems = valueOf(closings);

    setData({
      users: valueOf(users)?.summary ?? null,
      workerErrors: valueOf(errors)?.total ?? null,
      workerWarnings: valueOf(warnings)?.total ?? null,
      recentWorkerEvents: valueOf(recent)?.items ?? null,
      deniedAccesses: valueOf(denied)?.total ?? null,
      failedRequests: valueOf(failures)?.total ?? null,
      pendingIssues: attentionItems ? attentionItems.filter((a) => a.issueId !== null).length : null,
      heldPayouts: attentionItems ? attentionItems.filter((a) => a.heldAt !== null && a.issueId === null).length : null,
      pendingClosings: closingItems ? closingItems.filter((c) => c.status === "PendingApproval").length : null,
      credentials: valueOf(credentials),
    });
    setUpdatedAt(new Date());
    setIsLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const from = yesterday();

  const alerts = [
    { label: "Médicos com selo suspenso", count: data.credentials?.ladder.sealSuspended ?? null, to: "#credenciais", danger: true },
    { label: "Médicos com reverificação pendente", count: data.credentials?.ladder.reverificationPending ?? null, to: "#credenciais", danger: false },
    { label: "Relatos de pacientes aguardando decisão", count: data.pendingIssues, to: "/admin/payouts#em-analise", danger: true },
    { label: "Erros do worker desde ontem", count: data.workerErrors, to: `/admin/logs?level=Error&from=${from}`, danger: true },
    { label: "Fechamentos aguardando aprovação", count: data.pendingClosings, to: "/admin/payouts#fechamentos", danger: false },
    { label: "Repasses retidos", count: data.heldPayouts, to: "/admin/payouts#em-analise", danger: false },
    { label: "Acessos negados desde ontem", count: data.deniedAccesses, to: `/admin/audit?result=Denied&from=${from}`, danger: false },
    { label: "Falhas de requisição desde ontem", count: data.failedRequests, to: `/admin/audit?result=Failure&from=${from}`, danger: false },
  ];
  const activeAlerts = alerts.filter((a) => a.count !== null && a.count > 0);
  const unavailable = alerts.filter((a) => a.count === null).length;

  // destinos com "#" ficam nesta mesma página: só rola até a seção
  const goTo = (to: string) => {
    if (to.startsWith("#")) {
      document.getElementById(to.slice(1))?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    navigate(to);
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <AdminHeader />

      <main className="py-4 px-6 space-y-5 max-w-7xl mx-auto w-full">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Visão geral</h1>
            <p className="text-sm text-text-muted mt-0.5">
              {updatedAt ? `Atualizado às ${updatedAt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}` : "Carregando…"}
            </p>
          </div>
          <Button size="sm" variant="outline" isDisabled={isLoading} onPress={load}>
            <RefreshCw size={14} /> Atualizar
          </Button>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatBox icon={<Users size={22} className="text-primary-text" />} label="Usuários ativos"
            value={data.users?.active} subtext={data.users ? `de ${data.users.total} cadastrados` : undefined} />
          <StatBox icon={<Stethoscope size={22} className="text-success-text" />} label="Médicos" value={data.users?.doctors} />
          <StatBox icon={<Wifi size={22} className="text-success-text" />} label="Online agora"
            value={data.users?.onlineNow} subtext="usaram o sistema nos últimos 15 min" />
          <StatBox icon={<Cpu size={22} className="text-danger-text" />} label="Erros do worker (desde ontem)"
            value={data.workerErrors} subtext={data.workerWarnings !== null ? `${data.workerWarnings} avisos` : undefined} />
        </div>

        <section id="credenciais" className="bg-surface-alt rounded-xl border border-divider overflow-hidden scroll-mt-4">
          <div className="p-4 border-b border-divider">
            <h2 className="font-bold text-lg flex items-center gap-2">
              <BadgeCheck size={20} className="text-success-text" />
              Credenciais médicas
            </h2>
            <p className="text-sm text-text-muted mt-0.5">Verificação contínua de CRM e RQE dos médicos aprovados</p>
          </div>

          {!data.credentials ? (
            <p className="py-8 text-center text-sm text-text-muted">{isLoading ? "Carregando…" : "Indisponível no momento."}</p>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 p-4">
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  <LadderBox label="Verificados" hint="até 30 dias" value={data.credentials.ladder.verified} className="text-success-text" />
                  <LadderBox label="Reverificação" hint="30 a 33 dias" value={data.credentials.ladder.reverificationPending} className="text-warning-text" />
                  <LadderBox label="Selo suspenso" hint="mais de 33 dias" value={data.credentials.ladder.sealSuspended} className="text-danger-text" />
                </div>
                <div className="flex flex-wrap gap-2">
                  {data.credentials.byStatus.map((s) => (
                    <span key={s.status} className="px-2.5 py-1 rounded-full text-xs font-semibold bg-surface border border-divider text-text-secondary">
                      {DOCTOR_STATUS_LABEL[s.status] ?? s.status}: {s.count}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-text-muted mb-2">Precisam de reverificação</p>
                {data.credentials.needingAttention.length === 0 ? (
                  <p className="text-sm text-text-muted">Todos os médicos aprovados estão em dia.</p>
                ) : (
                  <ul className="divide-y divide-divider">
                    {data.credentials.needingAttention.map((d) => (
                      <li key={d.doctorId} className="py-2 flex items-center justify-between gap-3 text-sm">
                        <span className="text-text-primary truncate">{d.name}</span>
                        <span className="text-xs text-text-muted shrink-0">
                          {d.verificationDate ? `verificado ${timeAgo(d.verificationDate)}` : "nunca verificado"}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <section className="lg:col-span-2 bg-surface-alt rounded-xl border border-divider overflow-hidden">
            <div className="p-4 border-b border-divider">
              <h2 className="font-bold text-lg flex items-center gap-2">
                <AlertTriangle size={20} className="text-warning-text" />
                Precisa de atenção
              </h2>
              <p className="text-sm text-text-muted mt-0.5">O que depende de uma ação sua</p>
            </div>

            {isLoading ? (
              <div className="py-10 flex justify-center"><Spinner /></div>
            ) : activeAlerts.length === 0 ? (
              <p className="py-10 text-center text-sm text-text-muted">
                <UserCheck size={18} className="inline mr-1 text-success-text" />
                Tudo em dia.
              </p>
            ) : (
              <div className="divide-y divide-divider">
                {activeAlerts.map((alert) => (
                  <button
                    key={alert.label}
                    type="button"
                    onClick={() => goTo(alert.to)}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-surface/50 transition-colors text-left"
                  >
                    <span className="text-sm text-text-primary">{alert.label}</span>
                    <span className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${alert.danger ? "bg-danger-subtle text-danger-text" : "bg-warning-subtle text-warning-text"}`}>
                        {alert.count}
                      </span>
                      <ChevronRight size={16} className="text-text-muted" />
                    </span>
                  </button>
                ))}
              </div>
            )}

            {!isLoading && unavailable > 0 && (
              <p className="px-4 py-2 border-t border-divider text-xs text-text-muted flex items-center gap-1">
                <ShieldAlert size={12} /> {unavailable} {unavailable === 1 ? "indicador indisponível" : "indicadores indisponíveis"} no momento.
              </p>
            )}
          </section>

          <section className="bg-surface-alt rounded-xl border border-divider overflow-hidden">
            <div className="p-4 border-b border-divider flex justify-between items-center">
              <div>
                <h2 className="font-bold text-lg flex items-center gap-2">
                  <Cpu size={20} className="text-primary-text" />
                  Worker
                </h2>
                <p className="text-sm text-text-muted mt-0.5">Últimos eventos</p>
              </div>
              <Button size="sm" variant="ghost" onPress={() => navigate("/admin/logs")}>Ver todos</Button>
            </div>

            {isLoading ? (
              <div className="py-10 flex justify-center"><Spinner /></div>
            ) : !data.recentWorkerEvents ? (
              <p className="py-10 text-center text-sm text-text-muted">Indisponível no momento.</p>
            ) : data.recentWorkerEvents.length === 0 ? (
              <p className="py-10 text-center text-sm text-text-muted">Nenhum evento registrado.</p>
            ) : (
              <div className="divide-y divide-divider">
                {data.recentWorkerEvents.map((event) => {
                  const level = levelConfig(event.level);
                  const Icon = level.icon;
                  return (
                    <div key={event.id} className="flex items-center gap-3 px-4 py-3">
                      <Icon size={18} className={`${level.iconClassName} shrink-0`} />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-text-primary truncate">{event.eventType}</p>
                        <p className="text-xs text-text-muted truncate">
                          {timeAgo(event.createdAt)}{event.doctorName ? ` · ${event.doctorName}` : ""}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

function StatBox({ icon, label, value, subtext }: {
  icon: React.ReactNode;
  label: string;
  value: number | null | undefined;
  subtext?: string;
}) {
  return (
    <div className="bg-surface-alt p-5 rounded-xl border border-divider flex items-center gap-4">
      <div className="p-3 bg-surface rounded-lg border border-divider shrink-0">{icon}</div>
      <div className="min-w-0">
        <p className="text-xs text-text-muted font-bold uppercase tracking-wider leading-none">{label}</p>
        <p className="text-3xl font-bold text-text-primary my-1.5">{value ?? "—"}</p>
        {subtext && <p className="text-xs text-text-muted leading-none">{subtext}</p>}
      </div>
    </div>
  );
}

function LadderBox({ label, hint, value, className }: { label: string; hint: string; value: number; className: string }) {
  return (
    <div className="bg-surface rounded-lg border border-divider p-3 text-center">
      <p className={`text-2xl font-bold ${className}`}>{value}</p>
      <p className="text-xs font-semibold text-text-primary">{label}</p>
      <p className="text-[11px] text-text-muted">{hint}</p>
    </div>
  );
}