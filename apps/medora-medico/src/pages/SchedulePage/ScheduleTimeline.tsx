import { useNavigate } from 'react-router';
import { Button, Card } from '@heroui/react';
import { Ban, Undo2, Video } from 'lucide-react';
import { TipoConsultaTag } from '../../components/Consulta/ConsultaModal';
import { MODE_CONFIG } from '../AvailabilityPage/availabilityConfig';
import { StatusBadge } from './ScheduleCard';
import { isMuted, isTeleconsultation, localTime } from './ScheduleConfig';
import {
  formatDayHeading,
  getRoomAccess,
  plural,
  type AppointmentEntry,
  type BlockedEntry,
  type DaySchedule,
  type FreeEntry,
} from './scheduleModel';

interface AppointmentRowProps {
  entry: AppointmentEntry;
  now: number;
  compact: boolean;
  onClick: (id: number) => void;
}

function AppointmentRow({ entry, now, compact, onClick }: AppointmentRowProps) {
  const navigate = useNavigate();
  const { appointment } = entry;
  const isTele = isTeleconsultation(appointment);
  const room = getRoomAccess(appointment, now);
  const showEnter = room.eligible;
  const muted = isMuted(appointment, now);

  return (
    <li>
      <div
        role="button"
        tabIndex={0}
        onClick={() => onClick(appointment.appointmentId)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick(appointment.appointmentId);
          }
        }}
        className={`flex cursor-pointer items-center gap-3 px-4 py-2.5 transition-colors hover:bg-surface-secondary ${
          muted ? 'opacity-50 grayscale hover:opacity-100 hover:grayscale-0' : ''
        }`}
      >
        <span className="w-12 shrink-0 text-base font-bold tabular-nums">{localTime(appointment)}</span>
        <span
          aria-hidden
          title={isTele ? 'Telemedicina' : 'Presencial'}
          className={`h-7 w-1 shrink-0 rounded-full ${room.open ? 'bg-success' : isTele ? 'bg-violet-500' : 'bg-teal-500'}`}
        />
        <span className="min-w-0 flex-1 truncate text-sm font-semibold" title={appointment.patientName}>
          {appointment.patientName}
        </span>

        <div className="flex shrink-0 items-center gap-1.5">
          <span className={compact ? 'hidden' : 'hidden sm:inline-flex'}>
            <TipoConsultaTag type={isTele ? 'teleconsulta' : 'presencial'} />
          </span>
          <StatusBadge status={appointment.status} />
        </div>

        {showEnter && (
          <div
            className="shrink-0"
            title={room.hint ?? undefined}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <Button
              size="sm"
              variant="primary"
              isDisabled={!room.open}
              onPress={() =>
                navigate(`/medico/teleconsulta/${appointment.appointmentId}/pre-sala`, {
                  state: { appointmentId: appointment.appointmentId, patientName: appointment.patientName },
                })
              }
            >
              <Video size={14} />
              Entrar
            </Button>
          </div>
        )}
      </div>
    </li>
  );
}

interface FreeRowProps {
  entry: FreeEntry;
  busy: boolean;
  onBlock: (entry: FreeEntry) => void;
}

function FreeRow({ entry, busy, onBlock }: FreeRowProps) {
  const mode = MODE_CONFIG[entry.type];

  return (
    <li className="flex items-center gap-3 bg-surface-secondary/30 px-4 py-2.5">
      <span className="w-12 shrink-0 text-sm font-medium tabular-nums text-fg-muted">{entry.startTime}</span>
      <span aria-hidden className="h-8 w-1 shrink-0 rounded-full border border-dashed border-ring" />

      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-1 text-sm text-fg-muted">
        <span className="font-medium text-text-secondary">Livre</span>
        <span className="tabular-nums">
          {entry.startTime} – {entry.endTime}
        </span>
        <span className="text-xs">
          {entry.count} {plural(entry.count, 'horário', 'horários')}
        </span>
        <span
          className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-medium ${mode.bgClass} ${mode.colorClass}`}
        >
          {mode.icon}
          {mode.label}
        </span>
      </div>

      <Button size="sm" variant="outline" isDisabled={busy} onPress={() => onBlock(entry)}>
        <Ban size={14} />
        Bloquear
      </Button>
    </li>
  );
}

interface BlockedRowProps {
  entry: BlockedEntry;
  busy: boolean;
  onUnblock: (entry: BlockedEntry) => void;
}

function BlockedRow({ entry, busy, onUnblock }: BlockedRowProps) {
  return (
    <li className="flex items-center gap-3 bg-danger/5 px-4 py-2.5">
      <span className="w-12 shrink-0 text-sm font-medium tabular-nums text-fg-muted line-through">
        {entry.startTime}
      </span>
      <span aria-hidden className="h-8 w-1 shrink-0 rounded-full bg-danger/40" />

      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-1 text-sm text-danger-text">
        <span className="font-medium">Bloqueado</span>
        <span className="tabular-nums">
          {entry.startTime} – {entry.endTime}
        </span>
        <span className="text-xs">
          {entry.count} {plural(entry.count, 'horário', 'horários')}
        </span>
      </div>

      <Button
        size="sm"
        variant="outline"
        // sem blockId não há como remover o bloqueio pela API
        isDisabled={busy || entry.blockId === undefined}
        onPress={() => onUnblock(entry)}
      >
        <Undo2 size={14} />
        Liberar
      </Button>
    </li>
  );
}

interface ScheduleTimelineProps {
  days: DaySchedule[];
  now: number;
  busyKey: string | null;
  onAppointmentClick: (id: number) => void;
  onBlock: (entry: FreeEntry) => void;
  onUnblock: (entry: BlockedEntry) => void;
}

export function ScheduleTimeline({
  days,
  now,
  busyKey,
  onAppointmentClick,
  onBlock,
  onUnblock,
}: ScheduleTimelineProps) {
  const multiDay = days.length > 1;

  return (
    <div className={`grid items-start gap-6 ${multiDay ? 'xl:grid-cols-2' : ''}`}>
      {days.map((day) => {
        const appointmentCount = day.entries.filter((e) => e.kind === 'appointment').length;

        return (
          <section key={day.date} className="flex min-w-0 flex-col gap-2">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="text-sm font-semibold capitalize">{formatDayHeading(day.date, now)}</h2>
              <span className="text-xs text-fg-muted">
                {appointmentCount} {plural(appointmentCount, 'consulta', 'consultas')}
              </span>
            </div>

            <Card className="overflow-hidden border border-ring bg-surface-raised p-0 shadow-md">
              <ul className="divide-y divide-ring">
                {day.entries.map((entry) => {
                  switch (entry.kind) {
                    case 'appointment':
                      return (
                        <AppointmentRow
                          key={entry.key}
                          entry={entry}
                          now={now}
                          compact={multiDay}
                          onClick={onAppointmentClick}
                        />
                      );
                    case 'free':
                      return <FreeRow key={entry.key} entry={entry} busy={busyKey === entry.key} onBlock={onBlock} />;
                    case 'blocked':
                      return (
                        <BlockedRow key={entry.key} entry={entry} busy={busyKey === entry.key} onUnblock={onUnblock} />
                      );
                  }
                })}
              </ul>
            </Card>
          </section>
        );
      })}
    </div>
  );
}