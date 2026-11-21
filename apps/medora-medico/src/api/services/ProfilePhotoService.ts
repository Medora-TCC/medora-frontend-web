import { isAxiosError } from "axios";
import { Endpoints } from "../enums/endpoints";
import { toDomainError } from "../errors";
import { api } from "./api";

// Foto do médico logado. A API exige login para ler, então a imagem vem como Blob (não dá para usar
// a URL direto no <img>). null quando ele ainda não enviou foto (a API responde 404).
export async function getMyPhoto(): Promise<Blob | null> {
  try {
    const response = await api.get<Blob>(Endpoints.PROFILE_PHOTO, { responseType: "blob" });
    return response.data;
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 404) return null;
    throw toDomainError(error, "Erro ao carregar a foto.");
  }
}

// a API aceita JPG ou PNG de até 5 MB e apaga de novo os metadados (EXIF/GPS) por garantia
export async function uploadMyPhoto(photo: Blob): Promise<void> {
  const form = new FormData();
  form.append("file", photo, "foto.jpg");
  try {
    await api.put(Endpoints.PROFILE_PHOTO, form, { timeout: 30_000 });
  } catch (error) {
    throw toDomainError(error, "Não foi possível enviar a foto.");
  }
}

export async function deleteMyPhoto(): Promise<void> {
  try {
    await api.delete(Endpoints.PROFILE_PHOTO);
  } catch (error) {
    throw toDomainError(error, "Não foi possível remover a foto.");
  }
}
