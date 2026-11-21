import { useCallback, useEffect, useState } from "react";
import { Button, Spinner } from "@heroui/react";
import { AlertTriangle, Award, Clock, IdCard, Stethoscope } from "lucide-react";
import { useMainLayout } from "../../../components/MainLayout/mainLayoutContext";
import VerificationBadge from "../../../components/VerificationBadge/VerificationBadge";
import { getProfessionalData, getVerificationStatus } from "../../../api/services/DoctorService";
import type { ProfessionalDataDto } from "../../../api/dtos/Doctors/ProfessionalRegistrationDto";
import type { VerificationStatusDto } from "../../../api/dtos/Doctors/VerificationDto";
import CorrectRegistrationModal from "./CorrectRegistrationModal";

export default function ProfessionalDataSection() {
  const { doctorRqes, openSpecialtiesModal } = useMainLayout();

  const [professional, setProfessional] = useState<ProfessionalDataDto | null>(null);
  const [verification, setVerification] = useState<VerificationStatusDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [isCorrectionOpen, setIsCorrectionOpen] = useState(false);
  const [justSubmitted, setJustSubmitted] = useState(false);

  const loadProfessionalData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const [data, status] = await Promise.all([
        getProfessionalData(),
        getVerificationStatus().catch(() => null),
      ]);
      setProfessional(data);
      setVerification(status);
      if (status?.canCorrect) setJustSubmitted(false);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Erro ao carregar dados profissionais.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfessionalData();
  }, [loadProfessionalData]);

  const rqes = [...(doctorRqes?.rqes ?? [])].sort((a, b) => {
    if (a.priority === null) return 1;
    if (b.priority === null) return -1;
    return a.priority - b.priority;
  });

  const rejectionReason = verification?.rejectionReason ?? null;
  const canCorrect = verification?.canCorrect === true;
  const correctionExhausted = rejectionReason !== null && !canCorrect;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-text-primary">Dados profissionais</h2>
          <p className="text-sm text-text-secondary">
            Seus registros profissionais e as especialidades que aparecem para os pacientes.
          </p>
        </div>
        {professional && (
          <VerificationBadge
            status={professional.status}
            verificationBadge={professional.verificationBadge}
            verificationDate={professional.verificationDate}
          />
        )}
      </div>

      <div className="bg-surface-alt border border-divider rounded-xl overflow-hidden">
        <div className="flex items-center gap-2 p-4 border-b border-divider">
          <IdCard size={18} className="text-primary-color" />
          <h3 className="font-semibold text-text-primary">Registro profissional</h3>
        </div>

        {canCorrect && verification && (
          <div className="flex items-start gap-3 p-4 bg-red-50 border-b border-red-200">
            <AlertTriangle size={18} className="text-red-600 mt-0.5 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-red-800">Verificação não aprovada</p>
              <p className="text-sm text-red-700 mt-0.5 line-clamp-2">{rejectionReason}</p>
            </div>
            <Button size="sm" className="bg-primary-color text-white font-bold shrink-0" onPress={() => setIsCorrectionOpen(true)}>
              Corrigir dados
            </Button>
          </div>
        )}

        {correctionExhausted && (
          <div className="flex items-start gap-3 p-4 bg-red-50 border-b border-red-200">
            <AlertTriangle size={18} className="text-red-600 mt-0.5 shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-red-800">Verificação não aprovada</p>
              <p className="text-sm text-red-700 mt-0.5">{rejectionReason}</p>
              <p className="text-xs text-red-700 mt-1">
                Você atingiu o limite de correções. Entre em contato com o suporte.
              </p>
            </div>
          </div>
        )}

        {justSubmitted && !canCorrect && !correctionExhausted && (
          <div className="flex items-start gap-3 p-4 bg-primary-subtle border-b border-divider">
            <Clock size={18} className="text-primary-color mt-0.5 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-primary-text">Verificação em andamento</p>
              <p className="text-sm text-text-secondary mt-0.5">
                Estamos consultando o CFM (de 1 a 5 minutos). Você receberá o resultado por e-mail.
              </p>
            </div>
            <Button size="sm" variant="outline" className="shrink-0" onPress={loadProfessionalData}>
              Atualizar
            </Button>
          </div>
        )}

        {isLoading ? (
          <div className="p-6 flex justify-center"><Spinner size="sm" /></div>
        ) : errorMessage ? (
          <div className="p-6 flex flex-col items-center gap-3 text-center">
            <p className="text-sm text-danger-text flex items-center gap-1.5">
              <AlertTriangle size={14} /> {errorMessage}
            </p>
            <Button size="sm" variant="outline" onPress={loadProfessionalData}>Tentar novamente</Button>
          </div>
        ) : professional && professional.registrations.length > 0 ? (
          <ul className="divide-y divide-divider">
            {professional.registrations.map((registration) => (
              <li key={registration.id} className="flex items-center justify-between gap-4 px-4 py-3">
                <p className="text-sm font-medium text-text-primary">
                  {registration.councilType} {registration.councilNumber}
                </p>
                <span className="text-xs text-text-muted">{registration.councilState}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="p-6 text-sm text-text-muted text-center">Nenhum registro profissional encontrado.</p>
        )}

        <p className="px-4 py-3 text-xs text-text-muted border-t border-divider">
          Alterar o registro profissional exige uma nova verificação do cadastro.
        </p>
      </div>

      <div className="bg-surface-alt border border-divider rounded-xl overflow-hidden">
        <div className="flex items-center justify-between gap-4 p-4 border-b border-divider">
          <div className="flex items-center gap-2">
            <Award size={18} className="text-primary-color" />
            <h3 className="font-semibold text-text-primary">Especialidades (RQE)</h3>
          </div>
          <Button size="sm" variant="outline" onPress={openSpecialtiesModal}>
            <Stethoscope size={14} />
            Editar principais
          </Button>
        </div>

        {doctorRqes === null ? (
          <div className="p-6 flex justify-center"><Spinner size="sm" /></div>
        ) : rqes.length === 0 ? (
          <p className="p-6 text-sm text-text-muted text-center">Nenhum RQE encontrado no seu cadastro.</p>
        ) : (
          <ul className="divide-y divide-divider">
            {rqes.map((rqe) => (
              <li key={rqe.specialtyId} className="flex items-center justify-between gap-4 px-4 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">{rqe.specialtyName}</p>
                  <p className="text-xs text-text-muted">RQE {rqe.rqeCode}</p>
                </div>
                {rqe.priority !== null ? (
                  <span className="shrink-0 px-2 py-0.5 rounded-full text-[11px] font-bold bg-primary-subtle text-primary-text">
                    {rqe.priority}ª principal
                  </span>
                ) : (
                  <span className="shrink-0 text-[11px] text-text-muted">Não exibida</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {isCorrectionOpen && verification && (
        <CorrectRegistrationModal
          status={verification}
          onClose={() => setIsCorrectionOpen(false)}
          onSubmitted={() => {
            setJustSubmitted(true);
            loadProfessionalData();
          }}
        />
      )}
    </div>
  );
}