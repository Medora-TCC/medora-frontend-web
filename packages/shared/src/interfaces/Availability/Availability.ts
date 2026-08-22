export type AvailabilitySlotStatus = 'Available' | 'Scheduled' | 'Confirmed' | 'Completed' | 'Canceled' | 'Absent';
export type AvailabilitySlotType = 'InPerson' | 'Online' | 'Any';

export interface DailyAvailabilitySlotDTO {
  scheduleId: number;
  slotKey: string;
  startDateTime: string;
  endDateTime: string;
  time: string; 
  status: AvailabilitySlotStatus;
  type: AvailabilitySlotType;
  patientId?: string; 
  patientName?: string;
  appointmentId?: number;
}
