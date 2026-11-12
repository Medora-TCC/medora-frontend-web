import { Avatar, Button, Card, Chip, Skeleton } from "@heroui/react";
import { useNavigate } from "react-router";
import { CalendarDays, FolderOpen } from "lucide-react";

import {
  formatCpf,
  formatDate,
  formatTime,
  patientInitials,
  patientMeta,
  recordStatus,
} from "./MedicalRecordHelper";
import type { MedicalRecordListDTO } from "../../api/dtos/MedicalRecord/MedicalRecordListDTO";
import { MedicalRecordModal } from "../MedicalRecordPage/MedicalRecordModal";

export function MedicalRecordRowSkeleton() {
  return (
    <Card className="rounded-md border border-border bg-surface-raised">
      <Card.Content className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="flex flex-1 items-center gap-3">
          <Skeleton className="size-10 shrink-0 rounded-full" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-3.5 w-48 rounded" />
            <Skeleton className="h-3 w-28 rounded" />
          </div>
        </div>
        <Skeleton className="h-3.5 w-32 rounded md:w-36" />
        <Skeleton className="h-3.5 w-28 rounded md:w-32" />
        <Skeleton className="h-6 w-24 rounded-full" />
        <Skeleton className="h-8 w-36 rounded-md" />
      </Card.Content>
    </Card>
  );
}

interface MedicalRecordRowProps {
  item: MedicalRecordListDTO;
}

export function MedicalRecordRow({ item }: MedicalRecordRowProps) {
  const navigate = useNavigate();
  const { patientSummary: patient, medicalRecord } = item;
  const status = recordStatus(medicalRecord);

  return (
    <Card className="rounded-md border border-border bg-surface-raised transition-colors hover:bg-surface-secondary">
      <Card.Content className="flex flex-col gap-4 md:flex-row md:items-center">
        {/* Paciente */}
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <Avatar size="md" color="accent">
            <Avatar.Fallback>{patientInitials(patient.name)}</Avatar.Fallback>
          </Avatar>
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-medium">{patient.name}</span>
            <span className="text-xs text-fg-muted">{patientMeta(patient)}</span>
          </div>
        </div>

        {/* Identificação */}
        <div className="flex flex-col md:w-40">
          <span className="text-xs text-fg-muted">CPF</span>
          <span className="text-sm tabular-nums">{formatCpf(patient.cpf)}</span>
          <span className="text-xs tabular-nums text-fg-muted">
            Prontuário #{medicalRecord.id}
          </span>
        </div>

        {/* Último atendimento */}
        <div className="flex flex-col md:w-36">
          <span className="text-xs text-fg-muted">Último atendimento</span>
          <span className="flex items-center gap-1.5 text-sm tabular-nums">
            <CalendarDays size={14} className="text-fg-muted" />
            {formatDate(medicalRecord.date)}
          </span>
          <span className="text-xs tabular-nums text-fg-muted">
            {formatTime(medicalRecord.date)}
          </span>
        </div>

        {/* Status */}
        <div className="md:w-28">
          <Chip size="sm" color={status.color} variant="soft">
            {status.label}
          </Chip>
        </div>

        {/* Ação principal — mesmo comportamento do MedicalRecordHistory */}
        <div className="md:w-44 md:text-right">
          {!medicalRecord.isFinalized ? (
            <Button
              size="sm"
              variant="primary"
              onPress={() =>
                navigate("/medico/prontuario", { state: { prontuario: medicalRecord } })
              }
              aria-label={`Continuar prontuário de ${patient.name}`}
            >
              <FolderOpen size={16} />
              Abrir prontuário
            </Button>
          ) : (
            <MedicalRecordModal medicalRecord={medicalRecord}>
              <span className="flex items-center gap-2 text-sm font-medium">
                <FolderOpen size={16} />
                Abrir prontuário
              </span>
            </MedicalRecordModal>
          )}
        </div>
      </Card.Content>
    </Card>
  );
}