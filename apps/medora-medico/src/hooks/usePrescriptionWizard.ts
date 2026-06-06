import { useState, useCallback } from "react";
import type {
  WizardState,
  EtapaWizard,
  ItemPrescricao,
  Medicamento,
  PrescricaoRascunho,
} from "../types/Prescritpion";


const ORDEM_ETAPAS: EtapaWizard[] = ["medicamentos", "posologia", "revisao"];

const estadoInicial: WizardState = {
  etapaAtual: "medicamentos",
  etapasCompletas: [],
  rascunho: {
    paciente: null,
    itens: [],
    observacoesGerais: "",
  },
  itemEmEdicao: null,
};

export function usePrescriptionWizard() {
  const [state, setState] = useState<WizardState>(estadoInicial);

  const irParaEtapa = useCallback((etapa: EtapaWizard) => {
    setState((prev) => ({ ...prev, etapaAtual: etapa }));
  }, []);

  const avancar = useCallback(() => {
    setState((prev) => {
      const indiceAtual = ORDEM_ETAPAS.indexOf(prev.etapaAtual);
      if (indiceAtual >= ORDEM_ETAPAS.length - 1) return prev;

      const proxima = ORDEM_ETAPAS[indiceAtual + 1];
      const etapasCompletas = prev.etapasCompletas.includes(prev.etapaAtual)
        ? prev.etapasCompletas
        : [...prev.etapasCompletas, prev.etapaAtual];

      return { ...prev, etapaAtual: proxima, etapasCompletas };
    });
  }, []);

  const avancarRevisao = useCallback(() => {
    setState((prev) => {
      const indiceAtual = ORDEM_ETAPAS.indexOf(prev.etapaAtual);
      if (indiceAtual >= ORDEM_ETAPAS.length - 1) return prev;

      const proxima = ORDEM_ETAPAS[2];
      const etapasCompletas = prev.etapasCompletas.includes(prev.etapaAtual)
        ? prev.etapasCompletas
        : [...prev.etapasCompletas, prev.etapaAtual];

      return { ...prev, etapaAtual: proxima, etapasCompletas };
    });
  }, []);

  const voltar = useCallback(() => {
    setState((prev) => {
      const indiceAtual = ORDEM_ETAPAS.indexOf(prev.etapaAtual);
      if (indiceAtual <= 0) return prev;
      return { ...prev, etapaAtual: ORDEM_ETAPAS[indiceAtual - 1] };
    });
  }, []);

  const voltarInicio = useCallback(() => {
    setState((prev) => {
      const indiceAtual = ORDEM_ETAPAS.indexOf(prev.etapaAtual);
      if (indiceAtual <= 0) return prev;
      return { ...prev, etapaAtual: ORDEM_ETAPAS[0] };
    });
  }, []);

  const iniciarEdicaoMedicamento = useCallback((medicamento: Medicamento) => {
    const novoItem: ItemPrescricao = {
      id: crypto.randomUUID(),
      medicamento,
      dose: "1 comprimido",
      via: "oral",
      frequencia: "1x_dia",
      quantidade: 30,
      duracao: "continuo",
      orientacoes: "",
    };
    setState((prev) => ({
      ...prev,
      itemEmEdicao: novoItem,
      etapaAtual: "posologia",
      etapasCompletas: prev.etapasCompletas.includes("medicamentos")
        ? prev.etapasCompletas
        : [...prev.etapasCompletas, "medicamentos"],
    }));
  }, []);

  const atualizarItemEmEdicao = useCallback(
    (campos: Partial<Omit<ItemPrescricao, "id" | "medicamento">>) => {
      setState((prev) => {
        if (!prev.itemEmEdicao) return prev;
        return {
          ...prev,
          itemEmEdicao: { ...prev.itemEmEdicao, ...campos },
        };
      });
    },
    []
  );

  const confirmarItemDosage = useCallback(() => {
    setState((prev) => {
      if (!prev.itemEmEdicao) return prev;


      const itensExistentes = prev.rascunho.itens.filter(
        (i) => i.id !== prev.itemEmEdicao!.id
      );

      const rascunhoAtualizado: PrescricaoRascunho = {
        ...prev.rascunho,
        itens: [...itensExistentes, prev.itemEmEdicao],
      };

      return {
        ...prev,
        rascunho: rascunhoAtualizado,
        itemEmEdicao: null,
        etapaAtual: "medicamentos",
        etapasCompletas: prev.etapasCompletas.includes("posologia")
          ? prev.etapasCompletas
          : [...prev.etapasCompletas, "posologia"],
      };
    });
  }, []);

  const removerItem = useCallback((itemId: string) => {
    setState((prev) => ({
      ...prev,
      rascunho: {
        ...prev.rascunho,
        itens: prev.rascunho.itens.filter((i) => i.id !== itemId),
      },
    }));
  }, []);

  const editarItem = useCallback((item: ItemPrescricao) => {
    setState((prev) => ({
      ...prev,
      itemEmEdicao: item,
      etapaAtual: "posologia",
    }));
  }, []);

  const definirObservacoes = useCallback((texto: string) => {
    setState((prev) => ({
      ...prev,
      rascunho: { ...prev.rascunho, observacoesGerais: texto },
    }));
  }, []);


  const etapaValida = useCallback(
    (etapa: EtapaWizard): boolean => {
      const { rascunho } = state;
      switch (etapa) {
        case "medicamentos":
          return rascunho.itens.length > 0;
        case "posologia":
          return true;
        case "revisao":
          return (
            rascunho.itens.length > 0
          );
        default:
          return false;
      }
    },
    [state]
  );

  const podeContinuar = etapaValida(state.etapaAtual);

  return {
    state,
    avancar,
    avancarRevisao,
    voltar,
    voltarInicio,
    irParaEtapa,
    podeContinuar,
    iniciarEdicaoMedicamento,
    atualizarItemEmEdicao,
    confirmarItemPosologia: confirmarItemDosage,
    removerItem,
    editarItem,
    definirObservacoes,
  };
}