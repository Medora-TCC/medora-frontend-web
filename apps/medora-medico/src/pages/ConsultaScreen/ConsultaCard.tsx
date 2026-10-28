import type { IConsultaDetailed } from "@medora_web/shared";
import { canEnter, isHoje, isTeleConsulta, PatientInitials } from "./ConsultaHelpers";
import { useEffect, useState } from "react";
import { Avatar, Card } from "@heroui/react";
import EnterConsultaButton from "../../components/Consulta/EnterConsultaButton";
import { StatusConsultaTag, TipoConsultaTag } from "../../components/Consulta/ConsultaModal";
import { Calendar } from "lucide-react";

// CLAUDE [Card]: o TODO antigo ("ajustar o status bugado / tipo bugado") foi resolvido:
//  - STATUS: o Chip tinha `absolute top-0 right-0` mas o Card não era `relative`, então a tag
//    "flutuava" para um canto errado e ainda sumia em telas pequenas (`hidden sm:flex`). Agora
//    a tag é um item normal do fluxo, sempre visível, e usa o StatusConsultaTag do modal
//    (mesma aparência no card e no modal; o `statusCfg` local duplicado foi removido).
//  - TIPO: antes o tipo era decidido por `type === "teleconsulta"` em um lugar e por
//    `isTeleConsulta()` em outro, e não aparecia visualmente. Agora existe UMA fonte (`isTele`,
//    vinda do helper) usada para o botão, para a faixa colorida e para a tag de tipo.

interface ConsultaCardProps {
  consulta: IConsultaDetailed;
  onCardClick: (id: number) => void;
  // CLAUDE [Card]: o estilo "muted" (passada/cancelada) vive DENTRO do card, controlado por esta
  // prop. O Screen calcula `muted` (ele já tem o "agora" atualizado) e só repassa.
  muted?: boolean;
}

// CLAUDE [Card]: estados que não permitem mais entrar na sala. Antes só "finalizado" escondia o
// botão; consulta cancelada/ausente mostrava um "Entrar" desabilitado sem sentido.
const SEM_BOTAO_ENTRAR = ["finalizado", "cancelado", "ausente"];

export function ConsultaCard({ consulta, onCardClick, muted = false }: ConsultaCardProps) {
  const hoje = isHoje(consulta.startDateTime);
  const isTele = isTeleConsulta(consulta);
  const [isJoinable, setIsJoinable] = useState<boolean>(false);
  // CLAUDE [Amanhã]: "agora" como estado para decidir se a consulta é amanhã sem chamar
  // Date.now() durante a renderização (mesmo motivo do hasStarted no modal). Também vira o dia
  // sozinho: se o card ficar aberto passando da meia-noite, "Amanhã" passa a "Hoje" sem recarregar.
  const [agora, setAgora] = useState(() => Date.now());

  // CLAUDE [Card]: antes o `canEnter` era avaliado uma única vez, então o card ficava "travado"
  // em desabilitado mesmo chegando a hora. Agora reavalia a cada 30s (e atualiza o `agora`), então o
  // botão "Entrar" e o destaque verde acendem sozinhos. `canEnter` saiu das dependências: é uma
  // função importada e estável.
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

  // CLAUDE [Amanhã]: compara o DIA (não as 24h) da consulta com o dia de amanhã. `setDate(+1)`
  // trata virada de mês/ano corretamente. Usar "agora + 24h" erraria perto da meia-noite.
  const amanhaRef = new Date(agora);
  amanhaRef.setDate(amanhaRef.getDate() + 1);
  const amanha = !hoje && inicio.toDateString() === amanhaRef.toDateString();

  // CLAUDE [Amanhã]: o rótulo de dia agora tem 3 casos: Hoje (laranja, mais urgente),
  // Amanhã (cor de destaque do tema) e data curta para o resto. Antes "amanhã" mostrava a data.
  const rotuloDia = hoje ? "Hoje" : amanha ? "Amanhã" : data;
  const rotuloClasse = hoje
    ? "font-semibold text-orange-600"
    : amanha
      ? "font-semibold text-accent"
      : "text-text-secondary";

  const mostrarEntrar = isTele && !SEM_BOTAO_ENTRAR.includes(consulta.status);

  // CLAUDE [Card]: faixa colorida de 4px = leitura instantânea do tipo sem ler texto (violeta =
  // teleconsulta, teal = presencial, as mesmas cores das tags). Quando dá para entrar agora, vira verde.
  const faixa = isJoinable ? "bg-success" : isTele ? "bg-violet-500" : "bg-teal-500";

  return (
    <Card
      // CLAUDE [Card]: card clicável agora é acessível por teclado (role/tabIndex/Enter/Espaço).
      role="button"
      tabIndex={0}
      onClick={() => onCardClick(consulta.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onCardClick(consulta.id);
        }
      }}
      // CLAUDE [Quadrado]: voltei ao formato QUADRADO (`md:aspect-square`) como pedido, mantendo o
      // visual novo. No celular (1 coluna) um quadrado de largura total ficaria gigante, então
      // lá o card usa só uma altura mínima (`min-h-56`) e vira quadrado a partir de `md`.
      // `flex` + `Card.Content flex-1` fazem o conteúdo preencher todo o quadrado. `p-0 gap-0`
      // zera o respiro padrão para eu controlar o espaçamento em duas áreas (topo + rodapé);
      // `muted` aplica o visual apagado aqui dentro.
      className={`
        relative flex min-h-56 md:h-56 md:w-89 md:min-h-0 md:aspect-square overflow-hidden gap-0 p-0 cursor-pointer
        rounded-lg border border-ring bg-surface-raised shadow-md transition-all duration-200 hover:shadow-lg
        ${
          isJoinable
            ? "border-success/30 bg-success/5 hover:bg-success/10"
            : "hover:bg-surface-secondary"
        }
        ${muted ? "opacity-50 grayscale hover:opacity-100 hover:grayscale-0" : ""}
      `}
    >
      {/* CLAUDE [Quadrado]: como o card é vertical, a faixa colorida agora fica no TOPO (h-1,
          largura total) em vez de na lateral. */}
      <span aria-hidden className={`absolute inset-x-0 top-0 h-1 ${faixa}`} />

      <Card.Content className="flex flex-1 flex-col gap-0 p-0">
        {/* CLAUDE [Quadrado]: ÁREA SUPERIOR = identidade, centralizada e ocupando todo o espaço
            livre do quadrado (`flex-1` + `justify-center`). Avatar maior (lg), nome em destaque
            (1º nível da hierarquia, até 2 linhas) e tags de tipo e status abaixo (2º nível). */}
        <div className="flex flex-1 flex-col items-center justify-center gap-2.5 px-4 pb-3 pt-5 text-center">
          <Avatar size="lg" color="accent" className="shrink-0">
            <Avatar.Fallback>{PatientInitials(consulta.patientNome)}</Avatar.Fallback>
          </Avatar>

          <span
            className="line-clamp-2 break-words text-base font-semibold leading-tight"
            title={consulta.patientNome}
          >
            {consulta.patientNome}
          </span>

          <div className="flex flex-wrap items-center justify-center gap-1.5">
            <TipoConsultaTag type={isTele ? "teleconsulta" : "presencial"} />
            <StatusConsultaTag status={consulta.status} />
          </div>
        </div>

        {/* CLAUDE [Quadrado]: ÁREA INFERIOR = quando + ação. Rodapé com fundo tingido e borda
            superior separa "quem" de "quando". O HORÁRIO é o elemento numérico grande (text-lg
            bold, destaque logo abaixo do nome). Sem botão de entrar (presencial etc.), o
            horário fica centralizado em vez de colado à esquerda com um vazio à direita. */}
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

          {/* CLAUDE [Card]: o stopPropagation evita que clicar em "Entrar" também dispare o
              onClick do card e abra o modal junto. Também corrigi `id={consulta?.id ?? ""}`
              (string vazia em prop numérica) para `consulta.id`. */}
          {mostrarEntrar && (
            <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
              <EnterConsultaButton isJoinable={isJoinable} id={consulta.id} />
            </div>
          )}
        </div>
      </Card.Content>
    </Card>
  );
}