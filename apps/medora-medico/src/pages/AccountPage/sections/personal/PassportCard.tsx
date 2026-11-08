import { useState } from "react";
import { Button, Input, Spinner } from "@heroui/react";
import { AlertTriangle, Globe, Pencil } from "lucide-react";
import { FieldWrapper } from "@medora_web/shared";
import { InfoCard, InfoGrid, InfoItem } from "../../../../components/Profile/InfoCard";
import { nativeInputClassName, selectClassName } from "../../../../components/Profile/formStyles";
import { updatePassport } from "../../../../api/services/DoctorService";
import type { ForeignerDataDto, UpdatePassportDto } from "../../../../api/dtos/Doctors/PersonalDataDto";
import { COUNTRY_OPTIONS, daysUntil, formatCountry, formatDateOnly, todayIso } from "../../../../api/mappers/personLabels";

const EXPIRING_SOON_DAYS = 90;

function toForm(foreigner: ForeignerDataDto): UpdatePassportDto {
  return {
    passportNumber: foreigner.passportNumber ?? "",
    passportIssuerCountry: foreigner.passportIssuerCountry ?? "",
    passportIssueDate: foreigner.passportIssueDate,
    passportExpirationDate: foreigner.passportExpirationDate,
  };
}

function validate(form: UpdatePassportDto): string | null {
  if (!form.passportNumber.trim()) return "Informe o número do passaporte.";
  if (!form.passportIssuerCountry) return "Selecione o país emissor.";
  if (!form.passportIssueDate || !form.passportExpirationDate) return "Informe as datas de emissão e validade.";

  const today = todayIso();
  if (form.passportIssueDate > today) return "A data de emissão não pode ser no futuro.";
  if (form.passportExpirationDate <= form.passportIssueDate) return "A validade precisa ser depois da emissão.";
  if (form.passportExpirationDate < today) return "O passaporte informado está vencido.";

  return null;
}

function ExpirationBadge({ expirationDate }: { expirationDate: string }) {
  const days = daysUntil(expirationDate);

  if (days < 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-danger-subtle text-danger-text">
        <AlertTriangle size={12} /> Vencido
      </span>
    );
  }

  if (days <= EXPIRING_SOON_DAYS) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-warning-subtle text-warning-text">
        <AlertTriangle size={12} /> Vence em {days} {days === 1 ? "dia" : "dias"}
      </span>
    );
  }

  return null;
}

interface PassportCardProps {
  foreigner: ForeignerDataDto;
  onSaved: (changes: UpdatePassportDto) => void;
}

export default function PassportCard({ foreigner, onSaved }: PassportCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<UpdatePassportDto>(() => toForm(foreigner));
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const setField = <K extends keyof UpdatePassportDto>(key: K, value: UpdatePassportDto[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const startEditing = () => {
    setForm(toForm(foreigner));
    setErrorMessage("");
    setIsEditing(true);
  };

  const handleSave = async () => {
    const validationError = validate(form);
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    const payload: UpdatePassportDto = {
      ...form,
      passportNumber: form.passportNumber.trim().toUpperCase(),
    };

    setIsSaving(true);
    setErrorMessage("");
    try {
      await updatePassport(payload);
      onSaved(payload);
      setIsEditing(false);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Não foi possível salvar o passaporte.");
    } finally {
      setIsSaving(false);
    }
  };

  const today = todayIso();

  return (
    <InfoCard
      icon={<Globe size={18} />}
      title="Passaporte"
      description="Mantenha os dados do seu passaporte atualizados."
      action={
        !isEditing && (
          <div className="flex items-center gap-2">
            <ExpirationBadge expirationDate={foreigner.passportExpirationDate} />
            <Button size="sm" variant="outline" onPress={startEditing}>
              <Pencil size={14} />
              Editar
            </Button>
          </div>
        )
      }
    >
      {!isEditing ? (
        <InfoGrid columns={3}>
          <InfoItem label="País de nascimento" value={formatCountry(foreigner.birthCountry)} />
          <InfoItem label="Data de naturalização" value={formatDateOnly(foreigner.naturalizationDate)} />
          <InfoItem label="Número do passaporte" value={foreigner.passportNumber} />
          <InfoItem label="País emissor" value={formatCountry(foreigner.passportIssuerCountry)} />
          <InfoItem label="Emissão" value={formatDateOnly(foreigner.passportIssueDate)} />
          <InfoItem label="Validade" value={formatDateOnly(foreigner.passportExpirationDate)} />
        </InfoGrid>
      ) : (
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FieldWrapper label="Número do passaporte">
              <Input
                value={form.passportNumber}
                onChange={(e) => setField("passportNumber", e.target.value.toUpperCase())}
                autoComplete="off"
              />
            </FieldWrapper>

            <FieldWrapper label="País emissor">
              <select
                value={form.passportIssuerCountry}
                onChange={(e) => setField("passportIssuerCountry", e.target.value)}
                className={selectClassName}
              >
                <option value="">Selecione</option>
                {COUNTRY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </FieldWrapper>

            <FieldWrapper label="Data de emissão">
              <input
                type="date"
                value={form.passportIssueDate}
                max={today}
                onChange={(e) => setField("passportIssueDate", e.target.value)}
                className={nativeInputClassName}
              />
            </FieldWrapper>

            <FieldWrapper label="Validade">
              <input
                type="date"
                value={form.passportExpirationDate}
                min={form.passportIssueDate > today ? form.passportIssueDate : today}
                onChange={(e) => setField("passportExpirationDate", e.target.value)}
                className={nativeInputClassName}
              />
            </FieldWrapper>
          </div>

          <p className="text-[11px] text-text-muted">
            País de nascimento e data de naturalização não podem ser alterados por aqui.
          </p>

          {errorMessage && <p className="text-xs text-danger-text">{errorMessage}</p>}

          <div className="flex justify-end gap-2">
            <Button size="sm" variant="ghost" onPress={() => setIsEditing(false)} isDisabled={isSaving}>
              Cancelar
            </Button>
            <Button size="sm" variant="primary" type="submit" isDisabled={isSaving}>
              {isSaving ? <Spinner color="current" size="sm" /> : "Salvar"}
            </Button>
          </div>
        </form>
      )}
    </InfoCard>
  );
}