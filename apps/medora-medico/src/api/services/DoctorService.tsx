import type { DoctorDashboardDto } from "../dtos/Doctors/DoctorDashboardDto";
import type { DoctorRqesDto, UpdateRqePrioritiesDto } from "../dtos/Doctors/DoctorRqesDto";
import type { PersonalDataDto, UpdateComplementaryDto, UpdateContactDto } from "../dtos/Doctors/PersonalDataDto";
import type { ProfessionalDataDto } from "../dtos/Doctors/ProfessionalRegistrationDto";
import type { RegisterDoctorDto } from "../dtos/Doctors/RegisterDoctorDto";
import type { UpdatePassportDto } from "../dtos/Doctors/PersonalDataDto";
import type { WeekFlowDto, WeekFlowPeriod } from "../dtos/Doctors/WeekFlowDto";
import { Endpoints } from "../enums/endpoints";
import { api } from "./api";
import { isAxiosError } from "axios";
import type { DoctorPublicPageDto, EducationRequestDto, ExperienceRequestDto, UpdateAboutDto } from "../dtos/Doctors/DoctorPublicPageDto";

interface RegisterResponse {
  userId: string;
  status: number;
}

export async function registerDoctor(props: RegisterDoctorDto): Promise<RegisterResponse> {
  try {
    const response = await api.post(Endpoints.REGISTER_DOCTOR, props);
    return { userId: response.data.data.id, status: response.data.data.doctorStatus };
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data?.title ?? "Erro ao cadastrar médico.");
    }
    throw new Error("Erro de conexão. Tente novamente.");
  }
}

export async function getDoctorRqes(): Promise<DoctorRqesDto> {
  try {
    const response = await api.get<DoctorRqesDto>(Endpoints.GET_DOCTOR_RQES);
  return response.data;

  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data?.title ?? "Erro ao buscar especialidades.");
    }
    throw new Error("Erro de conexão. Tente novamente.");
  }
}

export async function updateRqePriorities(body: UpdateRqePrioritiesDto): Promise<void> {
  try {
    await api.patch(Endpoints.UPDATE_RQE_PRIORITIES, body);
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data?.title ?? "Erro ao salvar especialidades.");
    }
    throw new Error("Erro de conexão. Tente novamente.");
  }
}

export async function getDashboard(): Promise<DoctorDashboardDto> {
  try {
    const response = await api.get<DoctorDashboardDto>(Endpoints.GET_DASHBOARD_DOCTOR);
    return response.data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data?.title ?? "Erro ao carregar o dashboard.");
    }
    throw new Error("Erro de conexão. Tente novamente.");
  }
}

export async function getWeekFlow(period: WeekFlowPeriod): Promise<WeekFlowDto> {
  try {
    const response = await api.get<WeekFlowDto>(Endpoints.GET_WEEK_FLOW, { params: { period } });
    return response.data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data?.title ?? "Erro ao carregar o fluxo semanal.");
    }
    throw new Error("Erro de conexão. Tente novamente.");
  }
}

export async function getProfessionalData(): Promise<ProfessionalDataDto> {
  try {
    const response = await api.get<ProfessionalDataDto>(Endpoints.GET_PROFESSIONAL_DATA);
    return response.data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data?.detail ?? error.response.data?.title ?? "Erro ao carregar dados profissionais.");
    }
    throw new Error("Erro de conexão. Tente novamente.");
  }
}

export async function getPersonalData(): Promise<PersonalDataDto> {
  try {
    const response = await api.get<PersonalDataDto>(Endpoints.GET_PERSONAL_DATA);
    return response.data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data?.detail ?? error.response.data?.title ?? "Erro ao carregar dados pessoais.");
    }
    throw new Error("Erro de conexão. Tente novamente.");
  }
}
export async function updateContact(body: UpdateContactDto): Promise<void> {
  try {
    await api.patch(Endpoints.UPDATE_DOCTOR_CONTACTS, body);
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data?.detail ?? error.response.data?.title ?? "Não foi possível salvar o contato.");
    }
    throw new Error("Erro de conexão. Tente novamente.");
  }
}

export async function updateComplementary(body: UpdateComplementaryDto): Promise<void> {
  try {
    await api.patch(Endpoints.UPDATE_DOCTOR_COMPLEMENTARY, body);
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data?.detail ?? error.response.data?.title ?? "Não foi possível salvar as informações.");
    }
    throw new Error("Erro de conexão. Tente novamente.");
  }
}

export async function updatePassport(body: UpdatePassportDto): Promise<void> {
  try {
    await api.patch(Endpoints.UPDATE_DOCTOR_PASSPORT, body);
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data?.detail ?? error.response.data?.title ?? "Não foi possível salvar o passaporte.");
    }
    throw new Error("Erro de conexão. Tente novamente.");
  }
}

export async function getMyPublicPage(): Promise<DoctorPublicPageDto> {
  try {
    const response = await api.get<DoctorPublicPageDto>(Endpoints.GET_MY_PUBLIC_PAGE);
    return response.data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data?.detail ?? error.response.data?.title ?? "Erro ao carregar o perfil público.");
    }
    throw new Error("Erro de conexão. Tente novamente.");
  }
}

export async function updateAbout(body: UpdateAboutDto): Promise<void> {
  try {
    await api.patch(Endpoints.UPDATE_ABOUT, body);
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data?.detail ?? error.response.data?.title ?? "Não foi possível salvar.");
    }
    throw new Error("Erro de conexão. Tente novamente.");
  }
}

function toServiceError(error: unknown, fallback: string): Error {
  if (isAxiosError(error) && error.response) {
    return new Error(error.response.data?.detail ?? error.response.data?.title ?? fallback);
  }
  return new Error("Erro de conexão. Tente novamente.");
}

export async function addEducation(body: EducationRequestDto): Promise<number> {
  try {
    const response = await api.post<{ id: number }>(Endpoints.EDUCATIONS, body);
    return response.data.id;
  } catch (error) {
    throw toServiceError(error, "Não foi possível adicionar a formação.");
  }
}

export async function updateEducation(id: number, body: EducationRequestDto): Promise<void> {
  try {
    await api.put(`${Endpoints.EDUCATIONS}/${id}`, body);
  } catch (error) {
    throw toServiceError(error, "Não foi possível salvar a formação.");
  }
}

export async function removeEducation(id: number): Promise<void> {
  try {
    await api.delete(`${Endpoints.EDUCATIONS}/${id}`);
  } catch (error) {
    throw toServiceError(error, "Não foi possível remover a formação.");
  }
}

export async function addExperience(body: ExperienceRequestDto): Promise<number> {
  try {
    const response = await api.post<{ id: number }>(Endpoints.EXPERIENCES, body);
    return response.data.id;
  } catch (error) {
    throw toServiceError(error, "Não foi possível adicionar a experiência.");
  }
}

export async function updateExperience(id: number, body: ExperienceRequestDto): Promise<void> {
  try {
    await api.put(`${Endpoints.EXPERIENCES}/${id}`, body);
  } catch (error) {
    throw toServiceError(error, "Não foi possível salvar a experiência.");
  }
}

export async function removeExperience(id: number): Promise<void> {
  try {
    await api.delete(`${Endpoints.EXPERIENCES}/${id}`);
  } catch (error) {
    throw toServiceError(error, "Não foi possível remover a experiência.");
  }
}