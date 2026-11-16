import type {
  MedicalRecordDTO,
} from "../dtos/MedicalRecord/MedicalRecordDTO";
import type { MedicalRecordListDTO } from "../dtos/MedicalRecord/MedicalRecordListDTO";
import { Endpoints } from "../enums/endpoints";
import { api } from "./api";

export type MedicalRecordStatusFilter = "all" | "inProgress" | "finalized";

export interface MedicalRecordSearchParams {
  page: number;
  pageSize: number;
  name?: string;
  cpf?: string;
  status?: MedicalRecordStatusFilter;
  dateFrom?: string;
  dateTo?: string;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}

type RawMedicalRecordListItem = Omit<MedicalRecordListDTO, "medicalRecord"> & {
  medicalRecord: Omit<MedicalRecordDTO, "date"> & { date: string };
};

export async function searchMedicalRecords(
  params: MedicalRecordSearchParams,
  signal?: AbortSignal,
): Promise<PagedResult<MedicalRecordListDTO>> {
  const { data } = await api.get<PagedResult<RawMedicalRecordListItem>>(
    Endpoints.SEARCH_MEDICAL_RECORD,
    { params, signal },
  );

  return {
    ...data,
    items: data.items.map((item) => ({
      ...item,
      medicalRecord: {
        ...item.medicalRecord,
        date: new Date(item.medicalRecord.date),
      },
    })),
  };
}