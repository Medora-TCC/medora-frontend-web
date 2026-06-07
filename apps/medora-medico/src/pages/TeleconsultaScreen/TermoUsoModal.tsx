import { Modal, Button, Spinner } from "@heroui/react";
import { useState, useRef, useEffect } from "react";
import {
  ScrollText,
  X,
  CheckCircle2,
  Shield,
  Lock,
  FileText,
  AlertTriangle,
  ChevronDown,
} from "lucide-react";

interface TermosUsoModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAccept?: () => void;
  onDecline?: () => void;
  version?: string;
  consultaId: string;
}

const SECTIONS = [
  {
    icon: Shield,
    title: "1. Uso da plataforma",
    body: "A plataforma Medora é destinada exclusivamente a profissionais de saúde habilitados e pacientes devidamente cadastrados. O acesso é pessoal e intransferível. É vedado o compartilhamento de credenciais ou o uso por terceiros não autorizados.",
  },
  {
    icon: Lock,
    title: "2. Privacidade e dados",
    body: "Todos os dados pessoais e de saúde são tratados conforme a Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018) e demais normas aplicáveis. As informações coletadas são utilizadas exclusivamente para a prestação dos serviços médicos e não serão compartilhadas com terceiros sem consentimento expresso, salvo obrigação legal.",
  },
  {
    icon: FileText,
    title: "3. Prontuário eletrônico",
    body: "O prontuário eletrônico gerado na plataforma é de responsabilidade do profissional de saúde e deve refletir fielmente as informações clínicas do atendimento. A Medora não se responsabiliza por imprecisões inseridas pelos usuários.",
  },
  {
    icon: AlertTriangle,
    title: "4. Limitações de responsabilidade",
    body: "A Medora não substitui o julgamento clínico do profissional de saúde. As ferramentas de suporte à decisão são auxiliares e não constituem diagnóstico ou prescrição. O usuário é inteiramente responsável pelas decisões tomadas com base nas informações exibidas.",
  },
  {
    icon: ScrollText,
    title: "5. Alterações nos termos",
    body: "A Medora reserva-se o direito de atualizar estes termos a qualquer momento. Em caso de alterações relevantes, os usuários serão notificados com antecedência mínima de 15 dias. O uso continuado da plataforma após a notificação implica a aceitação dos novos termos.",
  },
];

export default function TermoUsoModal({
  isOpen,
  onOpenChange,
  onAccept,
  onDecline,
  version = "v2.4.1",
  consultaId
}: TermosUsoModalProps) {
  const [hasScrolled, setHasScrolled] = useState(false);
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setHasScrolled(false);
      setChecked(false);
      setLoading(false);
    }
  }, [isOpen]);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 40;
    if (nearBottom) setHasScrolled(true);
  };

  const handleAccept = async () => {
    if (!checked) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    onAccept?.();
    onOpenChange(false);
  };

  const handleDecline = () => {
    onDecline?.();
    onOpenChange(false);
  };

  const scrollToBottom = () => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  };

  const canAccept = hasScrolled && checked;

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <Modal.Backdrop>
        <Modal.Container>
          <Modal.Dialog className="max-w-xl w-full bg-surface border border-ring rounded-2xl overflow-hidden">

            {/* Header */}
            <Modal.Header className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-ring">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-accent/10 border border-accent-soft-hover">
                  <ScrollText className="w-4 h-4 text-accent" />
                </div>
                <div>
                  <Modal.Heading className="text-base font-bold text-text-primary leading-tight">
                    Termos de Uso
                  </Modal.Heading>
                  <p className="text-[11px] text-text-secondary mt-0.5">
                    Medora Plataforma de Saúde &mdash; {version}
                  </p>
                  <p className="text-[11px] text-text-secondary mt-0.5">
                    Consulta: {consultaId}
                  </p>
                </div>
              </div>
              <Modal.CloseTrigger>
                <Button
                  isIconOnly
                  size="sm"
                  onPress={handleDecline}
                  className="flex items-center justify-center w-8 h-8 rounded-lg text-text-primary bg-surface hover:text-surface hover:bg-text-primary hover:cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                </Button>
              </Modal.CloseTrigger>
            </Modal.Header>

            {/* Scroll hint */}
            {!hasScrolled && (
              <div className="flex items-center justify-between px-6 py-2 bg-warning-subtle border-b border-warning">
                <p className="text-xs text-warning-text">
                  Leia os termos por completo para continuar
                </p>
                <Button
                  size="sm"
                  onPress={scrollToBottom}
                  className="text-xs text-warning-text bg-transparent border-0 h-7 px-2 hover:bg-warning/50 transition"
                >
                  Ir ao final <ChevronDown className="w-3 h-3 ml-1" />
                </Button>
              </div>
            )}

            {/* Body */}
            <Modal.Body className="p-0">
              <div
                ref={scrollRef}
                onScroll={handleScroll}
                className="overflow-y-auto px-6 py-5 max-h-[50vh]"
              >
                <p className="text-sm text-text-primary leading-relaxed mb-6">
                  Ao utilizar a plataforma Medora, você concorda com os termos e
                  condições descritos abaixo. Leia atentamente antes de prosseguir.
                  Última atualização:{" "}
                  <span className="text-text-primary">15 de maio de 2025</span>.
                </p>

                <div className="space-y-4">
                  {SECTIONS.map(({ icon: Icon, title, body }) => (
                    <div
                      key={title}
                      className="rounded-xl bg-surface-raised border border-ring px-4 py-4"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className="w-3.5 h-3.5 text-accent shrink-0" />
                        <p className="text-sm font-semibold text-text-primary">{title}</p>
                      </div>
                      <p className="text-sm text-text-primary leading-relaxed">{body}</p>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 mt-6 pt-5">
                  <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                  <p className="text-xs text-text-primary">
                    Fim do documento &mdash; {version} &mdash; Medora Saúde Ltda.
                  </p>
                </div>
              </div>
            </Modal.Body>

            {/* Footer */}
            <Modal.Footer className="flex-col items-stretch gap-4 px-6 py-4 border-t border-ring">
              {/* Checkbox nativo — sem conflito com HeroUI */}
              <label
                className={`flex items-start gap-3 cursor-pointer group ${
                  !hasScrolled ? "opacity-40 pointer-events-none" : ""
                }`}
              >
                <div className="relative mt-0.5 shrink-0">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => setChecked(e.target.checked)}
                    className="sr-only"
                  />
                  <div
                    className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                      checked
                        ? "bg-accent border-ring"
                        : "border-ring bg-surface-overlay group-hover:border-accent"
                    }`}
                  >
                    {checked && (
                      <svg className="w-2.5 h-2.5 text-surface" viewBox="0 0 10 8" fill="none">
                        <path
                          d="M1 4l3 3 5-6"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="text-sm text-text-primary leading-snug">
                  Li e concordo com os{" "}
                  <span className="text-accent font-medium">Termos de Uso</span> e a{" "}
                  <span className="text-accent font-medium">Política de Privacidade</span>{" "}
                  da Medora.
                </span>
              </label>

              <div className="flex items-center justify-end gap-2">
                <Button
                  size="sm"
                  onPress={handleDecline}
                  className="text-xs font-medium text-text-primary bg-surface-alt border border-ring hover:bg-text-primary/10"
                >
                  Recusar
                </Button>

                <Button
                  size="sm"
                  isDisabled={!canAccept || loading}
                  onPress={handleAccept}
                  className={`text-xs font-semibold ${
                    canAccept
                      ? "bg-blue-600 text-white hover:bg-blue-500"
                      : "bg-zinc-800 text-zinc-600"
                  }`}
                >
                  {loading ? (
                    <Spinner size="sm" />
                  ) : (
                    <>
                      {canAccept && <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />}
                      Aceitar e continuar
                    </>
                  )}
                </Button>
              </div>
            </Modal.Footer>

          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}