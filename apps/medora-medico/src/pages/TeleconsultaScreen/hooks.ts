// hooks/useTermosConsulta.ts
import { useState } from "react"

export function useTermosConsulta() {
  const [termosAbertos, setTermosAbertos] = useState(false)
  const [loading, setLoading] = useState(false)

  const solicitarEntrada = () => {
    // sempre exige aceite antes de entrar
    setTermosAbertos(true)
  }

  const handleAceitar = async () => {
    setLoading(true)
    try {
      // await enterConsulta(consultaId) // abre a sala
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