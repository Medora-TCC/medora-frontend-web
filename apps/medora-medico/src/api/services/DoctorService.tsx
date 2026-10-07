import type { DoctorRqesDto, UpdateRqePrioritiesDto } from "../dtos/Doctors/DoctorRqesDto";
import type { RegisterDoctorDto } from "../dtos/Doctors/RegisterDoctorDto";
import { Endpoints } from "../enums/endpoints";
import { api } from "./api";
import { isAxiosError } from "axios";

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
