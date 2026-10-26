import { useEffect, useState } from "react";
import { useOverlayState } from "@heroui/react";
import {
  Wallet,
  TrendingUp,
  Lock,
  Building2,
  CheckCircle2,
  Clock,
  ArrowDownRight,
  MinusCircle,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react";
import { BankAccountModal } from "./BankModal";
import { getMyPayoutClosing, getMyPayoutStatement } from "../../api/services/PayoutService";
import { errorMessage } from "../../api/errors";
import type {
  PayoutClosingDetailDto,
  PayoutClosingStatus,
  PayoutClosingSummaryDto,
  PayoutLineStatus,
  PayoutStatementDto,
  PayoutStatementLineDto,
} from "../../api/dtos/Payouts/PayoutDto";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const formatMoney = (value: number) => currency.format(value);
const formatDate = (iso: string) => new Date(iso).toLocaleDateString("pt-BR");
const formatMonth = (isoDate: string) => {
  const [year, month] = isoDate.split("-").map(Number);
  const label = new Date(year, month - 1, 1).toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  return label.charAt(0).toUpperCase() + label.slice(1);
};

const lineStatus: Record<PayoutLineStatus, { label: string; color: string; bg: string; border: string }> = {
  ToReceive: { label: "Aguardando conclusão", color: "#3B82F6", bg: "#EFF6FF", border: "#BFDBFE" },
  Eligible:  { label: "Próximo repasse",      color: "#8B5CF6", bg: "#F5F3FF", border: "#DDD6FE" },
  Held:      { label: "Retido",               color: "#F97316", bg: "#FFF7ED", border: "#FED7AA" },
  InClosing: { label: "Em fechamento",        color: "#0EA5E9", bg: "#F0F9FF", border: "#BAE6FD" },
  Paid:      { label: "Pago",                 color: "#059669", bg: "#ECFDF5", border: "#D1FAE5" },
  Canceled:  { label: "Estornado",            color: "#6B7280", bg: "#F3F4F6", border: "#E5E7EB" },
};

const closingStatus: Record<PayoutClosingStatus, string> = {
  PendingApproval: "Em análise",
  Approved: "Aprovado",
  Paid: "Pago",
};

export default function FinancialManagement() {
  const modal = useOverlayState({ defaultOpen: false });
  const [statement, setStatement] = useState<PayoutStatementDto | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getMyPayoutStatement()
      .then(setStatement)
      .catch((e) => setError(errorMessage(e, "Erro ao carregar seus ganhos.")));
  }, []);

  const toReceive = statement
    ? statement.toReceiveAmount + statement.eligibleAmount + statement.inClosingAmount
    : 0;

  return (
    <div className="min-h-screen bg-surface font-[Inter,system-ui,sans-serif]">
      <main className="max-w-7xl mx-auto px-6 py-6">

        <header className="flex justify-between items-start flex-wrap gap-3 mb-6">
          <div>
            <h1 className="m-0 text-[22px] font-bold text-text-primary">
              Gestão Financeira
            </h1>
            <p className="mt-1 mb-0 text-xs text-text-secondary">
              Repasses das teleconsultas, fechados mensalmente até o 5º dia útil do mês seguinte.
            </p>
          </div>

          <div className="flex gap-2 items-center">
            <button
              onClick={modal.open}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg cursor-pointer text-[13px] font-semibold text-accent bg-transparent border-[1.5px] border-accent hover:bg-surface-overlay transition-colors"
            >
              <Building2 size={15} />
              Vincular Conta Bancária
            </button>
          </div>
        </header>

        {error && (
          <p className="mb-4 px-4 py-3 rounded-lg text-[13px] bg-[#FEF2F2] text-[#B91C1C] border border-[#FECACA]">
            {error}
          </p>
        )}

        {!statement && !error && (
          <div className="flex items-center gap-2 text-text-secondary text-[13px]">
            <Loader2 size={16} className="animate-spin" /> Carregando seus ganhos…
          </div>
        )}

        {statement && (
          <>
            <div className="grid gap-3 mb-5" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
              <StatBox
                icon={<Wallet size={20} color="#10B981" />}
                label="Total Recebido"
                value={formatMoney(statement.paidAmount)}
                subtext="Repasses já pagos"
                iconBg="#ECFDF5"
                iconBorder="#D1FAE5"
              />
              <StatBox
                icon={<TrendingUp size={20} color="#3B82F6" />}
                label="A Receber"
                value={formatMoney(toReceive)}
                subtext={`${formatMoney(statement.eligibleAmount + statement.inClosingAmount)} no próximo repasse`}
                iconBg="#EFF6FF"
                iconBorder="#BFDBFE"
              />
              <StatBox
                icon={<Lock size={20} color="#F97316" />}
                label="Retido"
                value={formatMoney(statement.heldAmount)}
                subtext="Em análise pela plataforma"
                iconBg="#FFF7ED"
                iconBorder="#FED7AA"
              />
              {statement.pendingDebitAmount > 0 && (
                <StatBox
                  icon={<MinusCircle size={20} color="#DC2626" />}
                  label="Débito Pendente"
                  value={formatMoney(statement.pendingDebitAmount)}
                  subtext="Estornos descontados no próximo repasse"
                  iconBg="#FEF2F2"
                  iconBorder="#FECACA"
                />
              )}
            </div>

            <div className="grid gap-4 items-start" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))" }}>
              <Panel title="Teleconsultas" subtitle="Situação do repasse de cada consulta paga">
                {statement.lines.length === 0 && <EmptyRow text="Nenhuma teleconsulta paga ainda." />}
                {statement.lines.map((line, i) => (
                  <LineItem key={line.appointmentId} line={line} isLast={i === statement.lines.length - 1} />
                ))}
              </Panel>

              <Panel title="Fechamentos" subtitle="Repasses mensais">
                {statement.closings.length === 0 && <EmptyRow text="Nenhum fechamento ainda." />}
                {statement.closings.map((closing, i) => (
                  <ClosingItem key={closing.id} closing={closing} isLast={i === statement.closings.length - 1} />
                ))}
              </Panel>
            </div>
          </>
        )}
      </main>

      <BankAccountModal isOpen={modal.isOpen} onOpenChange={modal.setOpen} />
    </div>
  );
}

function Panel({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="bg-surface-alt rounded-xl border border-ring overflow-hidden shadow-sm">
      <div className="px-4 py-3.5 border-b border-ring">
        <p className="m-0 text-[15px] font-bold text-text-primary">{title}</p>
        <p className="mt-0.5 mb-0 text-xs text-text-secondary">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}

function EmptyRow({ text }: { text: string }) {
  return <p className="m-0 px-4 py-6 text-center text-[13px] text-text-secondary">{text}</p>;
}

function StatBox({
  icon,
  label,
  value,
  subtext,
  iconBg,
  iconBorder,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtext: string;
  iconBg: string;
  iconBorder: string;
}) {
  return (
    <div className="bg-surface-alt rounded-xl border border-ring px-4 py-3.5 flex items-center gap-3.5 shadow-sm">
      <div
        className="w-10 h-10 rounded-[10px] shrink-0 flex items-center justify-center"
        style={{ background: iconBg, border: `1px solid ${iconBorder}` }}
      >
        {icon}
      </div>
      <div>
        <p className="m-0 text-[10px] font-bold text-text-secondary uppercase tracking-[0.07em]">
          {label}
        </p>
        <p className="my-0.5 text-[20px] font-extrabold text-text-primary leading-none">
          {value}
        </p>
        <p className="m-0 text-[11px] text-text-secondary">{subtext}</p>
      </div>
    </div>
  );
}

function LineItem({ line, isLast }: { line: PayoutStatementLineDto; isLast: boolean }) {
  const style = lineStatus[line.status];
  const paid = line.status === "Paid";

  return (
    <div className={["flex items-center justify-between px-4 py-3", isLast ? "" : "border-b border-ring"].join(" ")}>
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-[9px] shrink-0 flex items-center justify-center"
          style={{ background: style.bg, border: `1px solid ${style.border}` }}
        >
          {paid ? <ArrowDownRight size={16} color={style.color} /> : <Clock size={16} color={style.color} />}
        </div>
        <div>
          {/* Sem nome do paciente de propósito: o extrato traz só o necessário para o repasse (LGPD). */}
          <p className="m-0 text-[13px] font-semibold text-text-primary">Teleconsulta #{line.appointmentId}</p>
          <p className="mt-0.5 mb-0 text-[11px] text-text-secondary">
            {formatDate(line.appointmentStartDateTime)}
            {line.refundedAfterCredit && " · estornada depois do repasse"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <span
          className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-[0.04em] flex items-center gap-0.5"
          style={{ background: style.bg, color: style.color }}
        >
          {paid && <CheckCircle2 size={10} />}
          {style.label}
        </span>
        <span className="text-[13px] font-bold text-text-primary min-w-19 text-right">
          {formatMoney(line.amount)}
        </span>
      </div>
    </div>
  );
}

function ClosingItem({ closing, isLast }: { closing: PayoutClosingSummaryDto; isLast: boolean }) {
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState<PayoutClosingDetailDto | null>(null);
  const [error, setError] = useState<string | null>(null);

  function toggle() {
    setOpen((value) => !value);

    if (!detail) {
      getMyPayoutClosing(closing.id)
        .then(setDetail)
        .catch((e) => setError(errorMessage(e, "Erro ao carregar o fechamento.")));
    }
  }

  return (
    <div className={isLast ? "" : "border-b border-ring"}>
      <button
        onClick={toggle}
        className="w-full flex items-center justify-between px-4 py-3 bg-transparent border-none cursor-pointer text-left"
      >
        <div>
          <p className="m-0 text-[13px] font-semibold text-text-primary">{formatMonth(closing.referenceMonth)}</p>
          <p className="mt-0.5 mb-0 text-[11px] text-text-secondary">
            {closingStatus[closing.status]}
            {closing.paidAt && ` em ${formatDate(closing.paidAt)}`}
            {closing.paymentReference && ` · ref. ${closing.paymentReference}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-bold text-text-primary">{formatMoney(closing.totalAmount)}</span>
          {open ? <ChevronUp size={16} className="text-text-secondary" /> : <ChevronDown size={16} className="text-text-secondary" />}
        </div>
      </button>

      {open && (
        <div className="px-4 pb-3">
          {error && <p className="m-0 text-[12px] text-[#B91C1C]">{error}</p>}
          {!detail && !error && <p className="m-0 text-[12px] text-text-secondary">Carregando…</p>}
          {detail?.items.map((item) => (
            <div key={`${item.paymentId}-${item.type}`} className="flex justify-between py-1 text-[12px] text-text-secondary">
              <span>
                {item.type === "Debit" ? "Estorno · " : ""}Teleconsulta #{item.appointmentId} · {formatDate(item.appointmentStartDateTime)}
              </span>
              <span className={item.type === "Debit" ? "text-[#DC2626] font-semibold" : "font-semibold"}>
                {item.type === "Debit" ? "−" : ""}{formatMoney(item.amount)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
