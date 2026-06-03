import { Button, Input } from "@heroui/react";
import { Check } from "lucide-react";
import { useState, type ReactNode } from "react";

interface SelectOption {
  value: string;
  label: string;
}

interface NotifChannelsState {
  email: boolean;
  telegram: boolean;
}

interface NotifTypesState {
  cancellation: boolean;
  newAppointment: boolean;
  upcomingConsult: boolean;
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
    className={`border-b ${danger ? "border-red-200 dark:border-red-900" : "border-zinc-200 dark:border-zinc-800"
      } pb-10 mb-10 last:border-0 last:mb-0 last:pb-0`}
  >
    <div className="mb-6">
      <h2
        className={`text-base font-semibold ${danger ? "text-red-600 dark:text-red-400" : "text-zinc-900 dark:text-zinc-100"
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
  description?: string | ReactNode;
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
    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-950 ${checked ? "bg-teal-500" : "bg-zinc-300 dark:bg-zinc-700"
      }`}
  >
    <span
      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${checked ? "translate-x-5" : "translate-x-0.5"
        }`}
    />
  </button>
);

export default function ConfigPage() {
  const [saved, setSaved] = useState<boolean>(false);

  const [notifChannels, setNotifChannels] = useState<NotifChannelsState>({
    email: true,
    telegram: false,
  });

  const [telegramChatId, setTelegramChatId] = useState<string>("");

  const [notifTypes, setNotifTypes] = useState<NotifTypesState>({
    cancellation: true,
    newAppointment: true,
    upcomingConsult: false,
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
            <span className="text-sm text-zinc-500 dark:text-zinc-400">Configurações Gerais</span>
          </div>
          <div className="flex items-center gap-2">
            {saved && (
              <span className="text-xs text-teal-600 dark:text-teal-400 font-medium flex items-center gap-1">
                <Check size={16}/>
                Salvo
              </span>
            )}
            <Button variant="secondary" size="sm" onClick={() => { }}>Cancelar</Button>
            <Button variant="primary" size="sm" onClick={handleSave}>Salvar alterações</Button>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10">

        <Section
          title="Canais de notificação"
          description="Escolha por onde deseja receber as notificações."
        >
          <Field
            horizontal
            label="E-mail"
            description="Notificações enviadas para o e-mail cadastrado no seu perfil."
          >
            <Toggle
              checked={notifChannels.email}
              onChange={(v) => setNotifChannels((n) => ({ ...n, email: v }))}
              label="E-mail"
            />
          </Field>

          <Field
            horizontal
            label="Telegram"
            description="Receba notificações via bot no Telegram. Requer configuração do Chat ID."
          >
            <div className="flex items-center gap-2">
              {!notifChannels.telegram && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
                  Não configurado
                </span>
              )}
              <Toggle
                checked={notifChannels.telegram}
                onChange={(v) => setNotifChannels((n) => ({ ...n, telegram: v }))}
                label="Telegram"
              />
            </div>
          </Field>

          {notifChannels.telegram && (
            <Field
              label="Telegram Chat ID"
              description={
                <>
                  Inicie uma conversa com{" "}
                  <a
                    href="https://t.me/userinfobot"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-teal-600 dark:text-teal-400 underline underline-offset-2"
                  >
                    @userinfobot
                  </a>{" "}
                  no Telegram para obter seu Chat ID.
                </>
              }
            >
              <Input
                placeholder="Ex: 123456789"
                value={telegramChatId}
                onChange={(e) => setTelegramChatId(e.target.value)}
              />
            </Field>
          )}
        </Section>

        <Section
          title="Tipos de notificação"
          description="Selecione os eventos sobre os quais deseja ser notificado."
        >
          <Field
            horizontal
            label="Cancelamento de consulta"
            description="Notificar quando um paciente cancelar um agendamento."
          >
            <Toggle
              checked={notifTypes.cancellation}
              onChange={(v) => setNotifTypes((n) => ({ ...n, cancellation: v }))}
              label="Cancelamento de consulta"
            />
          </Field>
          <Field
            horizontal
            label="Novo agendamento"
            description="Notificar quando um paciente realizar um novo agendamento."
          >
            <Toggle
              checked={notifTypes.newAppointment}
              onChange={(v) => setNotifTypes((n) => ({ ...n, newAppointment: v }))}
              label="Novo agendamento"
            />
          </Field>
          <Field
            horizontal
            label="Consulta próxima"
            description="Lembrete antes do início de uma consulta agendada."
          >
            <Toggle
              checked={notifTypes.upcomingConsult}
              onChange={(v) => setNotifTypes((n) => ({ ...n, upcomingConsult: v }))}
              label="Consulta próxima"
            />
          </Field>

          {notifTypes.upcomingConsult && (
            <Field
              label="Antecedência do lembrete"
              description="Com quanto tempo de antecedência o lembrete deve ser enviado."
            >
              <Select
                value="60"
                onChange={() => { }}
                options={[
                  { value: "15", label: "15 minutos antes" },
                  { value: "30", label: "30 minutos antes" },
                  { value: "60", label: "1 hora antes" },
                  { value: "120", label: "2 horas antes" },
                  { value: "1440", label: "1 dia antes" },
                ]}
              />
            </Field>
          )}

          {!notifChannels.email && !notifChannels.telegram && (
            <div className="flex items-start gap-2.5 px-4 py-3 rounded-md bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
              <svg viewBox="0 0 16 16" className="w-4 h-4 fill-amber-500 shrink-0 mt-0.5">
                <path d="M6.457 1.047c.659-1.234 2.427-1.234 3.086 0l6.082 11.378A1.75 1.75 0 0 1 14.082 15H1.918a1.75 1.75 0 0 1-1.543-2.575Zm1.763.707a.25.25 0 0 0-.44 0L1.698 13.132a.25.25 0 0 0 .22.368h12.164a.25.25 0 0 0 .22-.368Zm.53 3.996v2.5a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 1 1.5 0ZM9 11a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" />
              </svg>
              <p className="text-xs text-amber-700 dark:text-amber-400">
                Nenhum canal de notificação está ativo. Ative ao menos um canal para receber alertas.
              </p>
            </div>
          )}
        </Section>

        {/* Segurança */}
        <Section
          title="Segurança"
          description="Configurações de segurança para sua conta."
        >
          <Field
            horizontal
            label="Autenticação em dois fatores (2FA)"
            description="Adicionar uma camada extra de segurança no login da conta."
          >
            <div className="flex items-center gap-2">
              {!privacy.twoFactor && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950">
                  Recomendado
                </span>
              )}
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
              <Button variant="danger" size="sm">Desativar</Button>
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
              <Button variant="danger" size="sm">Excluir conta</Button>
            </div>
          </div>
        </Section>

        <div className="pt-4 flex items-center justify-between">
          <p className="text-xs text-zinc-400">Última atualização: 27 de mai. de 2026</p>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm">Cancelar</Button>
            <Button variant="primary" size="sm" onClick={handleSave}>Salvar alterações</Button>
          </div>
        </div>
      </div>
    </div>
  );
}