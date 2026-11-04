import { useState, type JSX } from "react";
import { Button } from "@heroui/react";
import { CalendarClock, FlaskConical, Stethoscope, type LucideIcon } from "lucide-react";
import { MedicalRecordHistory } from "./MedicalRecordHistory";

/** Ainda não há API para exames e diagnósticos nos arquivos enviados: tipos prontos para ligar. */
export interface ExamItem {
  id: string | number;
  name: string;
  date: string;
  url?: string;
}

export interface DiagnosisItem {
  id: string | number;
  cid?: string;
  description: string;
  date: string;
}

interface ClinicalSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exams?: ExamItem[];
  diagnoses?: DiagnosisItem[];
  historyReloadKey?: unknown;
}

type TabId = "consultas" | "exames" | "diagnosticos";

const TABS: { id: TabId; label: string; icon: LucideIcon }[] = [
  { id: "consultas", label: "Consultas", icon: CalendarClock },
  { id: "exames", label: "Exames", icon: FlaskConical },
  { id: "diagnosticos", label: "Diagnósticos", icon: Stethoscope },
];

export function ClinicalSidebar({
  open,
  onOpenChange,
  exams = [],
  diagnoses = [],
  historyReloadKey,
}: ClinicalSidebarProps): JSX.Element {
  const [tab, setTab] = useState<TabId>("consultas");

  return (
    <>
      {/* Em telas pequenas a barra vira gaveta sobre o conteúdo */}
      {open && (
        <div
          aria-hidden
          className="absolute inset-0 z-10 bg-black/40 lg:hidden"
          onClick={() => onOpenChange(false)}
        />
      )}

      <aside
        id="clinical-sidebar"
        aria-label="Histórico e contexto clínico"
        className={`flex shrink-0 flex-col border-r border-border bg-surface transition-[width] duration-200 motion-reduce:transition-none max-lg:absolute max-lg:inset-y-0 max-lg:left-0 max-lg:z-20 ${
          open ? "w-80 max-lg:w-[85%]" : "w-12 max-lg:hidden"
        }`}
      >
        {/* Trilho recolhido: ícones abrem a barra já na aba escolhida */}
        {!open && (
          <div className="flex flex-col items-center gap-1 py-2">
            {TABS.map(({ id, label, icon: Icon }) => (
              <Button
                key={id}
                isIconOnly
                size="sm"
                variant="ghost"
                aria-label={`Abrir ${label}`}
                onPress={() => {
                  setTab(id);
                  onOpenChange(true);
                }}
              >
                <Icon />
              </Button>
            ))}
          </div>
        )}

        {/* Mantido montado quando recolhido para não refazer a busca ao reabrir */}
        <div className={open ? "flex min-h-0 flex-1 flex-col" : "hidden"}>
          <div role="tablist" aria-label="Contexto clínico" className="flex shrink-0 border-b border-border">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                id={`tab-${id}`}
                type="button"
                role="tab"
                aria-selected={tab === id}
                aria-controls={`panel-${id}`}
                onClick={() => setTab(id)}
                className={`flex flex-1 items-center justify-center gap-1.5 border-b-2 px-2 py-2 text-xs font-semibold focus-visible:outline-2 ${
                  tab === id
                    ? "border-primary-color text-text-primary"
                    : "border-transparent text-text-secondary hover:bg-surface-alt"
                }`}
              >
                <Icon className="size-3.5" aria-hidden />
                {label}
              </button>
            ))}
          </div>

          {/* Scroll independente: só esta área rola */}
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            <div id="panel-consultas" role="tabpanel" aria-labelledby="tab-consultas" hidden={tab !== "consultas"}>
              <MedicalRecordHistory reloadKey={historyReloadKey} />
            </div>

            <div id="panel-exames" role="tabpanel" aria-labelledby="tab-exames" hidden={tab !== "exames"}>
              {exams.length === 0 ? (
                <Empty>Nenhum exame anexado</Empty>
              ) : (
                <ul className="divide-y divide-border">
                  {exams.map((e) => (
                    <li key={e.id} className="px-3 py-2">
                      {e.url ? (
                        <a
                          href={e.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-semibold text-primary-text underline-offset-2 hover:underline"
                        >
                          {e.name}
                        </a>
                      ) : (
                        <span className="text-sm font-semibold text-text-primary">{e.name}</span>
                      )}
                      <p className="text-xs tabular-nums text-text-secondary">{e.date}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div
              id="panel-diagnosticos"
              role="tabpanel"
              aria-labelledby="tab-diagnosticos"
              hidden={tab !== "diagnosticos"}
            >
              {diagnoses.length === 0 ? (
                <Empty>Nenhum diagnóstico anterior</Empty>
              ) : (
                <ul className="divide-y divide-border">
                  {diagnoses.map((d) => (
                    <li key={d.id} className="px-3 py-2">
                      <p className="text-sm font-semibold text-text-primary">
                        {d.cid && <span className="mr-1.5 tabular-nums text-text-secondary">{d.cid}</span>}
                        {d.description}
                      </p>
                      <p className="text-xs tabular-nums text-text-secondary">{d.date}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

function Empty({ children }: { children: React.ReactNode }): JSX.Element {
  return <p className="p-4 text-center text-sm text-text-muted">{children}</p>;
}