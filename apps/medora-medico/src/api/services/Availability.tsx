import { type AvailabilitySlotType, type DailyAvailabilitySlotDTO } from '@medora_web/shared';
import { Endpoints } from '../enums/endpoints';
import { request } from '../http';
import { type ApiDailyScheduleSlot, toDailySlotDTO } from '../mappers/availability';

export const DEFAULT_TIME_ZONE = 'America/Sao_Paulo';

export interface WeeklyShift {
  weekDay: number;
  startTime: string;
  endTime: string;
  type: AvailabilitySlotType;
}

export interface CreateRecurringScheduleBody {
  slotDurationMinutes: number;
  recurrenceStartDate: string;
  recurrenceEndDate?: string;
  timeZoneId: string;
  shifts: WeeklyShift[];
}

export interface UpdateRecurringScheduleBody {
  effectiveFrom: string;
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
  type: AvailabilitySlotType;
  recurrenceEndDate?: string;
  timeZoneId: string;
}

export interface CreateSpecificAvailabilityBody {
  date: string;
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
  type: AvailabilitySlotType;
  timeZoneId: string;
}

export interface CreateBlockBody {
  date: string;
  startTime: string;
  endTime: string;
  timeZoneId: string;
}

async function getDailySchedule(date: string): Promise<DailyAvailabilitySlotDTO[]> {
  const slots = await request<ApiDailyScheduleSlot[]>(Endpoints.DAILY_SCHEDULE, { query: { date } });

  return slots.map((slot) => toDailySlotDTO(slot, date));
}

async function createRecurringSchedule(body: CreateRecurringScheduleBody) {
  return request<{ rulesCreated: number }>(Endpoints.RECURRING_SCHEDULE, { method: 'POST', body });
}

async function updateRecurringSchedule(scheduleId: number, body: UpdateRecurringScheduleBody) {
  return request<{ newScheduleId: number; previousRuleLastDay: string | null }>(
    `${Endpoints.RECURRING_SCHEDULE}/${scheduleId}`,
    { method: 'PUT', body },
  );
}

async function createSpecificAvailability(body: CreateSpecificAvailabilityBody) {
  return request<{ scheduleId: number }>(Endpoints.SPECIFIC_AVAILABILITY, { method: 'POST', body });
}

async function createBlock(body: CreateBlockBody) {
  return request<{ blockId: number; canceledAppointments: number }>(Endpoints.SCHEDULE_BLOCKS, {
    method: 'POST',
    body,
  });
}

async function removeBlock(blockId: number) {
  return request<void>(`${Endpoints.SCHEDULE_BLOCKS}/${blockId}`, { method: 'DELETE' });
}

const AvailabilityService = {
  getDailySchedule,
  createRecurringSchedule,
  updateRecurringSchedule,
  createSpecificAvailability,
  createBlock,
  removeBlock,
};

export default AvailabilityService;
