import type { IConsulta } from "@medora_web/shared"

export async function fetchConsultas(): Promise<IConsulta[]> {
  const res = await fetch("/api/consultas");
  if (!res.ok) throw new Error("Erro ao carregar consultas");
  return res.json();
}