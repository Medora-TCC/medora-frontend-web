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

interface GuardCtx {
  state: GuardState
  tentar: (id: string) => void
}

const TeleconsultaGuardCtx = createContext<GuardCtx | null>(null)

export function TeleconsultaGuardProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GuardState>(teleconsultaGuard.getState())

  useEffect(() => {
    const unsubscribe = teleconsultaGuard.subscribe(setState)
    return () => { unsubscribe() }
  }, [])

  const tentar = (id: string) => teleconsultaGuard.tentar(id)

  return (
    <TeleconsultaGuardCtx.Provider value={{ state, tentar }}>
      {children}

      <TermoUsoModal
        isOpen={state.fase === "termos_pendentes"}
        onOpenChange={() => teleconsultaGuard.reset()}
        onAccept={() =>
          state.fase === "termos_pendentes" &&
          teleconsultaGuard.aceitarTermos(state.consultaId)
        }
        onDecline={() => teleconsultaGuard.reset()}
        consultaId={state.fase === "termos_pendentes" ? state.consultaId : ""}
      />
    </TeleconsultaGuardCtx.Provider>
  )
}

export function useTeleconsultaGuard() {
  const ctx = useContext(TeleconsultaGuardCtx)
  if (!ctx) {
    throw new Error("useTeleconsultaGuard precisa estar dentro de <TeleconsultaGuardProvider>")
  }
  return ctx
}