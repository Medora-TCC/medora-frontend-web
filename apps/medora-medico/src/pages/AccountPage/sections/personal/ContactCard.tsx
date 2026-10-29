import { useState } from "react";
import { Button, Input, Spinner } from "@heroui/react";
import { Pencil, Phone } from "lucide-react";
import { FieldWrapper } from "@medora_web/shared";
import { InfoCard, InfoGrid, InfoItem } from "../../../../components/Profile/InfoCard";
import { updateContact } from "../../../../api/services/DoctorService";
import type { PersonalDataDto, Race, UpdateContactDto } from "../../../../api/dtos/Doctors/PersonalDataDto";
import {
  TIME_ZONE_OPTIONS,
  formatPhone,
  formatTimeZone,
  onlyDigits,
  raceLabel,
} from "../../../../api/mappers/personLabels";

interface ContactForm {
  phone: string;
  phone2: string;
  socialName: string;
  gender: string;
  race: Race;
  timeZoneId: string;
}

function toForm(data: PersonalDataDto): ContactForm {
  return {
    phone: formatPhone(data.phone) ?? "",
    phone2: formatPhone(data.phone2) ?? "",
    socialName: data.socialName ?? "",
    gender: data.gender ?? "",
    race: data.race,
    timeZoneId: data.timeZoneId ?? "",
  };
}

const RACE_OPTIONS = Object.entries(raceLabel) as [Race, string][];

const selectClassName =
  "w-full h-10 px-3 rounded-lg border border-border bg-surface text-text-primary text-sm";

interface ContactCardProps {
  data: PersonalDataDto;
  onSaved: (changes: UpdateContactDto) => void;
}

export default function ContactCard({ data, onSaved }: ContactCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<ContactForm>(() => toForm(data));
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const setField = <K extends keyof ContactForm>(key: K, value: ContactForm[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const startEditing = () => {
    setForm(toForm(data));
    setErrorMessage("");
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setErrorMessage("");
    setIsEditing(false);
  };

  const handleSave = async () => {
    const phone = onlyDigits(form.phone);
    const phone2 = onlyDigits(form.phone2);

    if (phone.length < 10) {
      setErrorMessage("Informe um telefone válido, com DDD.");
      return;
    }
    if (phone2 && phone2.length < 10) {
      setErrorMessage("O telefone 2 precisa ter DDD, ou ficar vazio.");
      return;
    }

    const payload: UpdateContactDto = {
      phone,
      phone2: phone2 || null,
      socialName: form.socialName.trim() || null,
      gender: form.gender.trim() || null,
      race: form.race,
      timeZoneId: form.timeZoneId || null,
    };

    setIsSaving(true);
    setErrorMessage("");
    try {
      await updateContact(payload);
      onSaved(payload);
      setIsEditing(false);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Não foi possível salvar o contato.");
    } finally {
      setIsSaving(false);
    }
  };

  const timeZoneOptions =
    form.timeZoneId && !TIME_ZONE_OPTIONS.some((o) => o.value === form.timeZoneId)
      ? [...TIME_ZONE_OPTIONS, { value: form.timeZoneId, label: form.timeZoneId }]
      : TIME_ZONE_OPTIONS;

  return (
    <InfoCard
      icon={<Phone size={18} />}
      title="Contato"
      description="Como podemos falar com você."
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
          <InfoItem label="Telefone" value={formatPhone(data.phone)} />
          <InfoItem label="Telefone 2" value={formatPhone(data.phone2)} />
          <InfoItem label="Nome social" value={data.socialName} />
          <InfoItem label="Gênero" value={data.gender} />
          <InfoItem label="Raça/cor" value={raceLabel[data.race]} />
          <InfoItem label="Fuso horário" value={formatTimeZone(data.timeZoneId)} />
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
            <FieldWrapper label="Telefone">
              <Input
                value={form.phone}
                onChange={(e) => setField("phone", e.target.value)}
                placeholder="(00) 00000-0000"
                inputMode="tel"
                autoComplete="tel"
              />
            </FieldWrapper>

            <FieldWrapper label="Telefone 2">
              <Input
                value={form.phone2}
                onChange={(e) => setField("phone2", e.target.value)}
                placeholder="Opcional"
                inputMode="tel"
              />
            </FieldWrapper>

            <FieldWrapper label="Nome social">
              <Input
                value={form.socialName}
                onChange={(e) => setField("socialName", e.target.value)}
                placeholder="Opcional"
              />
            </FieldWrapper>

            <FieldWrapper label="Gênero">
              <Input
                value={form.gender}
                onChange={(e) => setField("gender", e.target.value)}
                placeholder="Opcional"
              />
            </FieldWrapper>

            <FieldWrapper label="Raça/cor">
              <select
                value={form.race}
                onChange={(e) => setField("race", e.target.value as Race)}
                className={selectClassName}
              >
                {RACE_OPTIONS.map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </FieldWrapper>

            <FieldWrapper label="Fuso horário">
              <select
                value={form.timeZoneId}
                onChange={(e) => setField("timeZoneId", e.target.value)}
                className={selectClassName}
              >
                <option value="">Padrão (Horário de Brasília)</option>
                {timeZoneOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </FieldWrapper>
          </div>

          {errorMessage && <p className="text-xs text-danger-text">{errorMessage}</p>}

          <div className="flex justify-end gap-2">
            <Button size="sm" variant="ghost" onPress={cancelEditing} isDisabled={isSaving}>
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