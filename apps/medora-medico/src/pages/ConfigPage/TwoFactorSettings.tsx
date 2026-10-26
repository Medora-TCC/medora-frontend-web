import { Button, Input, Modal, useOverlayState } from "@heroui/react";
import { Check, Copy } from "lucide-react";
import { useState, type ReactNode } from "react";
import MfaService from "../../api/services/Mfa";
import { errorMessage } from "../../api/errors";

// O backend responde 409 quando o usuário já tem um app autenticador ativo
const ALREADY_CONFIGURED = "Usuário já possui um aplicativo autenticador ativo configurado.";

function totpSecret(totpUri: string): string {
  // alguns apps recusam a chave com o padding "=" do base32
  return (new URL(totpUri).searchParams.get("secret") ?? "").replace(/=+$/, "");
}

interface DialogProps {
  state: ReturnType<typeof useOverlayState>;
  title: string;
  children: ReactNode;
  footer: ReactNode;
}

const Dialog = ({ state, title, children, footer }: DialogProps) => (
  <Modal isOpen={state.isOpen} onOpenChange={state.setOpen}>
    <Modal.Backdrop>
      <Modal.Container>
        <Modal.Dialog className="bg-surface">
          <Modal.CloseTrigger />
          <Modal.Header>
            <Modal.Heading className="text-lg font-semibold text-text-primary">{title}</Modal.Heading>
          </Modal.Header>
          <Modal.Body className="space-y-4">{children}</Modal.Body>
          <Modal.Footer className="flex gap-2">{footer}</Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  </Modal>
);

function AuthenticatorSetup() {
  const modal = useOverlayState();
  const [totpUri, setTotpUri] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConfigured, setIsConfigured] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const start = async () => {
    setIsLoading(true);
    setNotice(null);
    try {
      setTotpUri(await MfaService.configureAuthenticator());
      setCode("");
      setError(null);
      modal.open();
    } catch (err) {
      const message = errorMessage(err, "Erro ao iniciar a configuração.");
      if (message === ALREADY_CONFIGURED) setIsConfigured(true);
      setNotice(message);
    } finally {
      setIsLoading(false);
    }
  };

  const verify = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await MfaService.verifyAuthenticator(code);
      setIsConfigured(true);
      setNotice("Aplicativo autenticador ativado. Gere seus códigos de backup.");
      modal.close();
    } catch (err) {
      setError(errorMessage(err, "Código inválido."));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      {isConfigured ? (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-success-text">
          <Check size={14} /> Ativo
        </span>
      ) : (
        <Button size="sm" variant="secondary" isDisabled={isLoading} onPress={start}>
          Configurar
        </Button>
      )}
      {notice && <p className="text-xs text-text-secondary max-w-56 text-right">{notice}</p>}

      <Dialog
        state={modal}
        title="Configurar aplicativo autenticador"
        footer={
          <Button variant="primary" className="w-full" isDisabled={isLoading || code.length < 6} onPress={verify}>
            {isLoading ? "Verificando…" : "Ativar"}
          </Button>
        }
      >
        <p className="text-sm text-text-secondary">
          No Google Authenticator, Microsoft Authenticator ou similar, adicione uma conta com a chave abaixo
          (ou toque no link pelo celular). Depois digite o código de 6 dígitos que aparecer no app.
        </p>
        {totpUri && (
          <div className="rounded-lg border border-border bg-surface-alt p-3 space-y-1">
            <p className="text-xs text-text-muted">Chave</p>
            <p className="font-mono text-sm break-all text-text-primary">{totpSecret(totpUri)}</p>
            <a href={totpUri} className="text-xs text-primary underline underline-offset-2">Abrir no app autenticador</a>
          </div>
        )}
        <Input
          placeholder="000000"
          inputMode="numeric"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
        />
        <p className="text-xs text-text-muted">A chave expira em 10 minutos.</p>
        {error && <p className="text-sm text-danger">{error}</p>}
      </Dialog>
    </div>
  );
}

function BackupCodesGenerator() {
  const modal = useOverlayState();
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [codes, setCodes] = useState<string[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const start = async () => {
    setIsLoading(true);
    setError(null);
    setCode("");
    setCodes(null);
    setCopied(false);
    try {
      const res = await MfaService.initiateBackupCodes();
      setSentTo(res.useAuthenticationApp ? null : res.sentTo);
      modal.open();
    } catch (err) {
      setError(errorMessage(err, "Erro ao iniciar a geração dos códigos."));
    } finally {
      setIsLoading(false);
    }
  };

  const generate = async () => {
    setIsLoading(true);
    setError(null);
    try {
      setCodes(await MfaService.createBackupCodes(code));
    } catch (err) {
      setError(errorMessage(err, "Código inválido."));
    } finally {
      setIsLoading(false);
    }
  };

  const copy = async () => {
    if (!codes) return;
    await navigator.clipboard.writeText(codes.join("\n"));
    setCopied(true);
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <Button size="sm" variant="secondary" isDisabled={isLoading} onPress={start}>
        Gerar códigos
      </Button>
      {error && !modal.isOpen && <p className="text-xs text-danger max-w-56 text-right">{error}</p>}

      <Dialog
        state={modal}
        title="Códigos de backup"
        footer={
          codes ? (
            <Button variant="primary" className="w-full" onPress={modal.close}>Guardei os códigos</Button>
          ) : (
            <Button variant="primary" className="w-full" isDisabled={isLoading || code.length < 6} onPress={generate}>
              {isLoading ? "Gerando…" : "Gerar"}
            </Button>
          )
        }
      >
        {codes ? (
          <>
            <p className="text-sm text-text-secondary">
              Guarde estes códigos em um lugar seguro. Cada um pode ser usado uma vez para entrar sem o código de
              verificação, e eles não serão mostrados de novo.
            </p>
            <ul className="grid grid-cols-2 gap-2 rounded-lg border border-border bg-surface-alt p-3 font-mono text-xs text-text-primary">
              {codes.map((c) => <li key={c} className="break-all">{c}</li>)}
            </ul>
            <Button size="sm" variant="secondary" onPress={copy}>
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? "Copiado" : "Copiar todos"}
            </Button>
          </>
        ) : (
          <>
            <p className="text-sm text-text-secondary">
              {sentTo
                ? `Enviamos um código de verificação para ${sentTo}. Digite-o abaixo.`
                : "Digite o código de 6 dígitos do seu aplicativo autenticador."}
            </p>
            <Input
              placeholder="000000"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            />
            {error && <p className="text-sm text-danger">{error}</p>}
          </>
        )}
      </Dialog>
    </div>
  );
}

export { AuthenticatorSetup, BackupCodesGenerator };
