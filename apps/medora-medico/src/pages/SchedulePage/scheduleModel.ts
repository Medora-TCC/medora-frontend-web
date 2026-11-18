import type { AvailabilitySlotType, DailyAvailabilitySlotDTO } from '@medora_web/shared';
import type {
  AppointmentStatus,
  DoctorAppointment,
  DoctorAppointmentsFilter,
} from '../../api/services/Appointments';
import { minutesOf, toDateStr } from '../AvailabilityPage/availabilityConfig';
import { canEnterRoom, localDate, localTime } from './ScheduleConfig';

export type SchedulePeriod = Extract<DoctorAppointmentsFilter, 'Today' | 'Tomorrow' | 'Week'>;

export const SCHEDULE_PERIODS: { key: SchedulePeriod; label: string }[] = [
  { key: 'Today',    label: 'Hoje' },
  { key: 'Tomorrow', label: 'Amanhã' },
  { key: 'Week',     label: 'Semana' },
];

export const DEFAULT_SCHEDULE_PERIOD: SchedulePeriod = 'Today';

export function isSchedulePeriod(value: unknown): value is SchedulePeriod {
  return SCHEDULE_PERIODS.some((period) => period.key === value);
}

const DAYS_AHEAD = 7;

export function datesForPeriod(period: SchedulePeriod, base: Date): string[] {
  const offsets =
    period === 'Today' ? [0] : period === 'Tomorrow' ? [1] : Array.from({ length: DAYS_AHEAD }, (_, i) => i);

  return offsets.map((offset) => {
    const d = new Date(base);
    d.setDate(d.getDate() + offset);
    return toDateStr(d);
  });
}

interface EntryBase {
  key: string;
  date: string;
  startMinutes: number;
}

export interface AppointmentEntry extends EntryBase {
  kind: 'appointment';
  appointment: DoctorAppointment;
}

export interface FreeEntry extends EntryBase {
  kind: 'free';
  startTime: string;
  endTime: string;
  count: number;
  type: AvailabilitySlotType;
}

export interface BlockedEntry extends EntryBase {
  kind: 'blocked';
  startTime: string;
  endTime: string;
  count: number;
  blockId: number | undefined;
}

export type TimelineEntry = AppointmentEntry | FreeEntry | BlockedEntry;

export interface DaySchedule {
  date: string;
  entries: TimelineEntry[];
}

const toIsoDate = (ddmmyyyy: string): string => {
  const [day, month, year] = ddmmyyyy.split('/');
  return `${year}-${month}-${day}`;
};

const continuesRun = (prev: DailyAvailabilitySlotDTO, next: DailyAvailabilitySlotDTO): boolean =>
  prev.status === next.status &&
  prev.endTime === next.startTime &&
  (prev.status === 'Blocked' ? prev.blockId === next.blockId : prev.type === next.type);

function toRunEntry(date: string, run: DailyAvailabilitySlotDTO[]): TimelineEntry {
  const first = run[0];
  const last = run[run.length - 1];
  const base = {
    date,
    startMinutes: minutesOf(first.startTime),
    startTime: first.startTime,
    endTime: last.endTime,
    count: run.length,
  };

  if (first.status === 'Blocked') {
    return { ...base, kind: 'blocked', key: `${date}T${first.startTime}-blocked`, blockId: first.blockId };
  }
  return { ...base, kind: 'free', key: `${date}T${first.startTime}-free`, type: first.type };
}

function buildRuns(date: string, slots: DailyAvailabilitySlotDTO[]): TimelineEntry[] {
  const sorted = [...slots].sort((a, b) => minutesOf(a.startTime) - minutesOf(b.startTime));
  const entries: TimelineEntry[] = [];
  let run: DailyAvailabilitySlotDTO[] = [];

  const flush = () => {
    if (run.length > 0) entries.push(toRunEntry(date, run));
    run = [];
  };

  for (const slot of sorted) {
    if (slot.status === 'Booked') {
      flush();
      continue;
    }
    const last = run[run.length - 1];
    if (last && !continuesRun(last, slot)) flush();
    run.push(slot);
  }
  flush();

  return entries;
}

interface BuildDaysInput {
  appointments: DoctorAppointment[];
  slotsByDate: Record<string, DailyAvailabilitySlotDTO[]>;
  now: number;
}

export function buildDays({ appointments, slotsByDate, now }: BuildDaysInput): DaySchedule[] {
  const nowDate = new Date(now);
  const today = toDateStr(nowDate);
  const nowMinutes = nowDate.getHours() * 60 + nowDate.getMinutes();

  const byDate = new Map<string, TimelineEntry[]>();
  const push = (date: string, entry: TimelineEntry) => {
    const list = byDate.get(date);
    if (list) list.push(entry);
    else byDate.set(date, [entry]);
  };

  for (const appointment of appointments) {
    if (appointment.status === 'Canceled') continue;
    const date = toIsoDate(localDate(appointment));
    push(date, {
      kind: 'appointment',
      key: `appointment-${appointment.appointmentId}`,
      date,
      startMinutes: minutesOf(localTime(appointment)),
      appointment,
    });
  }

  for (const [date, slots] of Object.entries(slotsByDate)) {
    const upcoming = date === today ? slots.filter((s) => minutesOf(s.startTime) >= nowMinutes) : slots;
    for (const entry of buildRuns(date, upcoming)) push(date, entry);
  }

  return [...byDate.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, entries]) => ({
      date,
      entries: [...entries].sort((a, b) => a.startMinutes - b.startMinutes),
    }));
}

const ACTIVE_STATUSES: AppointmentStatus[] = ['Scheduled', 'Confirmed', 'InProgress'];

export interface ScheduleStats {
  appointments: number;
  teleconsultations: number;
  toConfirm: number;
  toComplete: number;
  freeSlots: number;
}

export function computeStats(days: DaySchedule[], now: number): ScheduleStats {
  const stats: ScheduleStats = { appointments: 0, teleconsultations: 0, toConfirm: 0, toComplete: 0, freeSlots: 0 };

  for (const day of days) {
    for (const entry of day.entries) {
      if (entry.kind === 'free') {
        stats.freeSlots += entry.count;
        continue;
      }
      if (entry.kind !== 'appointment') continue;

      const { appointment } = entry;
      stats.appointments += 1;
      if (appointment.type === 'Online') stats.teleconsultations += 1;
      if (appointment.status === 'AwaitingConfirmation') stats.toConfirm += 1;
      if (isToComplete(appointment, now)) stats.toComplete += 1;
    }
  }

  return stats;
}

export const isToComplete = (a: DoctorAppointment, now: number): boolean =>
  ACTIVE_STATUSES.includes(a.status) && new Date(a.endDateTime).getTime() < now;

export const isPending = (a: DoctorAppointment, now: number): boolean =>
  a.status === 'AwaitingConfirmation'|| a.status === "Scheduled"  || isToComplete(a, now);

export function filterPending(days: DaySchedule[], now: number): DaySchedule[] {
  return days
    .map((day) => ({
      ...day,
      entries: day.entries.filter((entry) => entry.kind === 'appointment' && isPending(entry.appointment, now)),
    }))
    .filter((day) => day.entries.length > 0);
}

export const ROOM_LEAD_MINUTES = 5;

export interface RoomAccess {
  eligible: boolean;
  open: boolean;
  hint: string | null;
}

export function getRoomAccess(a: DoctorAppointment, now: number): RoomAccess {
  if (!canEnterRoom(a)) return { eligible: false, open: false, hint: null };

  const opensAt = new Date(a.startDateTime).getTime() - ROOM_LEAD_MINUTES * 60_000;
  if (now >= opensAt) return { eligible: true, open: true, hint: null };

  return {
    eligible: true,
    open: false,
    hint: `A sala é liberada ${ROOM_LEAD_MINUTES} min antes da consulta (${formatMoment(opensAt)}).`,
  };
}

export const RECORDS_LEAD_MINUTES = 15;
export const RECORDS_GRACE_MINUTES = 120;

const RECORDS_STATUSES: AppointmentStatus[] = ['Scheduled', 'Confirmed', 'InProgress', 'Completed'];

export interface RecordsAccess {
  eligible: boolean;
  open: boolean;
  hint: string | null;
}

const formatMoment = (ms: number): string => {
  const d = new Date(ms);
  const date = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  const time = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  return `${date} às ${time}`;
};

export function getRecordsAccess(a: DoctorAppointment, now: number): RecordsAccess {
  if (!RECORDS_STATUSES.includes(a.status)) return { eligible: false, open: false, hint: null };

  const opensAt = new Date(a.startDateTime).getTime() - RECORDS_LEAD_MINUTES * 60_000;
  const closesAt = new Date(a.endDateTime).getTime() + RECORDS_GRACE_MINUTES * 60_000;

  if (now < opensAt) {
    return {
      eligible: true,
      open: false,
      hint: `Prontuário e receita são liberados ${RECORDS_LEAD_MINUTES} min antes da consulta (${formatMoment(opensAt)}).`,
    };
  }
  if (now > closesAt) {
    return {
      eligible: true,
      open: false,
      hint: `O acesso rápido ao prontuário e à receita encerra ${RECORDS_GRACE_MINUTES / 60} h após o fim da consulta.`,
    };
  }
  return { eligible: true, open: true, hint: null };
}

export function findNextAppointment(appointments: DoctorAppointment[], now: number): DoctorAppointment | null {
  const candidates = appointments
    .filter((a) => ACTIVE_STATUSES.includes(a.status) && new Date(a.endDateTime).getTime() > now)
    .sort((a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime());

  return candidates[0] ?? null;
}

export function relativeStart(startDateTime: string, now: number): string {
  const minutes = Math.round((new Date(startDateTime).getTime() - now) / 60_000);
  if (minutes <= 0) return 'agora';
  if (minutes < 60) return `em ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `em ${hours} h` : `em ${hours} h ${rest} min`;
}

export function formatDayHeading(date: string, now: number): string {
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const text = new Date(`${date}T12:00:00`).toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  if (date === toDateStr(new Date(now))) return `Hoje · ${text}`;
  if (date === toDateStr(tomorrow)) return `Amanhã · ${text}`;
  return text;
}

export const plural = (count: number, one: string, many: string): string => (count === 1 ? one : many);