import {
  CalendarClock, Wallet, Hourglass, CheckCircle2, PlayCircle, CheckCheck, CalendarX, XCircle, UserX,
  type LucideIcon,
} from 'lucide-react';
import type {
  AppointmentStatus,
  DoctorAppointment,
  DoctorAppointmentsFilter,
} from '../../api/services/Appointments';

// ─── Paginação ────────────────────────────────────────────────────────────────
// 20 = 4 linhas completas no grid de 5 colunas (mesmo grid da tela de Consultas)
export const PAGE_SIZE = 20;

// ─── Status ───────────────────────────────────────────────────────────────────
export const STATUS_CFG: Record<AppointmentStatus, { label: string; badge: string; icon: LucideIcon }> = {
  Scheduled:            { label: 'Agendada',               badge: 'bg-primary/10 text-primary-text',     icon: CalendarClock },
  AwaitingPayment:      { label: 'Aguardando pagamento',   badge: 'bg-warning-subtle text-warning-text', icon: Wallet },
  AwaitingConfirmation: { label: 'Aguardando confirmação', badge: 'bg-warning-subtle text-warning-text', icon: Hourglass },
  Confirmed:            { label: 'Confirmada',             badge: 'bg-success-subtle text-success-text', icon: CheckCircle2 },
  InProgress:           { label: 'Em andamento',           badge: 'bg-primary/10 text-primary-text',     icon: PlayCircle },
  Completed:            { label: 'Realizada',              badge: 'bg-success-subtle text-success-text', icon: CheckCheck },
  RescheduleNeeded:     { label: 'Precisa remarcar',       badge: 'bg-danger-subtle text-danger-text',   icon: CalendarX },
  Canceled:             { label: 'Cancelada',              badge: 'bg-danger-subtle text-danger-text',   icon: XCircle },
  Absent:               { label: 'Ausente',                badge: 'bg-danger-subtle text-danger-text',   icon: UserX },
};

export const STATUS_ORDER = Object.keys(STATUS_CFG) as AppointmentStatus[];

// ─── Filtros ──────────────────────────────────────────────────────────────────
/** "all" = não envia `status` ao backend */
export type StatusFilterKey = 'all' | AppointmentStatus;

export const STATUS_FILTER_OPTIONS: { key: StatusFilterKey; label: string }[] = [
  { key: 'all', label: 'Todos os status' },
  ...STATUS_ORDER.map((status) => ({ key: status, label: STATUS_CFG[status].label })),
];

export const PERIOD_OPTIONS: { key: DoctorAppointmentsFilter; label: string }[] = [
  { key: 'Recent',   label: 'Recentes' },
  { key: 'Today',    label: 'Hoje' },
  { key: 'Tomorrow', label: 'Amanhã' },
  { key: 'Week',     label: 'Esta Semana' },
  { key: 'All',      label: 'Todas' },
];

export const DEFAULT_PERIOD: DoctorAppointmentsFilter = 'Recent';

export function isPeriodKey(value: unknown): value is DoctorAppointmentsFilter {
  return PERIOD_OPTIONS.some((option) => option.key === value);
}

export function isStatusFilterKey(value: unknown): value is StatusFilterKey {
  return STATUS_FILTER_OPTIONS.some((option) => option.key === value);
}

// ─── Regras de transição (espelham Appointment.cs) ───────────────────────────
export const OPEN: AppointmentStatus[] = ['Scheduled', 'Confirmed'];
// Só dá para entrar na sala de uma teleconsulta já confirmada (paga e aceita pelo médico)
export const ROOM_OPEN: AppointmentStatus[] = ['Confirmed', 'InProgress'];
export const CANCELABLE: AppointmentStatus[] = ['Scheduled', 'Confirmed', 'AwaitingPayment', 'AwaitingConfirmation'];

// ─── Helpers de exibição ──────────────────────────────────────────────────────
// localStartDateTime vem como "dd/MM/yyyy HH:mm" no fuso do médico
export const localDate = (a: DoctorAppointment): string => a.localStartDateTime.slice(0, 10);
export const localTime = (a: DoctorAppointment): string => a.localStartDateTime.slice(11, 16);

export const isTeleconsultation = (a: DoctorAppointment): boolean => a.type === 'Online';

export const canEnterRoom = (a: DoctorAppointment): boolean =>
  isTeleconsultation(a) && ROOM_OPEN.includes(a.status);

const formatBrDate = (d: Date): string =>
  d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

export function dayLabel(a: DoctorAppointment, now: number): { text: string; className: string } {
  const date = localDate(a);

  const today = new Date(now);
  if (date === formatBrDate(today)) {
    return { text: 'Hoje', className: 'font-semibold text-orange-600' };
  }

  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (date === formatBrDate(tomorrow)) {
    return { text: 'Amanhã', className: 'font-semibold text-accent' };
  }

  const [day, month, year] = date.split('/');
  const text = new Date(`${year}-${month}-${day}T12:00:00`)
    .toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' });
  return { text, className: 'text-text-secondary' };
}

// Regra única de "consulta apagada" (muted): cancelada OU já passada (tolerância de 15 min).
// Exceção: `InProgress` nunca é muted, pois já começou mas é a mais importante no momento.
export function isMuted(a: DoctorAppointment, now: number): boolean {
  if (a.status === 'Canceled') return true;
  if (a.status === 'InProgress') return false;
  return new Date(a.startDateTime).getTime() < now - 15 * 60 * 1000;
}