import { useState } from "react";
import { Button, Input, Spinner } from "@heroui/react";
import { Briefcase, Pencil, Plus, Trash2 } from "lucide-react";
import { FieldWrapper } from "@medora_web/shared";
import { InfoCard } from "../../../components/Profile/InfoCard";
import { nativeInputClassName } from "../../../components/Profile/formStyles";
import { addExperience, removeExperience, updateExperience } from "../../../api/services/DoctorService";
import type { ExperienceRequestDto, PublicExperience } from "../../../api/dtos/Doctors/DoctorPublicPageDto";
import { formatPeriod } from "../../../api/mappers/careerPeriod";
import { currentMonth, sortCareer, validatePeriod } from "../sections/careerUtils";

const MAX_DESCRIPTION = 1000;

export interface ExperienceDraft {
  id: number | null;
  position: string;
  organization: string;
  location: string;
  startDate: string;
  endDate: string;
  ongoing: boolean;
  description: string;
}

const emptyDraft = (): ExperienceDraft => ({
  id: null, position: "", organization: "", location: "", startDate: "", endDate: "", ongoing: false, description: "",
});

const toDraft = (item: PublicExperience): ExperienceDraft => ({
  id: item.id,
  position: item.position,
  organization: item.organization,
  location: item.location ?? "",
  startDate: item.startDate,
  endDate: item.endDate ?? "",
  ongoing: item.endDate === null,
  description: item.description ?? "",
});

interface ExperienceEditorProps {
  items: PublicExperience[];
  draft: ExperienceDraft | null;
  onDraftChange: (draft: ExperienceDraft | null) => void;
  onItemsChange: (items: PublicExperience[]) => void;
}

export default function ExperienceEditor({ items, draft, onDraftChange, onItemsChange }: ExperienceEditorProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const setField = <K extends keyof ExperienceDraft>(key: K, value: ExperienceDraft[K]) =>
    draft && onDraftChange({ ...draft, [key]: value });

  const openDraft = (next: ExperienceDraft) => {
    setErrorMessage("");
    onDraftChange(next);
  };

  const handleSave = async () => {
    if (!draft) return;

    if (!draft.position.trim()) return setErrorMessage("Informe o cargo.");
    if (!draft.organization.trim()) return setErrorMessage("Informe o local de trabalho.");
    const periodError = validatePeriod(draft.startDate, draft.endDate, draft.ongoing);
    if (periodError) return setErrorMessage(periodError);

    const payload: ExperienceRequestDto = {
      position: draft.position.trim(),
      organization: draft.organization.trim(),
      location: draft.location.trim() || null,
      startDate: draft.startDate,
      endDate: draft.ongoing ? null : draft.endDate,
      description: draft.description.trim() || null,
    };

    setIsSaving(true);
    setErrorMessage("");
    try {
      if (draft.id === null) {
        const id = await addExperience(payload);
        onItemsChange(sortCareer([...items, { id, ...payload }]));
      } else {
        await updateExperience(draft.id, payload);
        onItemsChange(sortCareer(items.map((item) => (item.id === draft.id ? { id: draft.id, ...payload } : item))));
      }
      onDraftChange(null);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Não foi possível salvar a experiência.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemove = async (item: PublicExperience) => {
    if (!window.confirm(`Remover "${item.position} — ${item.organization}"?`)) return;

    setRemovingId(item.id);
    setErrorMessage("");
    try {
      await removeExperience(item.id);
      onItemsChange(items.filter((i) => i.id !== item.id));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Não foi possível remover a experiência.");
    } finally {
      setRemovingId(null);
    }
  };

  const form = draft && (
    <form
      className="space-y-3 rounded-xl border border-primary-color/40 bg-surface p-4"
      onSubmit={(e) => {
        e.preventDefault();
        handleSave();
      }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <FieldWrapper label="Cargo">
          <Input value={draft.position} onChange={(e) => setField("position", e.target.value)} placeholder="Ex: Pediatra" />
        </FieldWrapper>
        <FieldWrapper label="Local de trabalho">
          <Input value={draft.organization} onChange={(e) => setField("organization", e.target.value)} placeholder="Ex: Hospital Pequeno Príncipe" />
        </FieldWrapper>
        <div className="sm:col-span-2">
          <FieldWrapper label="Cidade">
            <Input value={draft.location} onChange={(e) => setField("location", e.target.value)} placeholder="Opcional. Ex: Curitiba - PR" />
          </FieldWrapper>
        </div>
        <FieldWrapper label="Início">
          <input type="month" value={draft.startDate} max={currentMonth()} onChange={(e) => setField("startDate", e.target.value)} className={nativeInputClassName} />
        </FieldWrapper>
        <FieldWrapper label="Término">
          <input
            type="month"
            value={draft.ongoing ? "" : draft.endDate}
            min={draft.startDate || undefined}
            disabled={draft.ongoing}
            onChange={(e) => setField("endDate", e.target.value)}
            className={`${nativeInputClassName} disabled:opacity-50`}
          />
        </FieldWrapper>
      </div>

      <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
        <input type="checkbox" checked={draft.ongoing} onChange={(e) => setField("ongoing", e.target.checked)} className="h-4 w-4 accent-[var(--primary)]" />
        Trabalho aqui atualmente
      </label>

      <FieldWrapper label="Descrição">
        <textarea
          value={draft.description}
          maxLength={MAX_DESCRIPTION}
          rows={3}
          onChange={(e) => setField("description", e.target.value)}
          placeholder="Opcional. O que você faz ou fazia nesse lugar."
          className="w-full rounded-lg border border-border bg-surface p-3 text-sm text-text-primary resize-y"
        />
      </FieldWrapper>

      {errorMessage && <p className="text-xs text-danger-text">{errorMessage}</p>}

      <div className="flex justify-end gap-2">
        <Button size="sm" variant="ghost" onPress={() => onDraftChange(null)} isDisabled={isSaving}>Cancelar</Button>
        <Button size="sm" variant="primary" type="submit" isDisabled={isSaving}>
          {isSaving ? <Spinner color="current" size="sm" /> : "Salvar"}
        </Button>
      </div>
    </form>
  );

  return (
    <InfoCard
      icon={<Briefcase size={18} />}
      title="Experiência"
      description="Onde você atua ou já atuou."
      action={
        <Button size="sm" variant="outline" onPress={() => openDraft(emptyDraft())} isDisabled={draft !== null}>
          <Plus size={14} /> Adicionar
        </Button>
      }
    >
      <div className="space-y-3">
        {draft?.id === null && form}

        {items.length === 0 && !draft && (
          <p className="text-sm text-text-muted">Nenhuma experiência adicionada.</p>
        )}

        {items.map((item) =>
          draft?.id === item.id ? (
            <div key={item.id}>{form}</div>
          ) : (
            <div key={item.id} className="flex items-start justify-between gap-3 rounded-xl border border-divider p-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-text-primary">{item.position}</p>
                <p className="text-xs text-text-secondary">{item.organization}</p>
                <p className="text-[11px] text-text-muted mt-0.5">{formatPeriod(item.startDate, item.endDate, true)}</p>
              </div>
              <div className="flex shrink-0 gap-1">
                <Button size="sm" variant="ghost" isIconOnly aria-label="Editar" onPress={() => openDraft(toDraft(item))} isDisabled={draft !== null}>
                  <Pencil size={14} />
                </Button>
                <Button size="sm" variant="ghost" isIconOnly aria-label="Remover" onPress={() => handleRemove(item)} isDisabled={draft !== null || removingId === item.id}>
                  {removingId === item.id ? <Spinner size="sm" /> : <Trash2 size={14} className="text-danger-text" />}
                </Button>
              </div>
            </div>
          )
        )}

        {errorMessage && !draft && <p className="text-xs text-danger-text">{errorMessage}</p>}
      </div>
    </InfoCard>
  );
}