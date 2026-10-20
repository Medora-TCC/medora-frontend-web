// services/consultaService.ts
import { isAxiosError } from "axios";
import type { IConsultaDetailed, StatusConsulta } from "@medora_web/shared";

import { Endpoints } from "../enums/endpoints";
import { api } from "./api";

interface AppointmentDto {
  appointmentId: number;
  patientId: string;
  patientName: string;
  startDateTime: string;
  endDateTime: string;
  localStartDateTime: string;
  status: number;
  type: number;
  timeZoneId: string;
  meetingUrl: string | null;
  platform: string | null;
  meetingCode: string | null;
}

interface PagedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
}

// ⚠️ Confirmar os valores do enum com o backend
const statusMap: Record<number, StatusConsulta> = {
  1: "agendado",
  2: "em_espera",
  3: "em_atendimento",
  4: "finalizado",
  5: "cancelado",
};

function toConsulta(a: AppointmentDto): IConsultaDetailed {
  return {
    id: String(a.appointmentId),
    patientNome: a.patientName,
    startDateTime: a.startDateTime,
    status: statusMap[a.status] ?? "agendado",
    patientId: a.patientId,
    endDateTime: a.endDateTime,
    localStartDateTime: a.localStartDateTime,
    timeZoneId: a.timeZoneId,
    meetingUrl: a.meetingUrl,
    platform: a.platform,
    meetingCode: a.meetingCode,
  } as IConsultaDetailed;
}

export async function fetchConsultas(): Promise<IConsultaDetailed[]> {
  try {
    const all: AppointmentDto[] = [];
    const pageSize = 100;
    let page = 1;

    while (true) {
      const { data } = await api.get<PagedResponse<AppointmentDto>>(
        Endpoints.DOCTOR_APPOINTMENTS,
        { params: { page, pageSize } },
      );

      all.push(...data.items);

      if (all.length >= data.totalCount || data.items.length === 0) break;
      page++;
    }

    return all.map(toConsulta);
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 401) {
      throw new Error("Sessão expirada. Faça login novamente.");
    }
    throw new Error("Erro ao carregar as consultas.");
  }
}