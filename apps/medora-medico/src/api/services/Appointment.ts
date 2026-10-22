import { isAxiosError } from "axios";
import {
  statusMapByCode,
  typeMapByCode,
  type IConsultaDetailed,
} from "@medora_web/shared";

import { api } from "../services/api";
import { Endpoints } from "../enums/endpoints";

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

function toConsulta(a: AppointmentDto): IConsultaDetailed {
  const type = typeMapByCode[a.type] ?? "outro";

  return {
    id: a.appointmentId,
    patientNome: a.patientName,
    healthInsurance: "", // a API ainda não retorna convênio
    startDateTime: a.startDateTime,
    endDateTime: a.endDateTime,
    locationAdress: type === "teleconsulta" ? "Sala Virtual" : "",
    status: statusMapByCode[a.status] ?? "agendado",
    type,
  };
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
    throw new Error("Erro ao carregar consultas");
  }
}

export async function FindConsultaDetailedById(
  id: string | number,
): Promise<IConsultaDetailed> {
  try {
    // ⚠️ Endpoint assumido: GET /appointments/{id}
    const { data } = await api.get<AppointmentDto>(
      `${Endpoints.DOCTOR_APPOINTMENTS}/${id}`,
    );
    return toConsulta(data);
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 404) {
      throw new Error("Consulta não encontrada.");
    }
    throw new Error("Erro ao carregar detalhes da consulta");
  }
}