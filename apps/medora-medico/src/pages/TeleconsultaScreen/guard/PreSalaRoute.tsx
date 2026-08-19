import { useEffect } from "react"
import { useParams, useNavigate } from "react-router"
import { useTeleconsultaGuard } from "./TeleconsultaGuardContext"

// REMINDER: substituir pelos componentes reais quando existirem
function FullPageSpinner({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-3 bg-zinc-950">
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-zinc-400">{message}</p>
    </div>
  )
}

function AcessoNegadoScreen({ motivo, onVoltar }: { motivo: string; onVoltar: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4 bg-zinc-950">
      <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20">
        <svg className="w-7 h-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
      </div>
      <div className="text-center">
        <p className="text-white font-semibold text-base">Acesso negado</p>
        <p className="text-zinc-500 text-sm mt-1">{motivo}</p>
      </div>
      <button
        onClick={onVoltar}
        className="mt-2 px-4 py-2 rounded-lg bg-zinc-800 border border-zinc-700/50 text-sm text-zinc-300 hover:bg-zinc-700 transition-colors"
      >
        Voltar
      </button>
    </div>
  )
}

const MOTIVO_LABELS: Record<string, string> = {
  ACESSO_NAO_AUTORIZADO: "Você não tem permissão para acessar esta consulta.",
  CONSULTA_INVALIDA: "Esta consulta não existe ou foi encerrada.",
}

// ─── Rota protegida ───────────────────────────────────────────────────────────

export function PreSalaRoute() {
  const { id } = useParams<{ id: string }>()
  const { state, tentar } = useTeleconsultaGuard()
  const navigate = useNavigate()

  useEffect(() => {
    // usuário colou a URL direto → força verificação pelo guard
    if ((state.fase === "idle") && id) {
      tentar(id)
    }
  }, [])

  if (state.fase === "verificando") {
    return <FullPageSpinner message="Verificando acesso…" />
  }

  if (state.fase === "acesso_negado") {
    return (
      <AcessoNegadoScreen
        motivo={MOTIVO_LABELS[state.motivo] ?? "Acesso não autorizado."}
        onVoltar={() => navigate(-1)}
      />
    )
  }

  // termos ou mídia pendentes → provider já exibe o modal,
  // mantemos spinner enquanto aguarda resolução do usuário
  if (state.fase === "termos_pendentes" || state.fase === "permissao_pendente") {
    return <FullPageSpinner message="Aguardando confirmação…" />
  }

  // REMINDER: substituir <div> pelo componente real <PreSala consultaId={id!} />
  return (
    <div className="flex items-center justify-center h-screen bg-zinc-950">
      <p className="text-zinc-400 text-sm">PreSala — consultaId: {id}</p>
    </div>
  )
}