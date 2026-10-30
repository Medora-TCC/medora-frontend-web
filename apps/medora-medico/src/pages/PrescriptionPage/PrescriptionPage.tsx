import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import { Button, Spinner } from "@heroui/react";
import { PrescricaoWizard, type MedicoPrescritor } from "./PrescriptionWizard";
import MedicalRecordsService from "../../api/services/MedicalRecords";
import { getDoctorRqes } from "../../api/services/DoctorService";
import { errorMessage } from "../../api/errors";

export interface PrescriptionNavigationState {
  patientName?: string;
}

type Carregamento =
  | { tipo: "carregando" }
  | { tipo: "erro"; mensagem: string }
  | { tipo: "sem-prontuario" }
  | { tipo: "pronto"; medicalRecordId: number; medico: MedicoPrescritor };

function Aviso({ children }: { children: React.ReactNode }) {
  return (
    <section className="h-full flex flex-col items-center justify-center gap-4 p-6 text-center text-text-secondary">
      {children}
    </section>
  );
}

interface PrescricaoDaConsultaProps {
  appointmentId: number;
  patientName?: string;
  onAbrirProntuario: () => void;
  onCancelar?: () => void;
}

/** Carrega o prontuário e o médico da consulta e mostra o wizard da receita */
export function PrescricaoDaConsulta({ appointmentId, patientName, onAbrirProntuario, onCancelar }: PrescricaoDaConsultaProps) {
  const [estado, setEstado] = useState<Carregamento>({ tipo: "carregando" });

  useEffect(() => {
    let ativo = true;
    Promise.all([MedicalRecordsService.getByAppointment(appointmentId), getDoctorRqes()])
      .then(([prontuario, doctor]) => {
        if (!ativo) return;
        if (!prontuario.record) {
          setEstado({ tipo: "sem-prontuario" });
          return;
        }
        const especialidade = doctor.rqes
          .filter((r) => r.priority !== null)
          .sort((a, b) => a.priority! - b.priority!)[0]?.specialtyName;
        setEstado({
          tipo: "pronto",
          medicalRecordId: prontuario.record.id,
          medico: { nome: doctor.doctorName, especialidade },
        });
      })
      .catch((err) => ativo && setEstado({ tipo: "erro", mensagem: errorMessage(err, "Erro ao carregar a consulta.") }));

    return () => {
      ativo = false;
    };
  }, [appointmentId]);

  if (estado.tipo === "carregando") {
    return <Aviso><Spinner /></Aviso>;
  }

  if (estado.tipo === "erro") {
    return <Aviso>{estado.mensagem}</Aviso>;
  }

  if (estado.tipo === "sem-prontuario") {
    return (
      <Aviso>
        <p>Salve o prontuário desta consulta antes de emitir a receita.</p>
        <Button variant="primary" onPress={onAbrirProntuario}>
          Abrir prontuário
        </Button>
      </Aviso>
    );
  }

  return (
    <PrescricaoWizard
      medicalRecordId={estado.medicalRecordId}
      medico={estado.medico}
      patientName={patientName}
      onCancelar={onCancelar}
    />
  );
}

export function PrescriptionPage() {
  const { appointmentId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { patientName } = (location.state ?? {}) as PrescriptionNavigationState;

  const id = Number(appointmentId);
  const hasAppointment = Number.isInteger(id) && id > 0;

  if (!hasAppointment) {
    return <Aviso>Abra a receita a partir de uma consulta.</Aviso>;
  }

  return (
    <section className="h-full pt-10">
      <PrescricaoDaConsulta
        key={id}
        appointmentId={id}
        patientName={patientName}
        onAbrirProntuario={() => navigate(`/medico/prontuario/${id}`, { state: { patientName } })}
        onCancelar={() => navigate(-1)}
      />
    </section>
  );
}
