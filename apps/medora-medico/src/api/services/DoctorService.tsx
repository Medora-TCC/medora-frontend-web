import type { RegisterDoctorDto } from "../dtos/RegisterDoctorDto";
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