import type { IConsultaDetailed } from "@medora_web/shared"

//TODOs
// [ ] - Compactar a pagina para ela caber inteira em uma unica tela
// [ ] - Arrumar layout saindo para fora
// [ ] - Arrumar layout para mobile
// [ ] - Ajustar tamanho das consultas na tela de lista
// [ ] - Ajustar tamanho das consultas na tela de grid
// [ ] - Ajustar botão de entrar na tela de lista
// [ ] - Ajustar botão de entrar na tela de grid
// [ ] - Componentizar os cards do grid

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