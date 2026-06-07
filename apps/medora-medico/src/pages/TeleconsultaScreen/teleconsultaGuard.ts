// features/Teleconsulta/teleconsulta.guards.ts
import { PreSalaStatus } from "@medora_web/shared"
import { enterConsulta } from "../ConsultaScreen/ConsultaHelpers"

interface CheckResult {
  status: PreSalaStatus
  bloqueios: PreSalaStatus[]
}

export async function checkPreSala(consultaId: string): Promise<CheckResult> {
  const bloqueios: PreSalaStatus[] = []

  // 1. Valida no backend (autorização + termos + consulta existe)
  try {
    await enterConsulta
  } catch (err: any) {
    if (err?.response?.data?.code === "TERMOS_CONSULTA_NAO_ACEITOS") {
      bloqueios.push(PreSalaStatus.TERMOS_PENDENTES)
    } else if (err?.response?.status === 403) {
      bloqueios.push(PreSalaStatus.ACESSO_NAO_AUTORIZADO)
    } else {
      bloqueios.push(PreSalaStatus.CONSULTA_INVALIDA)
    }
  }

  // 2. Valida permissões de mídia (só se passou na auth)
  if (bloqueios.length === 0) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      })
      stream.getTracks().forEach((t) => t.stop()) // libera imediatamente
    } catch (err: any) {
      if (err.name === "NotFoundError") {
        bloqueios.push(PreSalaStatus.SEM_DISPOSITIVO)
      } else if (err.name === "NotAllowedError") {
        // distingue câmera de microfone
        try {
          const audioOnly = await navigator.mediaDevices.getUserMedia({ audio: true })
          audioOnly.getTracks().forEach((t) => t.stop())
          bloqueios.push(PreSalaStatus.CAMERA_NEGADA)
        } catch {
          bloqueios.push(PreSalaStatus.MICROFONE_NEGADO)
        }
      }
    }
  }

  return {
    status: bloqueios[0] ?? PreSalaStatus.OK,
    bloqueios,
  }
}