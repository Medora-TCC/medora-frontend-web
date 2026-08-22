import type {
  AvailabilitySlotStatus,
  AvailabilitySlotType,
  DailyAvailabilitySlotDTO,
} from '@medora_web/shared';

export interface ApiDailyScheduleSlot {
  scheduleId: number;
  time: string;
  startDateTime: string;
  endDateTime: string;
  status: AvailabilitySlotStatus;
  type: AvailabilitySlotType;
  patientId?: string | null;
  patientName?: string | null;
  appointmentId?: number | null;
}

export function toDailySlotDTO(slot: ApiDailyScheduleSlot, date: string): DailyAvailabilitySlotDTO {
  return {
    scheduleId: slot.scheduleId,
    slotKey: `${date}T${slot.time}`,
    startDateTime: slot.startDateTime,
    endDateTime: slot.endDateTime,
    time: slot.time,
    status: slot.status,
    type: slot.type,
    patientId: slot.patientId ?? undefined,
    patientName: slot.patientName ?? undefined,
    appointmentId: slot.appointmentId ?? undefined,
  };
}
