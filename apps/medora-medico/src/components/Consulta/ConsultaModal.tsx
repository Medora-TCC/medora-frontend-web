import { Button, Modal, Spinner } from "@heroui/react";
import type { IConsultaDetailed } from "@medora_web/shared";
import { useEffect, useState } from "react";
import {
  Video,
  User,
  Calendar,
  Clock,
  MapPin,
  CreditCard,
  AlertCircle,
  FileText,
  Stethoscope,
  ClipboardList,
  ChevronRight,
  CheckCircle2,
  X,
} from "lucide-react";
import EnterConsultaButton from "../../components/Consulta/EnterConsultaButton";
import { FindConsultaDetailedById } from "../../pages/ConsultaScreen/Consulta";
import { canEnter } from "../../pages/ConsultaScreen/ConsultaHelpers";

interface ConsultaModalProps {
  id: string | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[10px] font-semibold tracking-widest uppercase text-text">
      {children}
    </span>
  );
}

function InfoCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl bg-surface-raised border border-ring px-4 py-3 ${className}`}
    >
      {children}
    </div>
  );
}

export default function ConsultaModal({
  id,
  isOpen,
  onOpenChange,
}: ConsultaModalProps) {
  const [currentConsulta, setCurrentConsulta] =
    useState<IConsultaDetailed | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isJoinable, setIsJoinable] = useState<boolean>(false);

  useEffect(() => {
    if (!id || !isOpen) return;

    setLoading(true);
    setError(null);
    setCurrentConsulta(null);
    setIsJoinable(false);

    FindConsultaDetailedById(id)
      .then((consulta) => {
        setCurrentConsulta(consulta);
        setIsJoinable(canEnter(consulta));
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id, isOpen]);

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <Modal.Backdrop>
        <Modal.Container>
          <Modal.Dialog className="max-w-2xl! w-full">
            {/* ── Custom Dialog Shell ── */}
            <div className="relative flex flex-col rounded-2xl bg-surface overflow-hidden max-h-[90vh]">
              {/* Header */}
              <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-ring">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-accent/10 border border-ring">
                    <Stethoscope className="w-4 h-4 text-accent" />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold tracking-widest uppercase text-text-secondary">
                      #{currentConsulta?.id ?? id ?? "—"}
                    </p>
                    <h2 className="text-lg font-bold text-text-primary leading-tight">
                      Detalhes da Consulta
                    </h2>
                  </div>
                </div>
                <button
                  onClick={() => onOpenChange(false)}
                  className="flex items-center justify-center w-8 h-8 rounded-lg text-text hover:text-surface hover:bg-text-primary hover:cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable Body */}
              <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
                {loading && (
                  <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <Spinner size="lg" />
                    <p className="text-sm text-text-primary">
                      Carregando consulta…
                    </p>
                  </div>
                )}

                {error && (
                  <div className="flex items-center gap-3 rounded-xl bg-danger/10 border border-danger-soft-hover px-4 py-3">
                    <AlertCircle className="w-4 h-4 text-danger-text shrink-0" />
                    <p className="text-sm text-danger-text">{error}</p>
                  </div>
                )}

                {currentConsulta && !loading && (
                  <>
                    {/* ── Paciente ── */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-accent-soft border border-ring">
                          <User className="w-5 h-5 text-accent" />
                        </div>
                        <div>
                          <SectionLabel>Paciente</SectionLabel>
                          <p className="text-accent font-semibold text-base leading-tight">
                            {currentConsulta.patientNome}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* ── Cronológicos + Modalidade ── */}
                    <div className="grid grid-cols-3 gap-3">
                      <InfoCard>
                        <SectionLabel>Horário</SectionLabel>
                        <div className="flex items-center gap-1.5 mt-1">
                          <Clock className="w-3.5 h-3.5 text-accent" />
                          <p className="text-sm font-semibold text-text-primary">
                            {currentConsulta.startDateTime}
                          </p>
                        </div>
                      </InfoCard>

                      <InfoCard>
                        <SectionLabel>Modalidade</SectionLabel>
                        <div className="flex items-center gap-1.5 mt-1">
                          <Video className="w-3.5 h-3.5 text-accent" />
                          <p className="text-sm font-semibold  text-text-primary">
                            {currentConsulta.type ?? "teleconsulta"}
                          </p>
                        </div>
                      </InfoCard>

                      <InfoCard>
                        <SectionLabel>Local</SectionLabel>
                        <div className="flex items-center gap-1.5 mt-1">
                          <MapPin className="w-3.5 h-3.5 text-accent" />
                          <p className="text-sm font-semibold  text-text-primary truncate">
                            {currentConsulta.locationAdress ?? "Sala Virtual"}
                          </p>
                        </div>
                      </InfoCard>
                    </div>

                    <div className="flex flex-col gap-3">
                      <InfoCard>
                        <SectionLabel>Convênio</SectionLabel>
                        <div className="flex items-center gap-1.5 mt-1">
                          <CreditCard className="w-3.5 h-3.5  text-accent" />
                          <p className="text-sm text-text-primary">
                            {currentConsulta.healthInsurance ?? "Particular"}
                          </p>
                        </div>
                      </InfoCard>
                    </div>
                  </>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-800 bg-zinc-900/80 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  {currentConsulta && (
                    <span
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                        currentConsulta.status === "finalizado"
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                          : currentConsulta.status === "em_atendimento"
                            ? "bg-blue-500/10 border-blue-500/20 text-blue-400"
                            : "bg-zinc-700/40 border-zinc-600/30 text-zinc-400"
                      }`}
                    >
                      {currentConsulta.status === "finalizado" && (
                        <CheckCircle2 className="w-3 h-3" />
                      )}
                      {currentConsulta.status}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {currentConsulta?.type === "teleconsulta" && (
                    <EnterConsultaButton
                      isJoinable={isJoinable}
                      id={currentConsulta?.id ?? ""}
                    />
                  )}
                </div>
              </div>
            </div>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
