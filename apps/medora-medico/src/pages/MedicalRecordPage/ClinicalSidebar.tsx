import { useState, type JSX } from "react";
import { Button } from "@heroui/react";
import { CalendarClock, type LucideIcon } from "lucide-react";
import { MedicalRecordHistory } from "./MedicalRecordHistory";

interface ClinicalSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  historyReloadKey?: unknown;
  patientId: string | undefined;
}

type TabId = "consultas";

const TABS: { id: TabId; label: string; icon: LucideIcon }[] = [
  { id: "consultas", label: "Consultas", icon: CalendarClock },
];

export function ClinicalSidebar({
  open,
  onOpenChange,
  historyReloadKey,
  patientId
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
              <MedicalRecordHistory reloadKey={historyReloadKey} patientId={patientId}/>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}