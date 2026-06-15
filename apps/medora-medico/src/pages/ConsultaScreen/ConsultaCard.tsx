import type { IConsultaDetailed, StatusConsulta } from "@medora_web/shared";
import { canEnter, formatConsultaHorario, isHoje, isTeleConsulta, PatientInitials } from "./ConsultaHelpers";
import { useEffect, useState } from "react";
import { Avatar, Card, Chip } from "@heroui/react";
import EnterConsultaButton from "../../components/Consulta/EnterConsultaButton";
import { Calendar, CalendarDays } from "lucide-react";

interface ConsultaCardProps {
  consulta: IConsultaDetailed;
  onCardClick: (id: string) => void;
}

const statusCfg: Record<
  StatusConsulta,
  { label: string; color: "accent" | "success" | "default" | "danger" }
> = {
  agendado: { label: "Agendada", color: "accent" },
  em_espera: { label: "Em Espera", color: "accent" },
  em_atendimento: { label: "Em andamento", color: "success" },
  finalizado: { label: "Concluída", color: "default" },
  cancelado: { label: "Cancelada", color: "danger" },
};


export function ConsultaCard({ consulta, onCardClick }: ConsultaCardProps) {
  const cfg = statusCfg[consulta.status];
  const hoje = isHoje(consulta.startDateTime);
  const [isJoinable, setIsJoinable] = useState<boolean>(false);
  const isTeleConsultaBool = isTeleConsulta(consulta);

  useEffect(() => {
  if (isTeleConsultaBool) {
    setIsJoinable(canEnter(consulta));
  } else {
    setIsJoinable(false);
  }
}, [consulta, canEnter]);

  return (
    <Card
      onClick={() => onCardClick(consulta.id)}
      className={`
        transition-all duration-300 shadow-xl h-40 border border-ring b-2 bg-surface-raised
        ${
          isJoinable
            ? "border border-success/30 bg-success/5 hover:bg-success/10"
            : "hover:bg-surface-secondary"
        }
      `}
    >
      <Card.Content className="flex items-center justify-center flex-col gap-2">
        {/* Avatar com iniciais */}
        <Avatar size="md" color="accent">
          <Avatar.Fallback>
            {PatientInitials(consulta.patientNome)}
          </Avatar.Fallback>
        </Avatar>

        {/* Info */}
        <div className="flex flex-1 items-center min-w-0 flex-col gap-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium truncate">
              {consulta.patientNome}
            </span>

            {hoje && consulta.status === "agendado" && (
              <Chip size="sm" color="warning" variant="soft">
                hoje
              </Chip>
            )}
          </div>

          <div className="flex items-center gap-3 text-xs text-text-seconday flex-wrap">
            <span className="flex items-center gap-2">
              <Calendar size={20} className="text-text-secondary" />
              {formatConsultaHorario(consulta.startDateTime)}
            </span>
          </div>
        </div>

        {/* Badge status */}
        <Chip
          size="sm"
          color={cfg.color}
          variant="soft"
          className="hidden sm:flex shrink-0 absolute top-0 right-0 m-5"
        >
          {cfg.label}
        </Chip>
        {consulta?.type === "teleconsulta" && consulta?.status !== "finalizado"  &&(
          <EnterConsultaButton
            isJoinable={isJoinable}
            id={consulta?.id ?? ""}
          />
        )}
      </Card.Content>
    </Card>
  );
}
