// Consulta o CEP no ViaCEP (serviço público, sem token). Só ajuda a preencher o endereço:
// quem decide as coordenadas é a API do Medora.

const TIMEOUT_MS = 6000;

export type CepLookupResult =
  | { kind: "found"; street: string; neighborhood: string; city: string; state: string }
  | { kind: "notFound" }
  | { kind: "unavailable" };

interface ViaCepResponse {
  erro?: boolean | string;
  logradouro?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
}

// `signal` cancela a consulta quando o CEP muda antes da resposta; nesse caso a promessa
// rejeita com AbortError e quem chamou ignora o resultado
export async function lookupCep(cep: string, signal: AbortSignal): Promise<CepLookupResult> {
  const timeout = new AbortController();
  const timer = setTimeout(() => timeout.abort(), TIMEOUT_MS);
  const abortOnCancel = () => timeout.abort();
  signal.addEventListener("abort", abortOnCancel);

  try {
    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`, { signal: timeout.signal });

    // o ViaCEP responde 400 para CEP mal formado
    if (response.status === 400) return { kind: "notFound" };
    if (!response.ok) return { kind: "unavailable" };

    const data = (await response.json()) as ViaCepResponse;
    // CEP com formato certo mas inexistente vem como 200 com { "erro": true } (ou "true")
    if (data.erro === true || data.erro === "true") return { kind: "notFound" };
    if (!data.localidade || !data.uf) return { kind: "unavailable" };

    return {
      kind: "found",
      street: data.logradouro?.trim() ?? "",
      neighborhood: data.bairro?.trim() ?? "",
      city: data.localidade.trim(),
      state: data.uf.trim().toUpperCase(),
    };
  } catch (error) {
    if (signal.aborted) throw error;
    // demorou demais, sem internet ou resposta inválida
    return { kind: "unavailable" };
  } finally {
    clearTimeout(timer);
    signal.removeEventListener("abort", abortOnCancel);
  }
}
