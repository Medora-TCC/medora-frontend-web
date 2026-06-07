import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"
import { useNavigate } from "react-router"
import { teleconsultaGuard, type GuardState } from "./teleconsultaGuard"
import TermoUsoModal from "../TermoUsoModal"

// REMINDER: importar PermissaoMidiaDialog quando o componente existir
// import { PermissaoMidiaDialog } from "@/components/PermissaoMidiaDialog"

// ─── Context ─────────────────────────────────────────────────────────────────

interface GuardCtx {
  state: GuardState
  tentar: (id: string) => void
}

const TeleconsultaGuardCtx = createContext<GuardCtx | null>(null)

// ─── Provider ────────────────────────────────────────────────────────────────

export function TeleconsultaGuardProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const [state, setState] = useState<GuardState>(teleconsultaGuard.getState())

  // escuta mudanças do singleton
  useEffect(() => {
  // Chamamos o subscribe e descartamos o valor de retorno (o booleano)
  const unsubscribe = teleconsultaGuard.subscribe(setState);

  // Retornamos uma função que apenas executa o unsubscribe,
  // sem passar o retorno do boolean para o useEffect
  return () => {
    unsubscribe();
  };
}, [setState]);

  // navega automaticamente quando liberado
  useEffect(() => {
    if (state.fase === "liberado") {
      navigate(`/teleconsulta/${state.consultaId}/pre-sala`)
      teleconsultaGuard.reset()
    }
  }, [state])

  const tentar = (id: string) => teleconsultaGuard.tentar(id)

  return (
    <TeleconsultaGuardCtx.Provider value={{ state, tentar }}>
      {children}

      {/* Modal de termos — flutua acima de qualquer tela */}
      <TermoUsoModal
        isOpen={state.fase === "termos_pendentes"}
        onOpenChange={() => teleconsultaGuard.reset()}
        onAccept={() =>
          state.fase === "termos_pendentes" &&
          teleconsultaGuard.aceitarTermos(state.consultaId)
        }
        onDecline={() => teleconsultaGuard.reset()}
      />

      {/* REMINDER: descomentar quando PermissaoMidiaDialog existir */}
      {/*
      <PermissaoMidiaDialog
        status={state.fase === "permissao_pendente" ? state.status : null}
        onClose={() => teleconsultaGuard.reset()}
        onRetentar={() =>
          state.fase === "permissao_pendente" &&
          teleconsultaGuard.tentar(state.consultaId)
        }
      />
      */}
    </TeleconsultaGuardCtx.Provider>
  )
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useTeleconsultaGuard() {
  const ctx = useContext(TeleconsultaGuardCtx)
  if (!ctx) {
    throw new Error(
      "useTeleconsultaGuard precisa estar dentro de <TeleconsultaGuardProvider>"
    )
  }
  return ctx
}