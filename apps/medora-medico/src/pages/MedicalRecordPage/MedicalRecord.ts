import type { MedicalRecordDTO } from "../../api/dtos/MedicalRecord/MedicalRecordDTO";

export async function fetchProntuarios(): Promise<MedicalRecordDTO[]> {
  const res = await fetch("/api/prontuario");
  if (!res.ok) throw new Error("Erro ao buscar prontuários");
  return res.json();
}
