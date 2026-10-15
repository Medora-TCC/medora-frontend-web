import { useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Button, Spinner } from "@heroui/react";
import {
  AlertTriangle,
  ArrowUpRight,
  Calendar,
  ChevronRight,
  Clock,
  DollarSign,
  FileText,
  Star,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router";
import { getDashboard } from "../../api/services/DoctorService";
import type { DoctorDashboardDto, UpcomingAppointmentDto } from "../../api/dtos/Doctors/DoctorDashboardDto";
import { appointmentStatusLabel, appointmentTypeLabel } from "../../api/mappers/appointmentLabels";
import WeeklyFlowCard from "./WeeklyFlowCard";

const TELE_SHOW_BEFORE_MS = 15 * 60 * 1000;

const currencyFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit",
  });
}

function getGreeting(date: Date) {
  const hour = date.getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState<DoctorDashboardDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [now, setNow] = useState(() => new Date());

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      setData(await getDashboard());
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Erro ao carregar o dashboard.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(timer);
  }, []);

  if (errorMessage) {
    return (
      <div className="flex items-center justify-center py-20 px-6">
        <div className="max-w-sm w-full bg-surface-alt border border-divider rounded-xl p-6 text-center shadow-sm">
          <div className="w-12 h-12 rounded-full bg-danger-subtle flex items-center justify-center mx-auto mb-3">
            <AlertTriangle size={22} className="text-danger-text" />
          </div>
          <h2 className="font-bold text-base text-text-primary mb-1">Não foi possível carregar o dashboard</h2>
          <p className="text-xs text-text-muted mb-4">{errorMessage}</p>
          <Button size="sm" variant="primary" onPress={loadDashboard} isDisabled={isLoading}>
            {isLoading ? <Spinner color="current" size="sm" /> : "Tentar novamente"}
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading || !data) {
    return <div className="flex justify-center py-20"><Spinner /></div>;
  }

  const tele = data.activeTeleconsultation;
  const showTele =
    tele !== null &&
    now.getTime() >= new Date(tele.startDateTime).getTime() - TELE_SHOW_BEFORE_MS &&
    now.getTime() < new Date(tele.endDateTime).getTime();

  const openAppointment = (appointment: UpcomingAppointmentDto) => {
    if (appointment.type === "Online" && appointment.meetingCode) {
      navigate(`teleconsulta/${appointment.meetingCode}/pre-sala`);
      return;
    }
    navigate("prontuario"); // TODO: rota do prontuário com o id da consulta
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <main className="py-3 px-6 space-y-3 max-w-7xl mx-auto w-full">

        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="text-xl font-bold text-text-primary">
              {getGreeting(now)}, {data.doctorName}
            </h1>
            <p className="text-xs text-text-muted">
              {data.todayCount === 0
                ? "Você não tem consultas para hoje."
                : <>Você tem <span className="font-bold text-primary-color">{data.todayCount}</span> {data.todayCount === 1 ? "consulta" : "consultas"} para hoje.</>}
            </p>
          </div>
          <Button size="sm" variant="outline" onPress={() => navigate("/medico/agenda")} className="flex items-center gap-2 h-8.5 font-medium">
            <Calendar size={15} />
            Ver Agenda
          </Button>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <StatBox
            icon={<Users size={20} className="text-blue-500" />}
            label="Consultas Hoje"
            value={String(data.todayCount)}
          />
          <StatBox
            icon={<Clock size={20} className="text-orange-500" />}
            label="Aguardando confirmação"
            value={String(data.pendingConfirmationCount)}
            subtext={data.pendingConfirmationCount > 0 ? "Requerem atenção" : "Tudo confirmado"}
          />
          <StatBox
            icon={<DollarSign size={20} className="text-green-500" />}
            label="Faturamento do mês"
            value={currencyFormatter.format(data.monthRevenue)}
            subtext="Consultas realizadas"
          />
          <StatBox
            icon={<Star size={20} className="text-yellow-500" />}
            label="Avaliação Média"
            value={data.rate.average === null ? "—" : data.rate.average.toFixed(1)}
            subtext={data.rate.total === 0 ? "Nenhuma avaliação ainda" : `Baseado em ${data.rate.total} avaliações`}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5">
          <div className="lg:col-span-2 space-y-3">

            <div className="bg-surface-alt rounded-xl shadow-sm border border-divider overflow-hidden">
              <div className="p-3 border-b border-divider flex justify-between items-center">
                <div>
                  <h2 className="font-bold text-base">Próximas Consultas do Dia</h2>
                  <p className="text-xs text-text-muted">Acesso rápido aos atendimentos</p>
                </div>
                <Button size="sm" variant="ghost" className="text-primary-color font-semibold border-none hover:bg-primary/10 h-7 text-xs" onPress={() => navigate("/medico/agenda")}>
                  Ver todas
                </Button>
              </div>
              {data.upcomingAppointments.length === 0 ? (
                <p className="p-6 text-center text-sm text-text-muted">Nenhuma consulta pelo resto do dia.</p>
              ) : (
                <div className="divide-y divide-divider">
                  {data.upcomingAppointments.map((appointment) => (
                    <CompactPatientItem
                      key={appointment.id}
                      appointment={appointment}
                      onAction={() => openAppointment(appointment)}
                    />
                  ))}
                </div>
              )}
            </div>

            <WeeklyFlowCard />
          </div>

          <div className="space-y-3">
            {showTele && tele && (
              <div className="bg-primary-color p-4 rounded-xl text-white shadow-lg">
                <h3 className="font-bold text-base mb-0.5">Teleconsulta ativa</h3>
                <p className="text-xs opacity-90 mb-2.5">
                  Inicie sua sala virtual para receber o paciente <span className="font-bold">{tele.patientName}</span> às {formatTime(tele.startDateTime)}.
                </p>
                <Button size="sm" className="bg-white text-primary-color font-bold w-full shadow-md h-8 text-xs" onPress={() => navigate(`teleconsulta/${tele.meetingCode}/pre-sala`)}>
                  Abrir Sala Virtual
                </Button>
              </div>
            )}

            {data.pendingMedicalRecords && (
              <div className="bg-surface-alt p-3 rounded-xl border border-divider shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-sm flex items-center gap-1.5">
                    <FileText size={16} className="text-orange-500" />
                    Prontuários Pendentes
                  </h3>
                  {data.pendingMedicalRecords.total > 0 && (
                    <span className="bg-orange-100 text-orange-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      {data.pendingMedicalRecords.total} pendentes
                    </span>
                  )}
                </div>
                {data.pendingMedicalRecords.items.length === 0 ? (
                  <p className="text-xs text-text-muted">Nenhum prontuário pendente.</p>
                ) : (
                  <div className="space-y-1.5">
                    {data.pendingMedicalRecords.items.map((item) => (
                      <PendingDocumentItem
                        key={item.appointmentId}
                        patient={item.patientName}
                        date={formatDateTime(item.appointmentDate)}
                        onPress={() => navigate("prontuario")} // TODO: rota com o id
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

interface StatBoxProps {
  icon: ReactNode;
  label: string;
  value: string;
  subtext?: string;
}

function StatBox({ icon, label, value, subtext }: StatBoxProps) {
  return (
    <div className="bg-surface-alt p-3 rounded-xl border border-divider flex items-center gap-3 shadow-sm hover:border-gray-300 transition-all">
      <div className="p-2 bg-surface rounded-lg border border-divider shadow-sm shrink-0">{icon}</div>
      <div>
        <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider leading-none">{label}</p>
        <p className="text-xl font-bold text-text-primary my-0.5">{value}</p>
        {subtext && <p className="text-[10px] text-text-muted/80 leading-none">{subtext}</p>}
      </div>
    </div>
  );
}

interface CompactPatientItemProps {
  appointment: UpcomingAppointmentDto;
  onAction: () => void;
}

function CompactPatientItem({ appointment, onAction }: CompactPatientItemProps) {
  const isOnline = appointment.type === "Online";
  const isWaiting = appointment.status === "Scheduled";

  return (
    <div className="flex items-center justify-between py-2 px-3 hover:bg-surface/50 transition-colors">
      <div className="flex items-center gap-3">
        <div className="flex flex-col items-center justify-center bg-surface border border-divider rounded-lg h-9 w-12 text-center shrink-0">
          <span className="text-primary-color font-bold text-xs leading-none">{formatTime(appointment.startDateTime)}</span>
        </div>
        <div>
          <p className="font-semibold text-sm text-text-primary leading-tight">{appointment.patientName}</p>
          <span className="text-[10px] text-text-muted flex items-center gap-1 mt-0.5">
            <span className={`h-1.5 w-1.5 rounded-full ${isOnline ? "bg-purple-500" : "bg-blue-500"}`} />
            {appointmentTypeLabel[appointment.type]}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide hidden sm:inline-block ${
          isWaiting ? "bg-orange-100 text-orange-600" : "bg-blue-100 text-blue-600"
        }`}>
          {appointmentStatusLabel[appointment.status]}
        </span>
        <Button size="sm" variant={isOnline ? "secondary" : "primary"} onPress={onAction} className="flex items-center gap-1 h-8 text-xs px-3 font-medium">
          {isOnline ? "Atender" : "Prontuário"}
          <ArrowUpRight size={13} />
        </Button>
      </div>
    </div>
  );
}

interface PendingDocumentItemProps {
  patient: string;
  date: string;
  onPress: () => void;
}

function PendingDocumentItem({ patient, date, onPress }: PendingDocumentItemProps) {
  return (
    <button
      type="button"
      onClick={onPress}
      className="w-full text-left p-2.5 bg-surface border border-divider rounded-lg flex items-center justify-between hover:border-orange-200 cursor-pointer transition-all"
    >
      <div>
        <p className="text-sm font-medium text-text-primary leading-tight">{patient}</p>
        <p className="text-[10px] text-text-muted mt-0.5">Atendimento em: {date}</p>
      </div>
      <ChevronRight size={14} className="text-text-muted" />
    </button>
  );
}