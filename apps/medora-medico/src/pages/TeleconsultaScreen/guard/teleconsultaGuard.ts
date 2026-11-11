import { PreSalaStatus } from "@medora_web/shared"

// ─── Mock helpers (remover quando API estiver pronta) ────────────────────────

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

// REMINDER: substituir por api.post(`/consultas/${consultaId}/entrar`)
async function mockEntrarConsulta(_consultaId: string): Promise<void> {
  await delay(600)
}

// ─── Tipos ───────────────────────────────────────────────────────────────────

export type GuardState =
  | { fase: "idle" }
  | { fase: "verificando" }
  | { fase: "acesso_negado"; motivo: PreSalaStatus }
  | { fase: "liberado"; consultaId: string }

type Listener = (state: GuardState) => void

interface HttpLikeError {
  response?: { status?: number; data?: { code?: string } }
}

// ─── Singleton ───────────────────────────────────────────────────────────────

class TeleconsultaGuard {
  private static instance: TeleconsultaGuard
  private state: GuardState = { fase: "idle" }
  private listeners: Set<Listener> = new Set()
  // Incrementa a cada tentar()/reset(); respostas de tentativas antigas são descartadas
  private requestId = 0

  static getInstance() {
    if (!TeleconsultaGuard.instance) {
      TeleconsultaGuard.instance = new TeleconsultaGuard()
    }
    return TeleconsultaGuard.instance
  }

  private setState(next: GuardState) {
    this.state = next
    this.listeners.forEach((fn) => fn(next))
  }

  getState() {
    return this.state
  }

  subscribe(fn: Listener) {
    this.listeners.add(fn)
    return () => {
      this.listeners.delete(fn)
    }
  }

  async tentar(consultaId: string) {
    const myId = ++this.requestId
    this.setState({ fase: "verificando" })

    // Valida autorização no backend.
    // Permissões de câmera/microfone ficam a cargo da tela de configuração,
    // que permite entrar com apenas áudio ou apenas vídeo.
    try {
      await mockEntrarConsulta(consultaId) // REMINDER: trocar por api.post(`/consultas/${consultaId}/entrar`)
    } catch (err) {
      // Reset ou nova tentativa aconteceu enquanto aguardava: ignora
      if (myId !== this.requestId) return

      const httpStatus = (err as HttpLikeError)?.response?.status
      if (httpStatus === 403) {
        this.setState({
          fase: "acesso_negado",
          motivo: PreSalaStatus.ACESSO_NAO_AUTORIZADO,
        })
        return
      }
      this.setState({
        fase: "acesso_negado",
        motivo: PreSalaStatus.CONSULTA_INVALIDA,
      })
      return
    }

    if (myId !== this.requestId) return
    this.setState({ fase: "liberado", consultaId })
  }

  reset() {
    this.requestId++ // invalida qualquer tentar() em andamento
    this.setState({ fase: "idle" })
  }
}

export const teleconsultaGuard = TeleconsultaGuard.getInstance()