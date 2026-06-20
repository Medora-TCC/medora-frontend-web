import { Button, Input } from "@heroui/react";
import { Check, TriangleAlert, ArrowLeft } from "lucide-react";
import { useState, type ReactNode } from "react";
import { useNavigate } from "react-router";

interface SelectOption {
  value: string;
  label: string;
}

interface NotifChannelsState {
  email: boolean;
  telegram: boolean;
}

interface AdminNotifTypesState {
  newDoctor: boolean;
  workerErrors: boolean;
  dailyAudit: boolean;
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
    className={`border-b ${danger ? "border-danger" : "border-divider"
      } pb-6 mb-6 last:border-0 last:mb-0 last:pb-0 w-full`}
  >
    <div className="mb-4">
      <h2
        className={`text-base font-bold ${danger ? "text-red-500" : "text-text-primary"
          }`}
      >
        {title}
      </h2>
      {description && (
        <p className="text-sm text-text-muted mt-1">{description}</p>
      )}
    </div>
    <div className="space-y-4 w-full">{children}</div>
  </div>
);

interface FieldProps {
  label: string;
  description?: string | ReactNode;
  children: ReactNode;
  horizontal?: boolean;
}

const Field = ({ label, description, children, horizontal = false }: FieldProps) => (
  <div className={horizontal ? "flex items-start justify-between gap-8 w-full" : "space-y-1.5 w-full"}>
    <div className="min-w-0 flex-1">
      <label className="block text-sm font-semibold text-text-primary">
        {label}
      </label>
      {description && (
        <p className="text-xs text-text-muted mt-1 leading-relaxed">
          {description}
        </p>
      )}
    </div>
    <div className={horizontal ? "shrink-0 mt-1" : ""}>{children}</div>
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
    className="w-full sm:w-64 px-3 py-2 text-sm bg-surface border border-divider rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-color focus:border-transparent transition appearance-none cursor-pointer"
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
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-color focus:ring-offset-2 dark:focus:ring-offset-zinc-950 ${checked ? "bg-primary-color" : "bg-zinc-300 dark:bg-zinc-700"
      }`}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? "translate-x-6" : "translate-x-1"
        }`}
    />
  </button>
);

export default function ConfigPage() {
  const navigate = useNavigate();
  const [saved, setSaved] = useState<boolean>(false);

  const [notifChannels, setNotifChannels] = useState<NotifChannelsState>({
    email: true,
    telegram: false,
  });

  const [telegramChatId, setTelegramChatId] = useState<string>("");

  const [notifTypes, setNotifTypes] = useState<AdminNotifTypesState>({
    newDoctor: true,
    workerErrors: true,
    dailyAudit: false,
  });

  const [privacy, setPrivacy] = useState<PrivacyState>({
    twoFactor: true,
  });

  const handleSave = (): void => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const noChannelActive = !notifChannels.email && !notifChannels.telegram;

  return (
    <div className="bg-surface font-sans flex flex-col min-h-screen w-full">
      <main className="max-w-4xl mx-auto px-6 py-6 w-full flex-1 flex flex-col">
        
        {/* HEADER: Padrão WorkerLogs, sem a barra inteira no fundo */}
        <header className="flex flex-col gap-4 mb-8">
          <Button
            size="sm"
            variant="ghost"
            onPress={() => navigate(-1)}
            className="w-fit flex items-center gap-2 text-text-muted hover:text-text-primary px-0 hover:bg-transparent"
          >
            <ArrowLeft size={16} />
            Voltar para o Dashboard
          </Button>
          <h1 className="text-2xl font-bold text-text-primary">Configurações Globais</h1>
        </header>

        <Section
          title="Canais de notificação"
          description="Escolha por onde deseja receber alertas críticos do sistema administrativo."
        >
          <Field
            horizontal
            label="E-mail"
            description="Notificações enviadas para o e-mail administrativo."
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
            description="Receba alertas do servidor e do banco de dados via bot no Telegram."
          >
            <div className="flex items-center gap-3">
              {(!telegramChatId && notifChannels.telegram) ? (
                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-zinc-700/50 text-zinc-400">
                  Aguardando Chat ID
                </span>
              ) : !notifChannels.telegram ? (
                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-zinc-700/50 text-zinc-400">
                  Não configurado
                </span>
              ) : null}
              <Toggle
                checked={notifChannels.telegram}
                onChange={(v) => setNotifChannels((n) => ({ ...n, telegram: v }))}
                label="Telegram"
              />
            </div>
          </Field>

          {notifChannels.telegram && (
            <Field
              label="Telegram Chat ID do Grupo de TI"
              description={
                <>
                  Adicione o{" "}
                  <a
                    href="#"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-color underline underline-offset-2 font-medium"
                  >
                    @MedoraAdminBot
                  </a>{" "}
                  ao grupo da sua equipe para obter o Chat ID.
                </>
              }
            >
              <Input
                placeholder="Ex: -100123456789"
                value={telegramChatId}
                onChange={(e) => setTelegramChatId(e.target.value)}
                className="max-w-md"
              />
            </Field>
          )}
        </Section>

        <Section
          title="Eventos e Alertas"
          description="Selecione os eventos do sistema que devem acionar um alerta imediato."
        >
          <Field
            horizontal
            label="Novos cadastros de médicos"
            description="Notificar quando um médico se cadastrar e aguardar validação de CRM."
          >
            <Toggle
              checked={notifTypes.newDoctor}
              onChange={(v) => setNotifTypes((n) => ({ ...n, newDoctor: v }))}
              label="Novos cadastros"
            />
          </Field>
          <Field
            horizontal
            label="Falhas críticas no Worker"
            description="Enviar alerta imediato quando um processo em segundo plano falhar."
          >
            <Toggle
              checked={notifTypes.workerErrors}
              onChange={(v) => setNotifTypes((n) => ({ ...n, workerErrors: v }))}
              label="Falhas no Worker"
            />
          </Field>
          <Field
            horizontal
            label="Resumo de auditoria diário"
            description="Receber um relatório com as métricas do dia."
          >
            <Toggle
              checked={notifTypes.dailyAudit}
              onChange={(v) => setNotifTypes((n) => ({ ...n, dailyAudit: v }))}
              label="Resumo diário"
            />
          </Field>

          {notifTypes.dailyAudit && (
            <Field
              label="Horário do Relatório"
              description="Escolha o horário para recebimento do resumo diário."
            >
              <Select
                value="20"
                onChange={() => { }}
                options={[
                  { value: "08", label: "08:00 (Início do expediente)" },
                  { value: "12", label: "12:00 (Meio dia)" },
                  { value: "18", label: "18:00 (Fim comercial)" },
                  { value: "20", label: "20:00 (Fechamento)" },
                  { value: "23", label: "23:59 (Fim do dia)" },
                ]}
              />
            </Field>
          )}

          <div
            aria-hidden={!noChannelActive}
            className={`grid transition-all duration-200 ${
              noChannelActive ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0 pointer-events-none"
            }`}
          >
            <div className="overflow-hidden">
              <div className="flex items-start gap-3 px-5 py-4 rounded-xl bg-orange-500/10 border border-orange-500/20 mt-2">
                <TriangleAlert size={20} className="text-orange-500 shrink-0" />
                <p className="text-sm text-orange-700 dark:text-orange-400 font-medium leading-relaxed">
                  Nenhum canal de notificação está ativo. Ative ao menos um canal para receber alertas de infraestrutura.
                </p>
              </div>
            </div>
          </div>
        </Section>

        <Section
          title="Segurança"
          description="Políticas de acesso para contas de nível administrativo."
        >
          <Field
            horizontal
            label="Autenticação em dois fatores (2FA)"
            description="Adicionar camada obrigatória de segurança no painel admin."
          >
            <div className="flex items-center gap-3">
              {!privacy.twoFactor && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold text-orange-700 dark:text-orange-300 bg-orange-500/20">
                  Obrigatório
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

        <div className="mt-auto pt-4 pb-4 flex items-center justify-between border-t border-divider">
          <p className="text-xs text-text-muted">Última atualização do sistema: 18 de jun. de 2026</p>
          <div className="flex items-center gap-3">
            {saved && (
              <span className="text-xs text-green-500 font-bold flex items-center gap-1">
                <Check size={16} />
                Salvo com sucesso
              </span>
            )}
            <Button variant="ghost" size="sm" onClick={() => {}}>Cancelar</Button>
            <Button className="bg-primary-color text-white font-bold shadow-sm" size="sm" onClick={handleSave}>
              Salvar alterações
            </Button>
          </div>
        </div>

      </main>
    </div>
  );
}