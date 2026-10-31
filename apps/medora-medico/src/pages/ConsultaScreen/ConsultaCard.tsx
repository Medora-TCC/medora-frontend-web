import type { IConsultaDetailed } from "@medora_web/shared";
import { canEnter, isHoje, isTeleConsulta, PatientInitials } from "./ConsultaHelpers";
import { useEffect, useState } from "react";
import { Avatar, Card } from "@heroui/react";
import EnterConsultaButton from "../../components/Consulta/EnterConsultaButton";
import { StatusConsultaTag, TipoConsultaTag } from "../../components/Consulta/ConsultaModal";
import { Calendar } from "lucide-react";


interface ConsultaCardProps {
  consulta: IConsultaDetailed;
  onCardClick: (id: number) => void;
  muted?: boolean;
}

const SEM_BOTAO_ENTRAR = ["finalizado", "cancelado", "ausente"];

export function ConsultaCard({ consulta, onCardClick, muted = false }: ConsultaCardProps) {
  const hoje = isHoje(consulta.startDateTime);
  const isTele = isTeleConsulta(consulta);
  const [isJoinable, setIsJoinable] = useState<boolean>(false);
  const [agora, setAgora] = useState(() => Date.now());

  useEffect(() => {
    const atualizar = () => {
      setIsJoinable(isTele ? canEnter(consulta) : false);
      setAgora(Date.now());
    };
    atualizar();
    const t = setInterval(atualizar, 30_000);
    return () => clearInterval(t);
  }, [consulta, isTele]);

  const inicio = new Date(consulta.startDateTime);
  const hora = inicio.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  const data = inicio.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "2-digit" });

  const amanhaRef = new Date(agora);
  amanhaRef.setDate(amanhaRef.getDate() + 1);
  const amanha = !hoje && inicio.toDateString() === amanhaRef.toDateString();

  const rotuloDia = hoje ? "Hoje" : amanha ? "Amanhã" : data;
  const rotuloClasse = hoje
    ? "font-semibold text-orange-600"
    : amanha
      ? "font-semibold text-accent"
      : "text-text-secondary";

  const mostrarEntrar = isTele && !SEM_BOTAO_ENTRAR.includes(consulta.status);

  const faixa = isJoinable ? "bg-success" : isTele ? "bg-violet-500" : "bg-teal-500";

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={() => onCardClick(consulta.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onCardClick(consulta.id);
        }
      }}
      className={`
        relative flex min-h-56 md:h-56 md:min-w-78 md:w-89 md:min-h-0 md:aspect-square overflow-hidden gap-0 p-0 cursor-pointer
        rounded-lg border border-ring bg-surface-raised shadow-md transition-all duration-200 hover:shadow-lg
        ${
          isJoinable
            ? "border-success/30 bg-success/5 hover:bg-success/10"
            : "hover:bg-surface-secondary"
        }
        ${muted ? "opacity-50 grayscale hover:opacity-100 hover:grayscale-0" : ""}
      `}
    >
      <span aria-hidden className={`absolute inset-x-0 top-0 h-1 ${faixa}`} />

      <Card.Content className="flex flex-1 flex-col gap-0 p-0">
        <div className="flex flex-1 flex-col items-center justify-center gap-2.5 px-4 pb-3 pt-5 text-center">
          <Avatar size="lg" color="accent" className="shrink-0">
            <Avatar.Fallback>{PatientInitials(consulta.patientNome)}</Avatar.Fallback>
          </Avatar>

          <span
            className="line-clamp-2 wrap-break-word text-base font-semibold leading-tight"
            title={consulta.patientNome}
          >
            {consulta.patientNome}
          </span>

          <div className="flex flex-wrap items-center justify-center gap-1.5">
            <TipoConsultaTag type={isTele ? "teleconsulta" : "presencial"} />
            <StatusConsultaTag status={consulta.status} />
          </div>
        </div>

        <div
          className={`flex items-center gap-3 border-t border-ring bg-surface-secondary/40 px-4 py-2.5 ${
            mostrarEntrar ? "justify-between" : "justify-center"
          }`}
        >
          <div className="flex min-w-0 items-center gap-2.5">
            <Calendar size={18} className="shrink-0 text-text-secondary" aria-hidden />
            <div className="flex flex-col">
              <span className="text-lg font-bold leading-none tabular-nums">{hora}</span>
              <span className={`mt-0.5 text-[11px] capitalize ${rotuloClasse}`}>{rotuloDia}</span>
            </div>
          </div>

          {mostrarEntrar && (
            <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
              <EnterConsultaButton isJoinable={isJoinable} meetingCode={consulta.meetingCode} />
            </div>
          )}
        </div>
      </Card.Content>
    </Card>
  );
}