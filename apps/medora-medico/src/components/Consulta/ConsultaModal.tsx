import { Button, Modal, Spinner } from "@heroui/react";
import type { IConsultaDetailed } from "@medora_web/shared";
import { useEffect, useState } from "react";
import { Video, User, Calendar, Clock, MapPin, CreditCard, AlertCircle, FileText, Stethoscope, ClipboardList, ChevronRight, CheckCircle2, X } from "lucide-react";
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
    <span className="text-[10px] font-semibold tracking-widest uppercase text-zinc-400">
      {children}
    </span>
  );
}

function InfoCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl bg-zinc-800/60 border border-zinc-700/40 px-4 py-3 ${className}`}>
      {children}
    </div>
  );
}

export default function ConsultaModal({ id, isOpen, onOpenChange }: ConsultaModalProps) {
  const [currentConsulta, setCurrentConsulta] = useState<IConsultaDetailed | null>(null);
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
          <Modal.Dialog className="!max-w-2xl w-full">
            {/* ── Custom Dialog Shell ── */}
            <div className="relative flex flex-col rounded-2xl bg-zinc-900 border border-zinc-700/50 shadow-2xl overflow-hidden max-h-[90vh]">

              {/* Header */}
              <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20">
                    <Stethoscope className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold tracking-widest uppercase text-zinc-500">
                      #{currentConsulta?.id ?? id ?? "—"}
                    </p>
                    <h2 className="text-lg font-bold text-white leading-tight">
                      Detalhes da Consulta
                    </h2>
                  </div>
                </div>
                <button
                  onClick={() => onOpenChange(false)}
                  className="flex items-center justify-center w-8 h-8 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable Body */}
              <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">

                {loading && (
                  <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <Spinner size="lg" />
                    <p className="text-sm text-zinc-500">Carregando consulta…</p>
                  </div>
                )}

                {error && (
                  <div className="flex items-center gap-3 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                    <p className="text-sm text-red-300">{error}</p>
                  </div>
                )}

                {currentConsulta && !loading && (
                  <>
                    {/* ── Paciente ── */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-500/15 border border-blue-500/20">
                          <User className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                          <SectionLabel>Paciente</SectionLabel>
                          <p className="text-blue-400 font-semibold text-base leading-tight hover:underline cursor-pointer">
                            {currentConsulta.pacienteNome}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* ── Cronológicos + Modalidade ── */}
                    <div className="grid grid-cols-3 gap-3">
                      <InfoCard>
                        <SectionLabel>Horário</SectionLabel>
                        <div className="flex items-center gap-1.5 mt-1">
                          <Clock className="w-3.5 h-3.5 text-zinc-400" />
                          <p className="text-sm font-semibold text-white">{currentConsulta.dataHorario}</p>
                        </div>
                      </InfoCard>

                      <InfoCard>
                        <SectionLabel>Modalidade</SectionLabel>
                        <div className="flex items-center gap-1.5 mt-1">
                          <Video className="w-3.5 h-3.5 text-blue-400" />
                          <p className="text-sm font-semibold text-white">{currentConsulta.modalidade ?? "Telemedicina"}</p>
                        </div>
                      </InfoCard>

                      <InfoCard>
                        <SectionLabel>Local</SectionLabel>
                        <div className="flex items-center gap-1.5 mt-1">
                          <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                          <p className="text-sm font-semibold text-white truncate">{currentConsulta.local ?? "Sala Virtual"}</p>
                        </div>
                      </InfoCard>
                    </div>

                    {/* ── Dados Adicionais ── */}
                    <div className="grid grid-cols-2 gap-3">
                      <InfoCard>
                        <SectionLabel>Motivo</SectionLabel>
                        <p className="text-sm text-zinc-300 mt-1 leading-snug">{currentConsulta.motivo ?? "—"}</p>
                        {currentConsulta.historicoRelevante && (
                          <>
                            <p className="text-[10px] font-semibold tracking-widest uppercase text-zinc-500 mt-2">Histórico Relevante</p>
                            <p className="text-xs text-zinc-400 mt-0.5 leading-snug">{currentConsulta.historicoRelevante}</p>
                          </>
                        )}
                      </InfoCard>

                      <div className="flex flex-col gap-3">
                        <InfoCard>
                          <SectionLabel>Convênio</SectionLabel>
                          <div className="flex items-center gap-1.5 mt-1">
                            <CreditCard className="w-3.5 h-3.5 text-zinc-400" />
                            <p className="text-sm text-zinc-300">{currentConsulta.convenio ?? "Particular"}</p>
                          </div>
                        </InfoCard>
                        <InfoCard>
                          <SectionLabel>Queixa Principal</SectionLabel>
                          <p className="text-sm text-zinc-300 mt-1 leading-snug">{currentConsulta.queixaPrincipal ?? "—"}</p>
                        </InfoCard>
                      </div>
                    </div>

                    {/* ── Resumo do Atendimento ── */}
                    {(currentConsulta.resumoClinico || currentConsulta.diagnosticos || currentConsulta.proximosPassos || currentConsulta.recomendacoes) && (
                      <div className="grid grid-cols-2 gap-3">
                        <InfoCard>
                          <div className="flex items-center gap-1.5 mb-2">
                            <ClipboardList className="w-3.5 h-3.5 text-blue-400" />
                            <SectionLabel>Resumo do Atendimento</SectionLabel>
                          </div>
                          {currentConsulta.resumoClinico && (
                            <div className="mb-2">
                              <p className="text-[10px] font-semibold tracking-widest uppercase text-zinc-500">Resumo Clínico (SOAP)</p>
                              <p className="text-xs text-zinc-300 mt-0.5 leading-snug">{currentConsulta.resumoClinico}</p>
                            </div>
                          )}
                          {currentConsulta.diagnosticos && (
                            <div className="mb-2">
                              <p className="text-[10px] font-semibold tracking-widest uppercase text-zinc-500">Diagnósticos</p>
                              <p className="text-xs text-zinc-300 mt-0.5 leading-snug">{currentConsulta.diagnosticos}</p>
                            </div>
                          )}
                          {currentConsulta.proximosPassos && (
                            <div>
                              <p className="text-[10px] font-semibold tracking-widest uppercase text-zinc-500">Próximos Passos</p>
                              <p className="text-xs text-zinc-300 mt-0.5 leading-snug">{currentConsulta.proximosPassos}</p>
                            </div>
                          )}
                        </InfoCard>

                        {currentConsulta.recomendacoes && (
                          <InfoCard>
                            <SectionLabel>Recomendações</SectionLabel>
                            <p className="text-sm text-zinc-300 mt-1 leading-snug">{currentConsulta.recomendacoes}</p>
                          </InfoCard>
                        )}
                      </div>
                    )}

                    {/* ── Documentos e Exames ── */}
                    {currentConsulta.documentos && currentConsulta.documentos.length > 0 && (
                      <div>
                        <SectionLabel>Documentos e Exames</SectionLabel>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {currentConsulta.documentos.map((doc: { id: string; nome: string }) => (
                            <button
                              key={doc.id}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700/50 hover:border-zinc-600 transition-colors text-xs text-zinc-300 hover:text-white"
                            >
                              <FileText className="w-3 h-3 text-zinc-400" />
                              {doc.nome}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-800 bg-zinc-900/80 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  {currentConsulta && (
                    <span
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                        currentConsulta.status === "Finalizado"
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                          : currentConsulta.status === "Em andamento"
                          ? "bg-blue-500/10 border-blue-500/20 text-blue-400"
                          : "bg-zinc-700/40 border-zinc-600/30 text-zinc-400"
                      }`}
                    >
                      {currentConsulta.status === "Finalizado" && (
                        <CheckCircle2 className="w-3 h-3" />
                      )}
                      {currentConsulta.status}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {currentConsulta && (
                    <>
                      <Button
                        variant="flat"
                        size="sm"
                        className="text-xs font-medium text-zinc-300 bg-zinc-800 border border-zinc-700/50 hover:bg-zinc-700"
                        endContent={<ChevronRight className="w-3 h-3" />}
                      >
                        Ver Prontuário Histórico
                      </Button>
                      <Button
                        variant="flat"
                        size="sm"
                        className="text-xs font-medium text-zinc-300 bg-zinc-800 border border-zinc-700/50 hover:bg-zinc-700"
                      >
                        Ver Resumo SOAP
                      </Button>
                    </>
                  )}

                  <EnterConsultaButton isJoinable={isJoinable} id={currentConsulta?.id ?? ""} />

                  <Button
                    size="sm"
                    className="text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white border-0"
                    onPress={() => onOpenChange(false)}
                  >
                    Fechar
                  </Button>
                </div>
              </div>
            </div>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}