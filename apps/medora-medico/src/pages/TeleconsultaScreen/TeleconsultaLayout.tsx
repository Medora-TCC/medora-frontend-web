// pages/TeleconsultaScreen/TeleconsultaLayout.tsx
import { Outlet } from "react-router"
import { TeleconsultaGuardProvider } from "./guard/TeleconsultaGuardContext"

export function TeleconsultaLayout() {
  return (
    <TeleconsultaGuardProvider>
      <Outlet />
    </TeleconsultaGuardProvider>
  )
}