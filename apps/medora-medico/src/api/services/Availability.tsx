import { type AvailabilitySlotType, type DailyAvailabilitySlotDTO } from '@medora_web/shared';
import { Endpoints } from '../enums/endpoints';
import { api } from './api';
import { toDomainError } from '../errors';
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
  try {
    const res = await api.get<ApiDailyScheduleSlot[]>(Endpoints.DAILY_SCHEDULE, {
      params: { date },
    });

    return res.data.map((slot) => toDailySlotDTO(slot, date));
  } catch (error) {
    throw toDomainError(error, 'Erro ao carregar a agenda do dia.');
  }
}

async function createRecurringSchedule(body: CreateRecurringScheduleBody) {
  try {
    const res = await api.post<{ rulesCreated: number }>(Endpoints.RECURRING_SCHEDULE, body);
    return res.data;
  } catch (error) {
    throw toDomainError(error, 'Erro ao salvar a disponibilidade recorrente.');
  }
}

async function updateRecurringSchedule(scheduleId: number, body: UpdateRecurringScheduleBody) {
  try {
    const res = await api.put<{ newScheduleId: number; previousRuleLastDay: string | null }>(
      `${Endpoints.RECURRING_SCHEDULE}/${scheduleId}`,
      body,
    );
    return res.data;
  } catch (error) {
    throw toDomainError(error, 'Erro ao atualizar a disponibilidade recorrente.');
  }
}

async function createSpecificAvailability(body: CreateSpecificAvailabilityBody) {
  try {
    const res = await api.post<{ scheduleId: number }>(Endpoints.SPECIFIC_AVAILABILITY, body);
    return res.data;
  } catch (error) {
    throw toDomainError(error, 'Erro ao salvar a disponibilidade avulsa.');
  }
}

async function createBlock(body: CreateBlockBody) {
  try {
    const res = await api.post<{ blockId: number; canceledAppointments: number }>(
      Endpoints.SCHEDULE_BLOCKS,
      body,
    );
    return res.data;
  } catch (error) {
    throw toDomainError(error, 'Erro ao bloquear o horário.');
  }
}

async function removeBlock(blockId: number) {
  try {
    await api.delete(`${Endpoints.SCHEDULE_BLOCKS}/${blockId}`);
  } catch (error) {
    throw toDomainError(error, 'Erro ao remover o bloqueio.');
  }
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
