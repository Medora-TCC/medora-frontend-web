export type AvailabilitySlotStatus = 'available' | 'scheduled' | 'confirmed' | 'completed' | 'canceled' | 'absent';
export type AvailabilitySlotType = 'inPerson' | 'online' | 'any';

export interface DailyAvailabilitySlotDTO {
  id: string; 
  startDateTime: string;
  endDateTime: string;
  time: string; 
  status: AvailabilitySlotStatus;
  type: AvailabilitySlotType;
  patientId?: string; 
  patientName?: string;
  appointmentId?: string;
}
