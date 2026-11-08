import { useState } from "react";
import { Button, Input, Spinner } from "@heroui/react";
import { BookUser, Pencil } from "lucide-react";
import { FieldWrapper } from "@medora_web/shared";
import { InfoCard, InfoGrid, InfoItem } from "../../../../components/Profile/InfoCard";
import { nativeInputClassName, selectClassName } from "../../../../components/Profile/formStyles";
import { updateComplementary } from "../../../../api/services/DoctorService";
import type { PersonalDataDto, UpdateComplementaryDto } from "../../../../api/dtos/Doctors/PersonalDataDto";
import { BRAZIL_STATES, formatDateOnly } from "../../../../api/mappers/personLabels";

interface ComplementaryForm {
  isMotherUnknown: boolean;
  mothersName: string;
  birthCity: string;
  birthState: string;
  rg: string;
  rgIssuer: string;
  rgIssuerState: string;
  rgIssueDate: string;
}

function toForm(data: PersonalDataDto): ComplementaryForm {
  return {
    isMotherUnknown: data.isMotherUnknown ?? false,
    mothersName: data.mothersName ?? "",
    birthCity: data.birthCity ?? "",
    birthState: data.birthState ?? "",
    rg: data.rg ?? "",
    rgIssuer: data.rgIssuer ?? "",
    rgIssuerState: data.rgIssuerState ?? "",
    rgIssueDate: data.rgIssueDate ?? "",
  };
}

function validate(form: ComplementaryForm, isBrazilian: boolean): string | null {
  if (!form.birthCity.trim() && form.birthState) {
    return "Informe a cidade de nascimento junto com o estado.";
  }
  if (form.birthCity.trim() && isBrazilian && !form.birthState) {
    return "Selecione o estado de nascimento.";
  }

  const rgFields = [form.rg.trim(), form.rgIssuer.trim(), form.rgIssuerState, form.rgIssueDate];
  const filledRgFields = rgFields.filter(Boolean).length;
  if (filledRgFields > 0 && filledRgFields < rgFields.length) {
    return "Preencha todos os dados do RG ou deixe todos vazios.";
  }

  const today = new Date().toISOString().slice(0, 10);
  if (form.rgIssueDate && form.rgIssueDate > today) {
    return "A data de emissão do RG não pode ser no futuro.";
  }

  return null;
}

interface ComplementaryCardProps {
  data: PersonalDataDto;
  onSaved: (changes: UpdateComplementaryDto) => void;
}

export default function ComplementaryCard({ data, onSaved }: ComplementaryCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<ComplementaryForm>(() => toForm(data));
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const isBrazilian = data.nationality === "BR";

  const setField = <K extends keyof ComplementaryForm>(key: K, value: ComplementaryForm[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const startEditing = () => {
    setForm(toForm(data));
    setErrorMessage("");
    setIsEditing(true);
  };

  const handleSave = async () => {
    const validationError = validate(form, isBrazilian);
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    const payload: UpdateComplementaryDto = {
      isMotherUnknown: form.isMotherUnknown,
      mothersName: form.isMotherUnknown ? null : form.mothersName.trim() || null,
      birthCity: form.birthCity.trim() || null,
      birthState: form.birthState || null,
      rg: form.rg.trim() || null,
      rgIssuer: form.rgIssuer.trim() || null,
      rgIssuerState: form.rgIssuerState || null,
      rgIssueDate: form.rgIssueDate || null,
    };

    setIsSaving(true);
    setErrorMessage("");
    try {
      await updateComplementary(payload);
      onSaved(payload);
      setIsEditing(false);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Não foi possível salvar as informações.");
    } finally {
      setIsSaving(false);
    }
  };

  const mothersName = data.isMotherUnknown ? "Mãe desconhecida" : data.mothersName;
  const birthPlace = data.birthCity
    ? `${data.birthCity}${data.birthState ? ` - ${data.birthState}` : ""}`
    : null;
  const rgIssuer = [data.rgIssuer, data.rgIssuerState].filter(Boolean).join(" / ") || null;

  return (
    <InfoCard
      icon={<BookUser size={18} />}
      title="Informações complementares"
      description="Dados opcionais do seu cadastro."
      action={
        !isEditing && (
          <Button size="sm" variant="outline" onPress={startEditing}>
            <Pencil size={14} />
            Editar
          </Button>
        )
      }
    >
      {!isEditing ? (
        <InfoGrid>
          <InfoItem label="Nome da mãe" value={mothersName} />
          <InfoItem label="Local de nascimento" value={birthPlace} />
          <InfoItem label="RG" value={data.rg} />
          <InfoItem label="Órgão emissor" value={rgIssuer} />
          <InfoItem label="Emissão do RG" value={formatDateOnly(data.rgIssueDate)} />
        </InfoGrid>
      ) : (
        <form
          className="space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
        >
          <fieldset className="space-y-3">
            <legend className="text-xs font-semibold text-text-muted mb-2">Filiação</legend>
            <FieldWrapper label="Nome da mãe">
              <Input
                value={form.isMotherUnknown ? "" : form.mothersName}
                onChange={(e) => setField("mothersName", e.target.value)}
                placeholder={form.isMotherUnknown ? "Não se aplica" : "Opcional"}
                disabled={form.isMotherUnknown}
              />
            </FieldWrapper>
            <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
              <input
                type="checkbox"
                checked={form.isMotherUnknown}
                onChange={(e) => setField("isMotherUnknown", e.target.checked)}
                className="h-4 w-4 accent-[var(--primary)]"
              />
              Mãe desconhecida
            </label>
          </fieldset>

          <fieldset>
            <legend className="text-xs font-semibold text-text-muted mb-2">Naturalidade</legend>
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_120px] gap-3">
              <FieldWrapper label="Cidade de nascimento">
                <Input
                  value={form.birthCity}
                  onChange={(e) => setField("birthCity", e.target.value)}
                  placeholder="Opcional"
                />
              </FieldWrapper>
              <FieldWrapper label="Estado">
                {isBrazilian ? (
                  <select
                    value={form.birthState}
                    onChange={(e) => setField("birthState", e.target.value)}
                    className={selectClassName}
                  >
                    <option value="">—</option>
                    {BRAZIL_STATES.map((uf) => <option key={uf} value={uf}>{uf}</option>)}
                  </select>
                ) : (
                  <Input
                    value={form.birthState}
                    onChange={(e) => setField("birthState", e.target.value)}
                    placeholder="Opcional"
                  />
                )}
              </FieldWrapper>
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-xs font-semibold text-text-muted mb-2">RG</legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FieldWrapper label="Número">
                <Input value={form.rg} onChange={(e) => setField("rg", e.target.value)} />
              </FieldWrapper>
              <FieldWrapper label="Órgão emissor">
                <Input
                  value={form.rgIssuer}
                  onChange={(e) => setField("rgIssuer", e.target.value)}
                  placeholder="Ex: SSP"
                />
              </FieldWrapper>
              <FieldWrapper label="UF do órgão">
                <select
                  value={form.rgIssuerState}
                  onChange={(e) => setField("rgIssuerState", e.target.value)}
                  className={selectClassName}
                >
                  <option value="">—</option>
                  {BRAZIL_STATES.map((uf) => <option key={uf} value={uf}>{uf}</option>)}
                </select>
              </FieldWrapper>
              <FieldWrapper label="Data de emissão">
                <input
                  type="date"
                  value={form.rgIssueDate}
                  max={new Date().toISOString().slice(0, 10)}
                  onChange={(e) => setField("rgIssueDate", e.target.value)}
                  className={nativeInputClassName}
                />
              </FieldWrapper>
            </div>
            <p className="text-[11px] text-text-muted mt-2">Preencha todos os dados do RG, ou deixe todos vazios.</p>
          </fieldset>

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