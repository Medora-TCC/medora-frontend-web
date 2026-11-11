import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"
import { teleconsultaGuard, type GuardState } from "./teleconsultaGuard"

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