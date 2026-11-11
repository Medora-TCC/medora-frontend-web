// hooks/useTermosConsulta.ts
import { useState } from "react"
import { enterConsulta } from "../ConsultaScreen/ConsultaHelpers"

export function useTermosConsulta() {
  const [termosAbertos, setTermosAbertos] = useState(false)
  const [loading, setLoading] = useState(false)

  const solicitarEntrada = () => {
    // sempre exige aceite antes de entrar
    setTermosAbertos(true)
  }

  const handleAceitar = async (meetingCode: string, navigate: any) => {
    setLoading(true)
    try {
      await enterConsulta(meetingCode, navigate) // abre a sala
    } finally {
      setLoading(false)
      setTermosAbertos(false)
    }
  }

  const handleRecusar = () => {
    setTermosAbertos(false)
  }

  return { termosAbertos, loading, solicitarEntrada, handleAceitar, handleRecusar }
}