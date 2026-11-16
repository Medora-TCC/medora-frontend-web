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
    <Card className="min-h-64 rounded-md border border-border bg-surface-raised">
      <Card.Content className="flex h-full flex-col items-center gap-3">
        <Skeleton className="size-10 shrink-0 rounded-full" />
        <div className="flex w-full flex-col items-center gap-2">
          <Skeleton className="h-3.5 w-3/4 rounded" />
          <Skeleton className="h-3 w-1/3 rounded" />
        </div>
        <div className="flex w-full flex-col items-center gap-2">
          <Skeleton className="h-3 w-1/2 rounded" />
          <Skeleton className="h-3 w-2/5 rounded" />
        </div>
        <Skeleton className="mt-auto h-8 w-full rounded-md" />
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
    <Card
      className={`relative min-h-64 rounded-md border border-border bg-surface-raised transition-colors hover:bg-surface-secondary ${
        medicalRecord.isDeleted ? "opacity-60" : ""
      }`}
    >
      <Chip size="sm" color={status.color} variant="soft" className="absolute right-0 top-0 m-3">
        {status.label}
      </Chip>

      <Card.Content className="flex h-full flex-col items-center gap-3 text-center">
        {/* Paciente */}
        <Avatar size="md" color="accent">
          <Avatar.Fallback>{patientInitials(patient.name)}</Avatar.Fallback>
        </Avatar>
        <div className="flex w-full min-w-0 flex-col items-center">
          <span className="w-full truncate text-sm font-medium">{patient.name}</span>
          <span className="text-xs text-fg-muted">{patientMeta(patient)}</span>
        </div>

        <div className="flex flex-col items-center gap-1">
          <span className="text-sm tabular-nums">CPF {formatCpf(patient.cpf)}</span>
          <span className="mt-1 flex items-center gap-1.5 text-xs tabular-nums text-fg-muted">
            <CalendarDays size={14} />
            {formatDate(medicalRecord.date)} · {formatTime(medicalRecord.date)}
          </span>
        </div>

        <div className="mt-auto w-full">
          {!medicalRecord.isFinalized ? (
            <Button
              size="sm"
              variant="primary"
              className="w-full"
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
              <span className="flex items-center justify-center gap-2 text-sm font-medium">
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