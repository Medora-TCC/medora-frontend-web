import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Button, toast } from '@heroui/react';
import AvailabilityService, { DEFAULT_TIME_ZONE } from '../../api/services/Availability';
import { errorMessage } from '../../api/errors';
import { DateInput, ModeSelect, SelectField, TimeInput } from '../../pages/AvailabilityPage/AvailabilityFields';
import {
  DURATION_OPTIONS,
  type SlotMode,
  minutesOf,
  tomorrowStr,
} from '../../pages/AvailabilityPage/availabilityConfig';

export interface ShiftSummary {
  scheduleId: number;
  isRecurring: boolean;
  start: string;
  end: string;
  duration: number;
  type: SlotMode;
}

const formatDate = (date: string) => date.split('-').reverse().join('/');

const weekDayOf = (date: string) =>
  new Date(`${date}T12:00:00`).toLocaleDateString('pt-BR', { weekday: 'long' });

// O backend não aceita encerrar um turno "a partir de hoje": o mínimo é amanhã
const firstAllowedDay = (date: string) => (date > tomorrowStr() ? date : tomorrowStr());

function shiftError(start: string, end: string, duration: number): string | null {
  if (start >= end) return 'O horário final deve ser maior que o inicial.';
  if ((minutesOf(end) - minutesOf(start)) % duration !== 0)
    return `O turno deve ser múltiplo de ${duration} minutos.`;
  return null;
}

function ModalFrame({
  title,
  subtitle,
  onClose,
  children,
  footer,
}: Readonly<{
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
  footer: React.ReactNode;
}>) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-surface rounded-xl shadow-lg w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex justify-between items-start p-5 border-b border-border">
          <div>
            <h2 className="text-lg font-bold text-primary-text">{title}</h2>
            {subtitle && <p className="text-sm text-text-secondary mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-2 text-text-muted hover:text-danger hover:bg-danger-subtle rounded-full transition-colors"
            aria-label="Fechar"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 flex-1 overflow-y-auto space-y-4">{children}</div>

        <div className="p-5 border-t border-border bg-surface-alt flex justify-end gap-3">{footer}</div>
      </div>
    </div>
  );
}

function Field({ label, children }: Readonly<{ label: string; children: React.ReactNode }>) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-text-secondary">{label}</span>
      {children}
    </div>
  );
}

function Footer({
  onClose,
  onConfirm,
  confirmLabel,
  saving,
  danger,
}: Readonly<{
  onClose: () => void;
  onConfirm: () => void;
  confirmLabel: string;
  saving: boolean;
  danger?: boolean;
}>) {
  return (
    <>
      <Button variant="outline" onPress={onClose} isDisabled={saving}>Cancelar</Button>
      <Button
        className={`${danger ? 'bg-danger' : 'bg-primary'} text-white font-semibold`}
        onPress={onConfirm}
        isDisabled={saving}
      >
        {confirmLabel}
      </Button>
    </>
  );
}

export function EditShiftModal({
  shift,
  date,
  onClose,
  onSaved,
}: Readonly<{
  shift: ShiftSummary;
  date: string;
  onClose: () => void;
  onSaved: () => void;
}>) {
  const [effectiveFrom, setEffectiveFrom] = useState(firstAllowedDay(date));
  const [start, setStart] = useState(shift.start);
  const [end, setEnd] = useState(shift.end);
  const [duration, setDuration] = useState(String(shift.duration));
  const [type, setType] = useState<SlotMode>(shift.type);
  const [recurrenceEndDate, setRecurrenceEndDate] = useState('');
  const [saving, setSaving] = useState(false);

  const error = shiftError(start, end, Number(duration));

  const handleSave = async () => {
    if (error) {
      toast.warning(error);
      return;
    }
    try {
      setSaving(true);
      await AvailabilityService.updateRecurringSchedule(shift.scheduleId, {
        effectiveFrom,
        startTime: start,
        endTime: end,
        slotDurationMinutes: Number(duration),
        type,
        recurrenceEndDate: recurrenceEndDate || undefined,
        timeZoneId: DEFAULT_TIME_ZONE,
      });
      toast.success(`Turno alterado a partir de ${formatDate(effectiveFrom)}.`);
      onSaved();
    } catch (err) {
      toast.danger(errorMessage(err, 'Erro ao alterar o turno.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalFrame
      title="Alterar turno"
      subtitle={`${weekDayOf(date)} · ${shift.start} às ${shift.end} · toda semana`}
      onClose={onClose}
      footer={<Footer onClose={onClose} onConfirm={handleSave} confirmLabel="Salvar alteração" saving={saving} />}
    >
      <Field label="Vale a partir de">
        <DateInput value={effectiveFrom} min={tomorrowStr()} onChange={setEffectiveFrom} />
      </Field>

      <Field label="Novo horário">
        <div className="flex items-center gap-2 flex-wrap">
          <TimeInput value={start} onChange={setStart} hasError={!!error} />
          <span className="text-xs text-text-muted">até</span>
          <TimeInput value={end} onChange={setEnd} hasError={!!error} />
          <ModeSelect value={type} onChange={setType} />
        </div>
        {error && <span className="text-xs text-danger">{error}</span>}
      </Field>

      <SelectField label="Duração da consulta" value={duration} onChange={setDuration} options={DURATION_OPTIONS} />

      <Field label="Termina em (opcional)">
        <DateInput value={recurrenceEndDate} min={effectiveFrom} onChange={setRecurrenceEndDate} />
      </Field>

      <p className="text-xs text-text-muted">
        Se houver consulta marcada que fique fora do novo horário, a alteração é recusada.
      </p>
    </ModalFrame>
  );
}

export function DeactivateShiftModal({
  shift,
  date,
  onClose,
  onSaved,
}: Readonly<{
  shift: ShiftSummary;
  date: string;
  onClose: () => void;
  onSaved: () => void;
}>) {
  const [effectiveFrom, setEffectiveFrom] = useState(firstAllowedDay(date));
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    try {
      setSaving(true);
      if (shift.isRecurring) {
        await AvailabilityService.deactivateRecurringSchedule(shift.scheduleId, effectiveFrom);
        toast.success(`Turno desativado a partir de ${formatDate(effectiveFrom)}.`);
      } else {
        await AvailabilityService.deactivateSpecificAvailability(shift.scheduleId);
        toast.success('Horário extra desativado.');
      }
      onSaved();
    } catch (err) {
      toast.danger(errorMessage(err, 'Erro ao desativar o turno.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalFrame
      title={shift.isRecurring ? 'Desativar turno' : 'Desativar horário extra'}
      subtitle={
        shift.isRecurring
          ? `${weekDayOf(date)} · ${shift.start} às ${shift.end} · toda semana`
          : `${formatDate(date)} · ${shift.start} às ${shift.end}`
      }
      onClose={onClose}
      footer={<Footer onClose={onClose} onConfirm={handleSave} confirmLabel="Desativar" saving={saving} danger />}
    >
      {shift.isRecurring ? (
        <>
          <Field label="Deixa de valer a partir de">
            <DateInput value={effectiveFrom} min={tomorrowStr()} onChange={setEffectiveFrom} />
          </Field>

          <p className="text-xs text-text-muted">
            Os dias anteriores continuam como estão. Se houver consulta marcada nesse turno depois da data,
            a desativação é recusada.
          </p>
        </>
      ) : (
        <p className="text-sm text-text-secondary">
          Os horários deste turno deixam de aparecer para os pacientes. Se houver consulta marcada nele,
          a desativação é recusada.
        </p>
      )}
    </ModalFrame>
  );
}

export function ExtraHoursModal({
  date,
  onClose,
  onSaved,
}: Readonly<{
  date: string;
  onClose: () => void;
  onSaved: () => void;
}>) {
  const [start, setStart] = useState('14:00');
  const [end, setEnd] = useState('18:00');
  const [duration, setDuration] = useState('30');
  const [type, setType] = useState<SlotMode>('InPerson');
  const [saving, setSaving] = useState(false);

  const error = shiftError(start, end, Number(duration));

  const handleSave = async () => {
    if (error) {
      toast.warning(error);
      return;
    }
    try {
      setSaving(true);
      await AvailabilityService.createSpecificAvailability({
        date,
        startTime: start,
        endTime: end,
        slotDurationMinutes: Number(duration),
        type,
        timeZoneId: DEFAULT_TIME_ZONE,
      });
      toast.success('Horário extra adicionado.');
      onSaved();
    } catch (err) {
      toast.danger(errorMessage(err, 'Erro ao adicionar o horário extra.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalFrame
      title="Horário extra"
      subtitle={`Só no dia ${formatDate(date)}`}
      onClose={onClose}
      footer={<Footer onClose={onClose} onConfirm={handleSave} confirmLabel="Adicionar" saving={saving} />}
    >
      <Field label="Horário">
        <div className="flex items-center gap-2 flex-wrap">
          <TimeInput value={start} onChange={setStart} hasError={!!error} />
          <span className="text-xs text-text-muted">até</span>
          <TimeInput value={end} onChange={setEnd} hasError={!!error} />
          <ModeSelect value={type} onChange={setType} />
        </div>
        {error && <span className="text-xs text-danger">{error}</span>}
      </Field>

      <SelectField label="Duração da consulta" value={duration} onChange={setDuration} options={DURATION_OPTIONS} />

      <p className="text-xs text-text-muted">
        O horário extra não pode cruzar com um turno que já existe no dia.
      </p>
    </ModalFrame>
  );
}
