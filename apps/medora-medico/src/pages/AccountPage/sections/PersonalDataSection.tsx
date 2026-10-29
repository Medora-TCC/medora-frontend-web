import { useCallback, useEffect, useState } from "react";
import { Button, Spinner } from "@heroui/react";
import { AlertTriangle, BookUser, CheckCircle2, Globe, UserRound } from "lucide-react";
import { getPersonalData } from "../../../api/services/DoctorService";
import type { PersonalDataDto, UpdateContactDto, UpdateComplementaryDto, UpdatePassportDto } from "../../../api/dtos/Doctors/PersonalDataDto";
import { formatCountry, formatCpf, formatDateOnly, sexLabel } from "../../../api/mappers/personLabels";
import { useDelayedLoading } from "../../../hooks/useDelayedLoading";
import { InfoCard, InfoGrid, InfoItem } from "../../../components/Profile/InfoCard";
import ContactCard from "./personal/ContactCard";
import ComplementaryCard from "./personal/ComplementaryCard";
import PassportCard from "./personal/PassportCard";

function getMissingFields(data: PersonalDataDto): string[] {
  const checks: [string, unknown][] = [
    ["Telefone 2", data.phone2],
    ["Gênero", data.gender],
    ["Nome da mãe", data.isMotherUnknown || data.mothersName],
    ["Local de nascimento", data.birthCity],
    ["RG", data.rg],
  ];
  return checks.filter(([, value]) => !value).map(([label]) => label);
}

const TOTAL_OPTIONAL_FIELDS = 5;

export default function PersonalDataSection() {
  const [data, setData] = useState<PersonalDataDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const showLoading = useDelayedLoading(isLoading);

  const handleSaved = (changes: Partial<PersonalDataDto>) => {
  setData((prev) => (prev ? { ...prev, ...changes } : prev));
};

const handlePassportSaved = (changes: UpdatePassportDto) => {
  setData((prev) =>
    prev && prev.foreigner
      ? { ...prev, foreigner: { ...prev.foreigner, ...changes } }
      : prev
  );
};

  const loadPersonalData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      setData(await getPersonalData());
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Erro ao carregar dados pessoais.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPersonalData();
  }, [loadPersonalData]);

  const handleContactSaved = (changes: UpdateContactDto) => {
    setData((prev) => (prev ? { ...prev, ...changes } : prev));
  };

  if (isLoading) {
    return showLoading ? <div className="py-16 flex justify-center"><Spinner /></div> : null;
  }

  if (errorMessage || !data) {
    return (
      <div className="py-16 flex flex-col items-center gap-3 text-center">
        <p className="text-sm text-danger-text flex items-center gap-1.5">
          <AlertTriangle size={14} /> {errorMessage || "Dados não encontrados."}
        </p>
        <Button size="sm" variant="outline" onPress={loadPersonalData}>Tentar novamente</Button>
      </div>
    );
  }

  const mothersName = data.isMotherUnknown ? "Mãe desconhecida" : data.mothersName;
  const birthPlace = data.birthCity
    ? `${data.birthCity}${data.birthState ? ` - ${data.birthState}` : ""}`
    : null;
  const rgIssuer = [data.rgIssuer, data.rgIssuerState].filter(Boolean).join(" / ") || null;

  return (
    <div className="space-y-5">
      <CompletenessCard missing={getMissingFields(data)} total={TOTAL_OPTIONAL_FIELDS} />

      <InfoCard
        icon={<UserRound size={18} />}
        title="Identidade"
        description="Dados verificados no cadastro. Para alterar, fale com o suporte."
        locked
      >
        <InfoGrid columns={3}>
          <InfoItem label="Nome completo" value={data.fullName} />
          <InfoItem label="Data de nascimento" value={formatDateOnly(data.birthDate)} />
          <InfoItem label="Sexo" value={sexLabel[data.sex]} />
          <InfoItem label="Nacionalidade" value={formatCountry(data.nationality)} />
          {data.cpf && <InfoItem label="CPF" value={formatCpf(data.cpf)} />}
          <InfoItem label="E-mail" value={data.email} />
        </InfoGrid>
      </InfoCard>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 items-start">
        <ContactCard data={data} onSaved={handleContactSaved} />

        
      <ComplementaryCard data={data} onSaved={handleSaved} />

      </div>

      {data.foreigner && (
        <PassportCard foreigner={data.foreigner} onSaved={handlePassportSaved} />
      )}
    </div>
  );
}

function CompletenessCard({ missing, total }: { missing: string[]; total: number }) {
  const percent = Math.round(((total - missing.length) / total) * 100);

  if (missing.length === 0) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-divider bg-success-subtle px-5 py-4">
        <CheckCircle2 size={20} className="text-success-text shrink-0" />
        <p className="text-sm text-success-text font-medium">Seu cadastro está completo.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-divider bg-surface-alt px-5 py-4">
      <div className="flex items-center justify-between gap-4 mb-2">
        <p className="text-sm font-semibold text-text-primary">Complete seu cadastro</p>
        <span className="text-sm font-bold text-primary-color">{percent}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-surface-raised overflow-hidden">
        <div className="h-full rounded-full bg-primary-color transition-all" style={{ width: `${percent}%` }} />
      </div>
      <div className="flex flex-wrap gap-1.5 mt-3">
        {missing.map((field) => (
          <span key={field} className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-surface-raised text-text-secondary">
            {field}
          </span>
        ))}
      </div>
    </div>
  );
}