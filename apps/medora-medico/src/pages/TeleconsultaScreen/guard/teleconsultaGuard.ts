import { PreSalaStatus } from "@medora_web/shared"

// ─── Mock helpers (remover quando API estiver pronta) ────────────────────────

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

// Simula o estado de termos aceitos em memória (por consultaId)
const termosAceitosCache = new Set<string>()

// REMINDER: substituir por api.post(`/consultas/${consultaId}/entrar`)
async function mockEntrarConsulta(consultaId: string): Promise<void> {
  await delay(600)
  if (!termosAceitosCache.has(consultaId)) {
    const err: any = new Error("Termos não aceitos")
    err.response = { status: 403, data: { code: "TERMOS_CONSULTA_NAO_ACEITOS" } }
    throw err
  }
}

// REMINDER: substituir por api.post(`/consultas/${consultaId}/termos/aceitar`)
async function mockAceitarTermos(consultaId: string): Promise<void> {
  await delay(400)
  termosAceitosCache.add(consultaId)
}

// ─── Tipos ───────────────────────────────────────────────────────────────────

export type GuardState =
  | { fase: "idle" }
  | { fase: "verificando" }
  | { fase: "termos_pendentes"; consultaId: string }
  | { fase: "permissao_pendente"; status: PreSalaStatus; consultaId: string }
  | { fase: "acesso_negado"; motivo: PreSalaStatus }
  | { fase: "liberado"; consultaId: string }

type Listener = (state: GuardState) => void

// ─── Singleton ───────────────────────────────────────────────────────────────

class TeleconsultaGuard {
  private static instance: TeleconsultaGuard
  private state: GuardState = { fase: "idle" }
  private listeners: Set<Listener> = new Set()

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
    return () => this.listeners.delete(fn)
  }

  async tentar(consultaId: string) {
    this.setState({ fase: "verificando" })

    // 1. Valida autorização e termos no backend
    try {
      await mockEntrarConsulta(consultaId) // REMINDER: trocar por api.post(`/consultas/${consultaId}/entrar`)
    } catch (err: any) {
      const code = err?.response?.data?.code
      const httpStatus = err?.response?.status

      if (code === "TERMOS_CONSULTA_NAO_ACEITOS") {
        this.setState({ fase: "termos_pendentes", consultaId })
        return
      }
      if (httpStatus === 403) {
        this.setState({ fase: "acesso_negado", motivo: PreSalaStatus.ACESSO_NAO_AUTORIZADO })
        return
      }
      this.setState({ fase: "acesso_negado", motivo: PreSalaStatus.CONSULTA_INVALIDA })
      return
    }

    // 2. Valida permissões de mídia
    const bloqueioMidia = await this.checkMidia()
    if (bloqueioMidia) {
      this.setState({ fase: "permissao_pendente", status: bloqueioMidia, consultaId })
      return
    }

    this.setState({ fase: "liberado", consultaId })
  }

  async aceitarTermos(consultaId: string) {
    await mockAceitarTermos(consultaId) // REMINDER: trocar por api.post(`/consultas/${consultaId}/termos/aceitar`)
    await this.tentar(consultaId)
  }

  reset() {
    this.setState({ fase: "idle" })
  }

  private async checkMidia(): Promise<PreSalaStatus | null> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      stream.getTracks().forEach((t) => t.stop())
      return null
    } catch (err: any) {
      if (err.name === "NotFoundError") return PreSalaStatus.SEM_DISPOSITIVO
      if (err.name === "NotAllowedError") {
        try {
          const audio = await navigator.mediaDevices.getUserMedia({ audio: true })
          audio.getTracks().forEach((t) => t.stop())
          return PreSalaStatus.CAMERA_NEGADA
        } catch {
          return PreSalaStatus.MICROFONE_NEGADO
        }
      }
      return PreSalaStatus.SEM_DISPOSITIVO
    }
  }
}

export const teleconsultaGuard = TeleconsultaGuard.getInstance()