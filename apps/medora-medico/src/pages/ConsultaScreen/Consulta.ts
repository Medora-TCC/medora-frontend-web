import type { IConsultaDetailed } from "@medora_web/shared"

export async function fetchConsultas(): Promise<IConsultaDetailed[]> {
  const res = await fetch("/api/consultas");
  if (!res.ok) throw new Error("Erro ao carregar consultas");
  return res.json();
}

export async function FindConsultaDetailedById(id : string): Promise<IConsultaDetailed> {
    const res = await fetch(`/api/consultas/details/${id}`)
    if (!res.ok) throw new Error("Erro ao carregar detalhes da consulta");

    return res.json();
}