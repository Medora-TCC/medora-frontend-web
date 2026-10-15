export type AvailabilitySlotStatus = 'Available' | 'Booked' | 'Blocked';
export type AvailabilitySlotType = 'InPerson' | 'Online' | 'Any';

export interface DailyAvailabilitySlotDTO {
  slotKey: string;
  scheduleId: number;
  isRecurring: boolean;
  startTime: string;
  endTime: string;
  status: AvailabilitySlotStatus;
  type: AvailabilitySlotType;
  blockId?: number;
}
