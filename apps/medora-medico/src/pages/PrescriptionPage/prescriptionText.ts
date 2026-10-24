import {
  type ItemPrescricao,
  type PrescricaoRascunho,
  LABEL_VIA,
  LABEL_FREQUENCIA,
  LABEL_DURACAO,
} from "../../types/Prescritpion";

function duracao(item: ItemPrescricao): string {
  if (item.duracao === "outro" && item.duracaoCustomDias) return `${item.duracaoCustomDias} dias`;
  return LABEL_DURACAO[item.duracao];
}

function linhaItem(item: ItemPrescricao, idx: number): string {
  const { principioAtivo, concentracao, formaFarmaceutica } = item.medicamento;
  const horario = item.horario ? ` (${item.horario})` : "";

  const linhas = [
    `${idx + 1}. ${principioAtivo} ${concentracao} — ${formaFarmaceutica}`,
    `   ${item.dose}, ${LABEL_VIA[item.via]}, ${LABEL_FREQUENCIA[item.frequencia]}${horario}, ${duracao(item)}. Quantidade: ${item.quantidade}.`,
  ];
  if (item.orientacoes) linhas.push(`   ${item.orientacoes}`);

  return linhas.join("\n");
}

/** Texto que o backend imprime no PDF da receita */
export function textoDaReceita(rascunho: PrescricaoRascunho): string {
  const partes = [rascunho.itens.map(linhaItem).join("\n\n")];
  if (rascunho.observacoesGerais.trim()) partes.push(`Observações: ${rascunho.observacoesGerais.trim()}`);

  return partes.join("\n\n");
}
