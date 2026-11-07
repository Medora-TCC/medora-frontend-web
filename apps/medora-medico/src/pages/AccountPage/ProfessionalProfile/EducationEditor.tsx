import { useState } from "react";
import { Button, Input, Spinner } from "@heroui/react";
import { GraduationCap, Pencil, Plus, Trash2 } from "lucide-react";
import { FieldWrapper } from "@medora_web/shared";
import { InfoCard } from "../../../components/Profile/InfoCard";
import { nativeInputClassName, selectClassName } from "../../../components/Profile/formStyles";
import { addEducation, removeEducation, updateEducation } from "../../../api/services/DoctorService";
import type { EducationRequestDto, PublicEducation } from "../../../api/dtos/Doctors/DoctorPublicPageDto";
import type { EducationType } from "../../../api/dtos/Doctors/types";
import { EDUCATION_TYPE_LABEL } from "./CellphoneView/labels";
import { formatPeriod } from "../../../api/mappers/careerPeriod";
import { currentMonth, sortCareer, validatePeriod } from "../sections/careerUtils";

export interface EducationDraft {
  id: number | null;
  type: EducationType;
  course: string;
  institution: string;
  startDate: string;
  endDate: string;
  ongoing: boolean;
}

const EDUCATION_TYPES = Object.entries(EDUCATION_TYPE_LABEL) as [EducationType, string][];

const emptyDraft = (): EducationDraft => ({
  id: null, type: "Graduation", course: "", institution: "", startDate: "", endDate: "", ongoing: false,
});

const toDraft = (item: PublicEducation): EducationDraft => ({
  id: item.id,
  type: item.type,
  course: item.course,
  institution: item.institution,
  startDate: item.startDate,
  endDate: item.endDate ?? "",
  ongoing: item.endDate === null,
});

interface EducationEditorProps {
  items: PublicEducation[];
  draft: EducationDraft | null;
  onDraftChange: (draft: EducationDraft | null) => void;
  onItemsChange: (items: PublicEducation[]) => void;
}

export default function EducationEditor({ items, draft, onDraftChange, onItemsChange }: EducationEditorProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const setField = <K extends keyof EducationDraft>(key: K, value: EducationDraft[K]) =>
    draft && onDraftChange({ ...draft, [key]: value });

  const openDraft = (next: EducationDraft) => {
    setErrorMessage("");
    onDraftChange(next);
  };

  const handleSave = async () => {
    if (!draft) return;

    if (!draft.course.trim()) return setErrorMessage("Informe o curso.");
    if (!draft.institution.trim()) return setErrorMessage("Informe a instituição.");
    const periodError = validatePeriod(draft.startDate, draft.endDate, draft.ongoing);
    if (periodError) return setErrorMessage(periodError);

    const payload: EducationRequestDto = {
      type: draft.type,
      course: draft.course.trim(),
      institution: draft.institution.trim(),
      startDate: draft.startDate,
      endDate: draft.ongoing ? null : draft.endDate,
    };
    const disclaimer = payload.type === "LatoSensu" ? "NÃO ESPECIALISTA" : null;

    setIsSaving(true);
    setErrorMessage("");
    try {
      if (draft.id === null) {
        const id = await addEducation(payload);
        onItemsChange(sortCareer([...items, { id, ...payload, disclaimer }]));
      } else {
        await updateEducation(draft.id, payload);
        onItemsChange(sortCareer(items.map((item) => (item.id === draft.id ? { id: draft.id, ...payload, disclaimer } : item))));
      }
      onDraftChange(null);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Não foi possível salvar a formação.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemove = async (item: PublicEducation) => {
    if (!window.confirm(`Remover "${item.course}"?`)) return;

    setRemovingId(item.id);
    setErrorMessage("");
    try {
      await removeEducation(item.id);
      onItemsChange(items.filter((i) => i.id !== item.id));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Não foi possível remover a formação.");
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
        <FieldWrapper label="Tipo">
          <select value={draft.type} onChange={(e) => setField("type", e.target.value as EducationType)} className={selectClassName}>
            {EDUCATION_TYPES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </FieldWrapper>
        <FieldWrapper label="Curso">
          <Input value={draft.course} onChange={(e) => setField("course", e.target.value)} placeholder="Ex: Residência em Pediatria" />
        </FieldWrapper>
        <div className="sm:col-span-2">
          <FieldWrapper label="Instituição">
            <Input value={draft.institution} onChange={(e) => setField("institution", e.target.value)} placeholder="Ex: Universidade Federal do Paraná" />
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
        Em andamento
      </label>

      {draft.type === "LatoSensu" && (
        <p className="text-[11px] text-warning-text">
          Pós-graduações lato sensu são exibidas com "NÃO ESPECIALISTA", conforme a Resolução CFM nº 2.336/2023.
        </p>
      )}

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
      icon={<GraduationCap size={18} />}
      title="Formação acadêmica"
      description="Graduação, residência, pós-graduação, mestrado e doutorado."
      action={
        <Button size="sm" variant="outline" onPress={() => openDraft(emptyDraft())} isDisabled={draft !== null}>
          <Plus size={14} /> Adicionar
        </Button>
      }
    >
      <div className="space-y-3">
        {draft?.id === null && form}

        {items.length === 0 && !draft && (
          <p className="text-sm text-text-muted">Nenhuma formação adicionada.</p>
        )}

        {items.map((item) =>
          draft?.id === item.id ? (
            <div key={item.id}>{form}</div>
          ) : (
            <div key={item.id} className="flex items-start justify-between gap-3 rounded-xl border border-divider p-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-text-primary">{item.course}</p>
                <p className="text-xs text-text-secondary">{item.institution}</p>
                <p className="text-[11px] text-text-muted mt-0.5">
                  {EDUCATION_TYPE_LABEL[item.type]} · {formatPeriod(item.startDate, item.endDate)}
                </p>
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