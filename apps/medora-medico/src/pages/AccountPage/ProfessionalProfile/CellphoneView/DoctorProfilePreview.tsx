import { useState } from "react";
import type { ComponentType, ReactNode } from "react";
import { Briefcase, BriefcaseBusiness, GraduationCap, Heart, MapPin, Star, Stethoscope } from "lucide-react";
import type { DoctorProfilePreviewData, EducationType } from "../../../../api/dtos/Doctors/types";
import { formatPeriod, yearsSince } from "../../../../api/mappers/careerPeriod";
import { languageName } from "./languages";
import { EDUCATION_TYPE_LABEL } from "./labels";


function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

export default function DoctorProfilePreview({ data }: { data: DoctorProfilePreviewData }) {
  return (
    <div className="bg-surface min-h-full pb-6">
      <PreviewHeader data={data} />

      <Section title="Especialidades" visible={data.specialties.length > 0}>
        <div className="space-y-3">
          {data.specialties.map((specialty) => (
            <div key={specialty.name} className="flex items-center gap-3">
              <Stethoscope size={18} className="text-primary-color shrink-0" />
              <p className="flex-1 text-sm font-semibold text-text-primary">{specialty.name}</p>
              {specialty.rqe && <span className="text-xs text-text-muted">RQE {specialty.rqe}</span>}
            </div>
          ))}
        </div>
      </Section>

      <AboutSection bio={data.bio} />

      <Section title="Formação acadêmica" visible={data.educations.length > 0}>
        <CareerTimeline
          icon={GraduationCap}
          items={data.educations.map((item) => ({
            key: item.key,
            title: item.course || "Curso",
            subtitle: item.institution || "Instituição",
            meta: item.startDate
              ? `${EDUCATION_TYPE_LABEL[item.type]} · ${formatPeriod(item.startDate, item.endDate)}`
              : EDUCATION_TYPE_LABEL[item.type],
            badge: item.type === "LatoSensu" ? "NÃO ESPECIALISTA" : null,
            isDraft: item.isDraft,
          }))}
        />
      </Section>

      <Section title="Experiência" visible={data.experiences.length > 0}>
        <CareerTimeline
          icon={Briefcase}
          items={data.experiences.map((item) => ({
            key: item.key,
            title: item.position || "Cargo",
            subtitle: item.organization || "Local de trabalho",
            meta: item.startDate ? formatPeriod(item.startDate, item.endDate, true) : null,
            location: item.location,
            description: item.description,
            isDraft: item.isDraft,
          }))}
        />
      </Section>

      <Section title="Idiomas" visible={data.languages.length > 0}>
        <div className="flex flex-wrap gap-2">
          {data.languages.map((code) => (
            <span key={code} className="rounded-full border border-border bg-surface-raised px-3 py-1.5 text-[13px] text-text-primary">
              {languageName(code)}
            </span>
          ))}
        </div>
      </Section>
    </div>
  );
}

function PreviewHeader({ data }: { data: DoctorProfilePreviewData }) {
  const registration = data.registrations[0];
  const location = [data.address?.city, data.address?.state].filter(Boolean).join(" - ");
  const firstExperience = data.experiences.map((e) => e.startDate).filter(Boolean).sort()[0];
  const years = firstExperience ? yearsSince(firstExperience) : 0;

  return (
    <div className="px-4 pt-6 pb-4 space-y-4">
      <div className="flex gap-4">
        <div className="h-20 w-20 shrink-0 rounded-2xl bg-primary-subtle flex items-center justify-center text-2xl font-bold text-primary-text">
          {getInitials(data.name)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h2 className="text-xl font-bold text-text-primary leading-tight">{data.name}</h2>
            <Heart size={22} className="text-text-muted shrink-0" />
          </div>
          {data.specialties.length > 0 && (
            <p className="text-sm font-semibold text-primary-color mt-1">
              {data.specialties.map((s) => s.name).join(", ")}
            </p>
          )}
          {registration && (
            <p className="text-xs text-text-secondary mt-1">
              Médico(a) · {registration.councilType}-{registration.councilState} {registration.councilNumber}
            </p>
          )}
          {location && (
            <p className="text-xs text-text-secondary mt-1 flex items-center gap-1">
              <MapPin size={12} /> {location}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {years > 0 && (
          <Chip icon={<BriefcaseBusiness size={14} className="text-primary-color" />}>
            {years} {years === 1 ? "ano" : "anos"} de experiência
          </Chip>
        )}
        <Chip icon={<Star size={14} className="text-yellow-500 fill-yellow-500" />}>
          {data.rating.total > 0 && data.rating.average !== null
            ? `${data.rating.average.toFixed(1).replace(".", ",")} (${data.rating.total})`
            : "Sem avaliações"}
        </Chip>
      </div>

      <button
        type="button"
        disabled
        className="w-full rounded-xl bg-primary-color py-3 text-sm font-semibold text-text-inverse cursor-default"
      >
        Agendar consulta
      </button>
    </div>
  );
}

function Chip({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-alt px-3 py-1.5 text-xs text-text-primary">
      {icon}
      {children}
    </span>
  );
}

function Section({ title, visible, children }: { title: string; visible: boolean; children: ReactNode }) {
  if (!visible) return null;

  return (
    <div className="mx-4 py-4 border-t border-border">
      <h3 className="text-base font-bold text-text-primary mb-3">{title}</h3>
      {children}
    </div>
  );
}

const BIO_PREVIEW_LENGTH = 220;

function AboutSection({ bio }: { bio: string | null }) {
  const [expanded, setExpanded] = useState(false);

  if (!bio) return null;

  const isLong = bio.length > BIO_PREVIEW_LENGTH;

  return (
    <Section title="Sobre" visible>
      <p className={`text-sm text-text-secondary leading-relaxed whitespace-pre-line ${!expanded && isLong ? "line-clamp-4" : ""}`}>
        {bio}
      </p>
      {isLong && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-1 block ml-auto text-sm font-medium text-primary-color"
        >
          {expanded ? "ver menos" : "ver mais"}
        </button>
      )}
    </Section>
  );
}

interface TimelineItem {
  key: string | number;
  title: string;
  subtitle: string;
  meta: string | null;
  badge?: string | null;
  location?: string | null;
  description?: string | null;
  isDraft?: boolean;
}

function CareerTimeline({ icon: Icon, items }: { icon: ComponentType<{ size?: number }>; items: TimelineItem[] }) {
  return (
    <div className="divide-y divide-border">
      {items.map((item) => (
        <div
          key={item.key}
          className={`flex gap-3 py-3 first:pt-0 ${item.isDraft ? "rounded-lg outline-2 outline-dashed outline-primary-color/60 outline-offset-4" : ""}`}
        >
          <div className="h-11 w-11 shrink-0 rounded-xl bg-primary-subtle flex items-center justify-center text-primary-color">
            <Icon size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <p className="text-[15px] font-semibold text-text-primary leading-snug">{item.title}</p>
              {item.isDraft && (
                <span className="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold bg-primary-subtle text-primary-text">
                  Rascunho
                </span>
              )}
            </div>
            <p className="text-sm text-text-secondary">{item.subtitle}</p>
            {item.meta && <p className="text-xs text-text-muted mt-0.5">{item.meta}</p>}
            {item.location && <p className="text-xs text-text-muted">{item.location}</p>}
            {item.description && <p className="text-xs text-text-secondary mt-1.5 leading-relaxed">{item.description}</p>}
            {item.badge && (
              <span className="mt-2 inline-block rounded px-2 py-0.5 text-[11px] font-bold tracking-wide bg-warning-subtle text-warning-text">
                {item.badge}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}