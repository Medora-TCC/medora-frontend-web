import { Button, Modal, Spinner } from "@heroui/react";
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

export default function TermosUsoModal({
  isOpen,
  onOpenChange,
  onAccept,
  onDecline,
  version = "v2.4.1",
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
          <Modal.Dialog className="!max-w-xl w-full">
            <div className="relative flex flex-col rounded-2xl bg-zinc-900 border border-zinc-700/50 shadow-2xl overflow-hidden max-h-[88vh]">

              {/* Header */}
              <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-zinc-800 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20">
                    <ScrollText className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white leading-tight">
                      Termos de Uso
                    </h2>
                    <p className="text-[11px] text-zinc-500 mt-0.5">
                      Medora Plataforma de Saúde &mdash; {version}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleDecline}
                  className="flex items-center justify-center w-8 h-8 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scroll hint */}
              {!hasScrolled && (
                <div className="flex items-center justify-between px-6 py-2 bg-amber-500/5 border-b border-amber-500/10 shrink-0">
                  <p className="text-xs text-amber-400/80">
                    Leia os termos por completo para continuar
                  </p>
                  <button
                    onClick={scrollToBottom}
                    className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 transition-colors"
                  >
                    Ir ao final
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </div>
              )}

              {/* Scrollable content */}
              <div
                ref={scrollRef}
                onScroll={handleScroll}
                className="overflow-y-auto flex-1 px-6 py-5"
              >
                {/* Intro */}
                <p className="text-sm text-zinc-400 leading-relaxed mb-6">
                  Ao utilizar a plataforma Medora, você concorda com os termos e
                  condições descritos abaixo. Leia atentamente antes de prosseguir.
                  Última atualização:{" "}
                  <span className="text-zinc-300">15 de maio de 2025</span>.
                </p>

                <div className="space-y-5">
                  {SECTIONS.map(({ icon: Icon, title, body }) => (
                    <div
                      key={title}
                      className="rounded-xl bg-zinc-800/50 border border-zinc-700/30 px-4 py-4"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                        <p className="text-sm font-semibold text-white">{title}</p>
                      </div>
                      <p className="text-sm text-zinc-400 leading-relaxed">{body}</p>
                    </div>
                  ))}
                </div>

                {/* End marker */}
                <div className="flex items-center gap-2 mt-6 pt-5 border-t border-zinc-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <p className="text-xs text-zinc-500">
                    Fim do documento &mdash; {version} &mdash; Medora Saúde Ltda.
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="shrink-0 px-6 py-4 border-t border-zinc-800 bg-zinc-900/80 backdrop-blur-sm space-y-4">
                {/* Checkbox */}
                <label
                  className={`flex items-start gap-3 cursor-pointer group ${
                    !hasScrolled ? "opacity-40 pointer-events-none" : ""
                  }`}
                >
                  <div className="relative mt-0.5">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => setChecked(e.target.checked)}
                      className="sr-only"
                    />
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                        checked
                          ? "bg-blue-600 border-blue-600"
                          : "border-zinc-600 bg-zinc-800 group-hover:border-zinc-500"
                      }`}
                    >
                      {checked && (
                        <svg
                          className="w-2.5 h-2.5 text-white"
                          viewBox="0 0 10 8"
                          fill="none"
                        >
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
                  <span className="text-sm text-zinc-400 leading-snug">
                    Li e concordo com os{" "}
                    <span className="text-white font-medium">Termos de Uso</span> e a{" "}
                    <span className="text-white font-medium">
                      Política de Privacidade
                    </span>{" "}
                    da Medora.
                  </span>
                </label>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2">
                  <Button
                    size="sm"
                    onPress={handleDecline}
                    className="text-xs font-medium text-zinc-400 bg-zinc-800 border border-zinc-700/50 hover:bg-zinc-700 hover:text-white"
                  >
                    Recusar
                  </Button>

                  <Button
                    size="sm"
                    isDisabled={!canAccept || loading}
                    onPress={handleAccept}
                    className={`text-xs font-semibold border-0 transition-all ${
                      canAccept
                        ? "bg-blue-600 hover:bg-blue-500 text-white"
                        : "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                    }`}
                  >
                    {loading ? "Confirmando…" : "Aceitar e continuar"}
                  </Button>
                </div>
              </div>
            </div>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}