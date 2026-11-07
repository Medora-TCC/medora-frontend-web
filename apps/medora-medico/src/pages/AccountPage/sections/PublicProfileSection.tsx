import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Spinner } from "@heroui/react";
import { AlertTriangle, Languages, NotebookPen, X } from "lucide-react";
import { getMyPublicPage, updateAbout } from "../../../api/services/DoctorService";
import type {
  DoctorPublicPageDto,
  PublicEducation,
  PublicExperience,
} from "../../../api/dtos/Doctors/DoctorPublicPageDto";
import { useDelayedLoading } from "../../../hooks/useDelayedLoading";
import { InfoCard } from "../../../components/Profile/InfoCard";
import { selectClassName } from "../../../components/Profile/formStyles";
import { PhoneFrame } from "../ProfessionalProfile/CellphoneView/PhoneFrame";
import DoctorProfilePreview from "../ProfessionalProfile/CellphoneView/DoctorProfilePreview";
import type { DoctorProfilePreviewData, PreviewEducation, PreviewExperience } from "../../../api/dtos/Doctors/types";
import { COMMON_LANGUAGES, languageName } from "../ProfessionalProfile/CellphoneView/languages";
import EducationEditor, { type EducationDraft } from "../ProfessionalProfile/EducationEditor";
import ExperienceEditor, { type ExperienceDraft } from "../ProfessionalProfile/ExperienceEditor";
import { mergeDraft } from "../sections/careerUtils";

const MAX_BIO_LENGTH = 2000;

interface AboutForm {
  bio: string;
  languages: string[];
}

function toPreviewData(
  page: DoctorPublicPageDto,
  form: AboutForm,
  educationDraft: EducationDraft | null,
  experienceDraft: ExperienceDraft | null,
): DoctorProfilePreviewData {
  const educations: PreviewEducation[] = page.educations.map((e) => ({
  key: e.id,
  type: e.type,
  course: e.course,
  institution: e.institution,
  startDate: e.startDate,
  endDate: e.endDate,
}));
  const experiences: PreviewExperience[] = page.experiences.map((x) => ({
  key: x.id,
  position: x.position,
  organization: x.organization,
  location: x.location,
  startDate: x.startDate,
  endDate: x.endDate,
  description: x.description,
}));

  return {
    name: page.name,
    registrations: page.registrations,
    specialties: page.specialties,
    bio: form.bio.trim() || null,
    languages: form.languages,
    rating: page.rating,
    address: page.address,
    educations: mergeDraft(
      educations,
      educationDraft && {
        key: educationDraft.id ?? -1,
        type: educationDraft.type,
        course: educationDraft.course,
        institution: educationDraft.institution,
        startDate: educationDraft.startDate,
        endDate: educationDraft.ongoing ? null : educationDraft.endDate || null,
        isDraft: true,
      },
    ),
    experiences: mergeDraft(
      experiences,
      experienceDraft && {
        key: experienceDraft.id ?? -1,
        position: experienceDraft.position,
        organization: experienceDraft.organization,
        location: experienceDraft.location || null,
        startDate: experienceDraft.startDate,
        endDate: experienceDraft.ongoing ? null : experienceDraft.endDate || null,
        description: experienceDraft.description || null,
        isDraft: true,
      },
    ),
  };
}

function sameLanguages(a: string[], b: string[]) {
  return a.length === b.length && a.every((code, index) => code === b[index]);
}

export default function PublicProfileSection() {
  const [page, setPage] = useState<DoctorPublicPageDto | null>(null);
  const [form, setForm] = useState<AboutForm>({ bio: "", languages: [] });
  const [educationDraft, setEducationDraft] = useState<EducationDraft | null>(null);
  const [experienceDraft, setExperienceDraft] = useState<ExperienceDraft | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const showLoading = useDelayedLoading(isLoading);

  const loadPage = useCallback(async () => {
    setIsLoading(true);
    setLoadError("");
    try {
      const data = await getMyPublicPage();
      setPage(data);
      setForm({ bio: data.bio ?? "", languages: data.languages });
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Erro ao carregar o perfil público.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPage();
  }, [loadPage]);

  const previewData = useMemo(
    () => (page ? toPreviewData(page, form, educationDraft, experienceDraft) : null),
    [page, form, educationDraft, experienceDraft],
  );

  if (isLoading) {
    return showLoading ? <div className="py-16 flex justify-center"><Spinner /></div> : null;
  }

  if (loadError || !page || !previewData) {
    return (
      <div className="py-16 flex flex-col items-center gap-3 text-center">
        <p className="text-sm text-danger-text flex items-center gap-1.5">
          <AlertTriangle size={14} /> {loadError || "Perfil não encontrado."}
        </p>
        <Button size="sm" variant="outline" onPress={loadPage}>Tentar novamente</Button>
      </div>
    );
  }

  const isDirty = form.bio !== (page.bio ?? "") || !sameLanguages(form.languages, page.languages);
  const hasUnsavedChanges = isDirty || educationDraft !== null || experienceDraft !== null;
  const availableLanguages = COMMON_LANGUAGES.filter((code) => !form.languages.includes(code));

  const handleSave = async () => {
    const payload = { bio: form.bio.trim() || null, languages: form.languages };

    setIsSaving(true);
    setSaveError("");
    try {
      await updateAbout(payload);
      setPage((prev) => (prev ? { ...prev, ...payload } : prev));
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Não foi possível salvar.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscard = () => {
    setForm({ bio: page.bio ?? "", languages: page.languages });
    setSaveError("");
  };

  const handleEducationsChange = (educations: PublicEducation[]) =>
    setPage((prev) => (prev ? { ...prev, educations } : prev));

  const handleExperiencesChange = (experiences: PublicExperience[]) =>
    setPage((prev) => (prev ? { ...prev, experiences } : prev));

  return (
    <div className="flex gap-8 items-start">
      <div className="flex-1 min-w-0 space-y-5">
        <InfoCard icon={<NotebookPen size={18} />} title="Sobre" description="Apresente-se aos pacientes. Aparece logo abaixo das suas especialidades.">
          <textarea
            value={form.bio}
            onChange={(e) => setForm((prev) => ({ ...prev, bio: e.target.value }))}
            maxLength={MAX_BIO_LENGTH}
            rows={7}
            placeholder="Ex: Pediatra com foco no desenvolvimento infantil. Atendo com calma, explicando cada etapa..."
            className="w-full rounded-lg border border-border bg-surface p-3 text-sm text-text-primary resize-y"
          />
          <p className="mt-1 text-right text-[11px] text-text-muted">
            {form.bio.length}/{MAX_BIO_LENGTH}
          </p>
        </InfoCard>

        <InfoCard icon={<Languages size={18} />} title="Idiomas" description="Idiomas em que você consegue atender.">
          <div className="flex flex-wrap gap-2 mb-3">
            {form.languages.length === 0 && <p className="text-sm text-text-muted">Nenhum idioma adicionado.</p>}
            {form.languages.map((code) => (
              <span key={code} className="inline-flex items-center gap-1 rounded-full border border-border bg-surface-raised pl-3 pr-1.5 py-1 text-[13px] text-text-primary">
                {languageName(code)}
                <button
                  type="button"
                  aria-label={`Remover ${languageName(code)}`}
                  onClick={() => setForm((prev) => ({ ...prev, languages: prev.languages.filter((l) => l !== code) }))}
                  className="rounded-full p-0.5 text-text-muted hover:text-danger-text"
                >
                  <X size={13} />
                </button>
              </span>
            ))}
          </div>
          {availableLanguages.length > 0 && (
            <select
              value=""
              onChange={(e) => {
                const code = e.target.value;
                if (code) setForm((prev) => ({ ...prev, languages: [...prev.languages, code] }));
              }}
              className={`${selectClassName} max-w-xs`}
            >
              <option value="">Adicionar idioma...</option>
              {availableLanguages.map((code) => (
                <option key={code} value={code}>{languageName(code)}</option>
              ))}
            </select>
          )}
        </InfoCard>

        {isDirty && (
          <div className="sticky bottom-4 z-10 flex items-center justify-between gap-4 rounded-xl border border-divider bg-surface-alt px-4 py-3 shadow-lg">
            <p className="text-sm text-text-secondary">Você tem alterações não salvas no Sobre e nos idiomas.</p>
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" onPress={handleDiscard} isDisabled={isSaving}>Descartar</Button>
              <Button size="sm" variant="primary" onPress={handleSave} isDisabled={isSaving}>
                {isSaving ? <Spinner color="current" size="sm" /> : "Salvar"}
              </Button>
            </div>
          </div>
        )}
        {saveError && <p className="text-xs text-danger-text">{saveError}</p>}

        <EducationEditor
          items={page.educations}
          draft={educationDraft}
          onDraftChange={setEducationDraft}
          onItemsChange={handleEducationsChange}
        />

        <ExperienceEditor
          items={page.experiences}
          draft={experienceDraft}
          onDraftChange={setExperienceDraft}
          onItemsChange={handleExperiencesChange}
        />
      </div>

      <div className="hidden 2xl:block sticky top-20">
        {hasUnsavedChanges && (
          <p className="mb-2 text-center text-[11px] font-semibold text-warning-text">Alterações não salvas</p>
        )}
        <PhoneFrame>
          <DoctorProfilePreview data={previewData} />
        </PhoneFrame>
        <p className="mt-2 text-center text-[11px] text-text-muted">Pré-visualização aproximada</p>
      </div>
    </div>
  );
}