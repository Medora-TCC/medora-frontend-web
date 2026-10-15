import type {
  AvailabilitySlotStatus,
  AvailabilitySlotType,
  DailyAvailabilitySlotDTO,
} from '@medora_web/shared';

export interface ApiDailyScheduleSlot {
  scheduleId: number;
  isRecurring: boolean;
  startTime: string;
  endTime: string;
  status: AvailabilitySlotStatus;
  type: AvailabilitySlotType;
  blockId?: number | null;
}

export function toDailySlotDTO(slot: ApiDailyScheduleSlot, date: string): DailyAvailabilitySlotDTO {
  return {
    slotKey: `${date}T${slot.startTime}`,
    scheduleId: slot.scheduleId,
    isRecurring: slot.isRecurring,
    startTime: slot.startTime,
    endTime: slot.endTime,
    status: slot.status,
    type: slot.type,
    blockId: slot.blockId ?? undefined,
  };
}
