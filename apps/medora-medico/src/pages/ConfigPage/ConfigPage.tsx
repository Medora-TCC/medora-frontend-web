import { Button, Input } from "@heroui/react";
import { useState, type ReactNode } from "react";

interface SelectOption {
  value: string;
  label: string;
}

interface ProfileState {
  name: string;
  specialty: string;
  email: string;
  phone: string;
  bio: string;
}

interface ClinicState {
  name: string;
  cnpj: string;
  address: string;
  timezone: string;
  language: string;
  currency: string;
}

interface PrivacyState {
  twoFactor: boolean;
}

interface SectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  danger?: boolean;
}

const Section = ({ title, description, children, danger = false }: SectionProps) => (
  <div
    className={`border-b ${
      danger ? "border-red-200 dark:border-red-900" : "border-zinc-200 dark:border-zinc-800"
    } pb-10 mb-10 last:border-0 last:mb-0 last:pb-0`}
  >
    <div className="mb-6">
      <h2
        className={`text-base font-semibold ${
          danger ? "text-red-600 dark:text-red-400" : "text-zinc-900 dark:text-zinc-100"
        }`}
      >
        {title}
      </h2>
      {description && (
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">{description}</p>
      )}
    </div>
    <div className="space-y-5">{children}</div>
  </div>
);

interface FieldProps {
  label: string;
  description?: string;
  children: ReactNode;
  horizontal?: boolean;
}

const Field = ({ label, description, children, horizontal = false }: FieldProps) => (
  <div className={horizontal ? "flex items-start justify-between gap-8" : "space-y-1.5"}>
    <div className="min-w-0">
      <label className="block text-sm font-medium text-zinc-800 dark:text-zinc-200">
        {label}
      </label>
      {description && (
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 leading-relaxed">
          {description}
        </p>
      )}
    </div>
    <div className={horizontal ? "shrink-0" : ""}>{children}</div>
  </div>
);


interface SelectProps {
  value: string;
  onChange?: (value: string) => void;
  options: SelectOption[];
}

const Select = ({ value, onChange, options }: SelectProps) => (
  <select
    value={value}
    onChange={(e) => onChange?.(e.target.value)}
    className="w-full px-3 py-2 text-sm bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-md text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition appearance-none cursor-pointer"
  >
    {options.map((opt) => (
      <option key={opt.value} value={opt.value}>
        {opt.label}
      </option>
    ))}
  </select>
);

interface ToggleProps {
  checked: boolean;
  onChange?: (value: boolean) => void;
  label: string;
}

const Toggle = ({ checked, onChange, label }: ToggleProps) => (
  <button
    role="switch"
    aria-checked={checked}
    aria-label={label}
    onClick={() => onChange?.(!checked)}
    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-950 ${
      checked ? "bg-teal-500" : "bg-zinc-300 dark:bg-zinc-700"
    }`}
  >
    <span
      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
        checked ? "translate-x-5" : "translate-x-0.5"
      }`}
    />
  </button>
);

export default function ConfigPage() {
  const [saved, setSaved] = useState<boolean>(false);

  const [profile, setProfile] = useState<ProfileState>({
    name: "Dr. João Pedro",
    specialty: "cardiologia",
    email: "joao@clinica.com.br",
    phone: "(11) 11111-1111",
    bio: "Cardiologista com 12 anos de experiência em cardiologia clínica e preventiva.",
  });

  const [clinic, setClinic] = useState<ClinicState>({
    name: "Clínica CardioSaúde",
    cnpj: "12.345.678/0001-99",
    address: "Av. Paulista, 1000 - São Paulo, SP",
    timezone: "America/Sao_Paulo",
    language: "pt-BR",
    currency: "BRL",
  });

  const [privacy, setPrivacy] = useState<PrivacyState>({
    twoFactor: false,
  });

  const handleSave = (): void => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans">
      <div className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">        
            <span className="text-sm text-muted">Configurações Gerais</span>
          </div>
          <div className="flex items-center gap-2">
            {saved && (
              <span className="text-xs text-teal-600 dark:text-teal-400 font-medium flex items-center gap-1">
                <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 fill-current">
                  <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z" />
                </svg>
                Salvo
              </span>
            )}
            <Button variant="secondary" onClick={() => {}}>Cancelar</Button>
            <Button variant="primary" onClick={handleSave}>Salvar alterações</Button>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10">
        <Section
          title="Perfil profissional"
          description="Informações exibidas para pacientes e outros profissionais da plataforma."
        >
          <div className="flex items-start gap-5 mb-6">
            <div className="w-16 h-16 rounded-full bg-teal-100 dark:bg-teal-900 flex items-center justify-center text-teal-700 dark:text-teal-300 text-xl font-semibold shrink-0">
              JP
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 mb-1">Foto de perfil</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">JPG, PNG ou GIF. Máximo de 2 MB.</p>
              <div className="flex gap-2">
                <Button variant="secondary">Alterar foto</Button>
                <Button variant="secondary">Remover</Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Field label="Nome completo">
                <Input
                  value={profile.name}
                  onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                />
              </Field>
            </div>

            <Field label="E-mail profissional">
              <Input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
              />
            </Field>
            <Field label="Telefone">
              <Input
                value={profile.phone}
                onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
              />
            </Field>
            <div className="col-span-2">
              <Field
                label="Apresentação / Bio"
                description="Resumo exibido no perfil público. Máximo de 280 caracteres."
              >
                <textarea
                  value={profile.bio}
                  onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
                  rows={3}
                  maxLength={280}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-md text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition resize-none"
                />
                <p className="text-xs text-zinc-400 text-right mt-1">{profile.bio.length}/280</p>
              </Field>
            </div>
          </div>
        </Section>

        <Section
          title="Clínica / Estabelecimento"
          description="Dados do local de atendimento vinculado à sua conta."
        >
          <div className="grid grid-cols-2 gap-4">

              <Field label="Nome da clínica">
                <Input
                  value={clinic.name}
                  onChange={(e) => setClinic((c) => ({ ...c, name: e.target.value }))}
                />
              </Field>

            <Field label="CNPJ">
              <Input
                value={clinic.cnpj}
                onChange={(e) => setClinic((c) => ({ ...c, cnpj: e.target.value }))}
              />
            </Field>
            <div className="col-span-2">
              <Field label="Endereço completo">
                <Input
                className="w-[70%]"
                  value={clinic.address}
                  onChange={(e) => setClinic((c) => ({ ...c, address: e.target.value }))}
                />
              </Field>
            </div>
            <Field label="Fuso horário">
              <Select
                value={clinic.timezone}
                onChange={(v) => setClinic((c) => ({ ...c, timezone: v }))}
                options={[
                  { value: "America/Sao_Paulo", label: "Brasília (GMT-3)" },
                  { value: "America/Manaus", label: "Manaus (GMT-4)" },
                  { value: "America/Belem", label: "Belém (GMT-3)" },
                  { value: "America/Fortaleza", label: "Fortaleza (GMT-3)" },
                ]}
              />
            </Field>
          </div>
        </Section>

        <Section
          title="Segurança"
          description="Configurações de segurança para sua conta"
        >
          <Field
            horizontal
            label="Autenticação em dois fatores (2FA)"
            description="Adicionar uma camada extra de segurança no login da conta."
          >
            <div className="flex items-center gap-2">
              {!privacy.twoFactor && <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-warning bg-warning-soft">Recomendado</span>}
              <Toggle
                checked={privacy.twoFactor}
                onChange={(v) => setPrivacy((p) => ({ ...p, twoFactor: v }))}
                label="2FA"
              />
            </div>
          </Field>
        </Section>


        <Section title="Zona de perigo" danger>
          <div className="rounded-md border border-red-200 dark:border-red-900 divide-y divide-red-200 dark:divide-red-900 overflow-hidden">
            <div className="px-5 py-4 flex items-start justify-between gap-6 bg-white dark:bg-zinc-900">
              <div>
                <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">Desativar conta</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Suspender temporariamente o acesso à conta sem excluir os dados.
                </p>
              </div>
              <Button variant="danger">Desativar</Button>
            </div>
            <div className="px-5 py-4 flex items-start justify-between gap-6 bg-red-50 dark:bg-red-950/30">
              <div>
                <p className="text-sm font-medium text-red-700 dark:text-red-400">
                  Excluir conta permanentemente
                </p>
                <p className="text-xs text-red-500 mt-0.5">
                  Esta ação é irreversível. Todos os dados serão removidos após 30 dias.
                </p>
              </div>
              <Button variant="danger">Excluir conta</Button>
            </div>
          </div>
        </Section>

        <div className="pt-4 flex items-center justify-between">
          <p className="text-xs text-zinc-400">Última atualização: 27 de mai. de 2026</p>
          <div className="flex gap-2">
            <Button variant="secondary">Cancelar</Button>
            <Button variant="primary" onClick={handleSave}>Salvar alterações</Button>
          </div>
        </div>
      </div>
    </div>
  );
}