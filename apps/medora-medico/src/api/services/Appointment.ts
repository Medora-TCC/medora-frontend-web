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
  status: string;
  type: string;
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

const DEFAULT_PLATFORM = "Medora";

/** Filtros do GET /appointments/doctor/me (enum DoctorAppointmentsFilter do backend). */
export type DoctorAppointmentsApiFilter =
  | "Today"
  | "Tomorrow"
  | "Week"
  | "None"


function toConsulta(a: AppointmentDto): IConsultaDetailed {
  const type = typeMapByCode[a.type] ?? "outro";

  return {
    id: a.appointmentId,
    patientNome: a.patientName,
    healthInsurance: "", // a API ainda não retorna convênio
    startDateTime: a.startDateTime,
    endDateTime: a.endDateTime,
    locationAdress: type === "teleconsulta" ? "Sala Virtual" : "", // a API não retorna endereço
    status: statusMapByCode[a.status] ?? "agendado",
    type,
    meetingUrl: a.meetingUrl ?? undefined, // API manda null, o tipo espera undefined
    platform: a.platform ?? DEFAULT_PLATFORM,
    patientTermsAccepted: false, // a API ainda não retorna o aceite dos termos
  };
}

function toFriendlyError(error: unknown, fallback: string): Error {
  if (isAxiosError(error) && error.response) {
    const { status, data } = error.response;

    if (status === 401) {
      return new Error("Sessão expirada. Faça login novamente.");
    }
    if (status === 403) {
      return new Error(
        data?.detail ??
          data?.title ??
          "Você não tem permissão para acessar estas consultas.",
      );
    }
    if (status === 404) {
      return new Error("Consulta não encontrada.");
    }
  }
  return new Error(fallback);
}

export async function fetchConsultas(filter: DoctorAppointmentsApiFilter): Promise<IConsultaDetailed[]> {
  try {
    const all: AppointmentDto[] = [];
    const pageSize = 100;
    let page = 1;
    const filterValue = filter && filter !== "None" ? filter : undefined;

    while (true) {
      const { data } = await api.get<PagedResponse<AppointmentDto>>(
        Endpoints.DOCTOR_APPOINTMENTS,
        { params: { 
            page, 
            pageSize,
            filter: filterValue} },
      );

      all.push(...data.items);

      if (all.length >= data.totalCount || data.items.length === 0) break;
      page++;
    }

    return all.map(toConsulta);
  } catch (error) {
    throw toFriendlyError(error, "Erro ao carregar consultas");
  }
}

export async function FindConsultaDetailedById(
  id: string | number,
): Promise<IConsultaDetailed> {
  try {
    const { data } = await api.get<AppointmentDto>(
      `${Endpoints.DOCTOR_APPOINTMENTS}/${id}`,
    );
    return toConsulta(data);
  } catch (error) {
    throw toFriendlyError(error, "Erro ao carregar detalhes da consulta");
  }
}