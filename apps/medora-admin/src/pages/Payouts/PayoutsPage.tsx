import { useCallback, useEffect, useState } from "react";
import { Button } from "@heroui/react";
import { AlertTriangle, Banknote, CheckCircle2, ChevronDown, ChevronUp, Lock, MessageSquareWarning, Undo2, Unlock, Trash2 } from "lucide-react";
import {
  approveClosing,
  discardClosing,
  generateClosings,
  getAttention,
  getClosing,
  getPreview,
  holdPayout,
  listClosings,
  markClosingAsPaid,
  refundIssuePatient,
  releaseIssuePayout,
  releasePayout,
  type AppointmentIssueReason,
  type PayoutAttentionItem,
  type PayoutClosingDetail,
  type PayoutClosingStatus,
  type PayoutClosingSummary,
  type PayoutPreviewItem,
} from "../../api/payouts";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const money = (value: number) => currency.format(value);
const date = (iso: string) => new Date(iso).toLocaleDateString("pt-BR");

const statusLabel: Record<PayoutClosingStatus, { label: string; className: string }> = {
  PendingApproval: { label: "Aguardando aprovação", className: "bg-amber-100 text-amber-700" },
  Approved: { label: "Aprovado", className: "bg-blue-100 text-blue-700" },
  Paid: { label: "Pago", className: "bg-emerald-100 text-emerald-700" },
};

const issueLabel: Record<AppointmentIssueReason, string> = {
  DoctorNoShow: "Médico não compareceu",
  CallDropped: "Chamada caiu",
  AudioOrVideoProblem: "Problema de áudio ou vídeo",
  DoctorLate: "Médico atrasou muito",
  EndedEarly: "Consulta encerrada antes do tempo",
};

function previousMonth() {
  const now = new Date();
  const d = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default function PayoutsPage() {
  const [month, setMonth] = useState(previousMonth);
  const [preview, setPreview] = useState<PayoutPreviewItem[]>([]);
  const [closings, setClosings] = useState<PayoutClosingSummary[]>([]);
  const [attention, setAttention] = useState<PayoutAttentionItem[]>([]);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const [p, c, a] = await Promise.all([getPreview(month), listClosings(month), getAttention()]);
      setPreview(p);
      setClosings(c);
      setAttention(a);
    } catch (error) {
      setMessage({ type: "error", text: (error as Error).message });
    }
  }, [month]);

  useEffect(() => {
    load();
  }, [load]);

  async function run(action: () => Promise<unknown>, success: string) {
    setBusy(true);
    setMessage(null);
    try {
      await action();
      setMessage({ type: "success", text: success });
      await load();
    } catch (error) {
      setMessage({ type: "error", text: (error as Error).message });
    } finally {
      setBusy(false);
    }
  }

  const pendingTotal = preview.filter((p) => !p.alreadyClosed && p.totalAmount > 0).reduce((sum, p) => sum + p.totalAmount, 0);

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <main className="py-4 px-6 space-y-5 max-w-7xl mx-auto w-full">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
              <Banknote className="text-emerald-500" />
              Repasses aos Médicos
            </h1>
            <p className="text-sm text-text-muted mt-1">
              Fechamento mensal das teleconsultas concluídas, até o 5º dia útil do mês seguinte. O pagamento é simulado.
            </p>
          </div>
          <label className="flex flex-col gap-1 text-xs font-semibold text-text-muted">
            Mês de referência
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="px-3 py-2 rounded-lg border border-divider bg-surface-alt text-text-primary text-sm"
            />
          </label>
        </header>

        {message && (
          <p className={`px-4 py-3 rounded-lg text-sm ${message.type === "error" ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"}`}>
            {message.text}
          </p>
        )}

        <Section
          title="Prévia do mês"
          subtitle="O que cada médico receberia se o fechamento fosse gerado agora"
          action={
            <Button
              size="sm"
              className="bg-primary-color text-white font-semibold rounded-lg"
              isDisabled={busy || pendingTotal <= 0}
              onPress={() => run(() => generateClosings(month), "Fechamentos gerados. Revise e aprove cada um.")}
            >
              Gerar fechamentos ({money(pendingTotal)})
            </Button>
          }
        >
          {preview.length === 0 ? (
            <Empty text="Nenhum valor a repassar neste mês." />
          ) : (
            <table className="w-full text-sm">
              <thead className="text-xs text-text-muted uppercase">
                <tr>
                  <Th>Médico</Th><Th right>Consultas</Th><Th right>Créditos</Th><Th right>Estornos</Th><Th right>Total</Th><Th>Situação</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-divider">
                {preview.map((p) => (
                  <tr key={p.doctorId}>
                    <Td>{p.doctorName}</Td>
                    <Td right>{p.creditCount}</Td>
                    <Td right>{money(p.creditAmount)}</Td>
                    <Td right>{p.debitAmount > 0 ? `− ${money(p.debitAmount)}` : "—"}</Td>
                    <Td right><strong>{money(p.totalAmount)}</strong></Td>
                    <Td>
                      {p.alreadyClosed
                        ? <span className="text-text-muted">Já fechado neste mês</span>
                        : p.totalAmount <= 0
                          ? <span className="text-amber-600">Saldo não positivo: fica para o próximo mês</span>
                          : <span className="text-emerald-600">Pronto para fechar</span>}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Section>

        <Section title="Fechamentos do mês" subtitle="Revise os itens, aprove e registre o pagamento">
          {closings.length === 0 ? (
            <Empty text="Nenhum fechamento gerado para este mês." />
          ) : (
            <div className="divide-y divide-divider">
              {closings.map((c) => (
                <ClosingRow key={c.id} closing={c} busy={busy} run={run} />
              ))}
            </div>
          )}
        </Section>

        <Section
          title="Precisam de atenção"
          subtitle="Consultas passadas que o médico não concluiu (não entram no fechamento) e repasses retidos"
        >
          {attention.length === 0 ? (
            <Empty text="Nada pendente." />
          ) : (
            <div className="divide-y divide-divider">
              {attention.map((a) => (
                <AttentionRow key={a.appointmentId} item={a} busy={busy} run={run} />
              ))}
            </div>
          )}
        </Section>
      </main>
    </div>
  );
}

type Run = (action: () => Promise<unknown>, success: string) => Promise<void>;

function ClosingRow({ closing, busy, run }: { closing: PayoutClosingSummary; busy: boolean; run: Run }) {
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState<PayoutClosingDetail | null>(null);
  const [reference, setReference] = useState("");
  const status = statusLabel[closing.status];

  function toggle() {
    setOpen((v) => !v);
    if (!detail) getClosing(closing.id).then(setDetail).catch(() => undefined);
  }

  return (
    <div className="py-3 px-4 space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button onClick={toggle} className="flex items-center gap-2 bg-transparent border-none cursor-pointer text-left">
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          <span className="font-semibold text-text-primary">{closing.doctorName}</span>
          <span className="text-xs text-text-muted">#{closing.id} · {closing.itemCount} itens</span>
          <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${status.className}`}>{status.label}</span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          <strong className="text-text-primary mr-2">{money(closing.totalAmount)}</strong>

          {closing.status === "PendingApproval" && (
            <Button size="sm" className="bg-blue-600 text-white rounded-lg" isDisabled={busy}
              onPress={() => run(() => approveClosing(closing.id), `Fechamento #${closing.id} aprovado.`)}>
              <CheckCircle2 size={14} /> Aprovar
            </Button>
          )}

          {closing.status === "Approved" && (
            <>
              <input
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="Referência do Pix (E2E)"
                className="px-2 py-1.5 rounded-lg border border-divider bg-surface text-sm w-52"
              />
              <Button size="sm" className="bg-emerald-600 text-white rounded-lg" isDisabled={busy || !reference.trim()}
                onPress={() => run(() => markClosingAsPaid(closing.id, reference.trim()), `Fechamento #${closing.id} marcado como pago.`)}>
                <Banknote size={14} /> Marcar como pago
              </Button>
            </>
          )}

          {closing.status !== "Paid" && (
            <Button size="sm" variant="outline" className="rounded-lg border-divider" isDisabled={busy}
              onPress={() => {
                if (window.confirm("Descartar este fechamento? Os itens voltam para o próximo fechamento.")) {
                  run(() => discardClosing(closing.id), `Fechamento #${closing.id} descartado.`);
                }
              }}>
              <Trash2 size={14} /> Descartar
            </Button>
          )}

          {closing.status === "Paid" && (
            <span className="text-xs text-text-muted">
              Pago em {closing.paidAt && date(closing.paidAt)} · ref. {closing.paymentReference}
            </span>
          )}
        </div>
      </div>

      {open && (
        <div className="ml-6 text-sm text-text-muted space-y-1">
          {!detail && <p>Carregando…</p>}
          {detail?.items.map((item) => (
            <div key={`${item.paymentId}-${item.type}`} className="flex justify-between max-w-md">
              <span>{item.type === "Debit" ? "Estorno · " : ""}Consulta #{item.appointmentId} · {date(item.appointmentStartDateTime)}</span>
              <span className={item.type === "Debit" ? "text-red-600" : ""}>{item.type === "Debit" ? "− " : ""}{money(item.amount)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AttentionRow({ item, busy, run }: { item: PayoutAttentionItem; busy: boolean; run: Run }) {
  const [reason, setReason] = useState("");
  const held = item.heldAt !== null;

  if (item.issueId !== null) {
    const issueId = item.issueId;

    return (
      <div className="py-3 px-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <MessageSquareWarning size={16} className="text-red-500" />
          <div>
            <p className="text-sm font-semibold text-text-primary">
              Consulta #{item.appointmentId} · {item.doctorName} · {money(item.amount)}
            </p>
            <p className="text-xs text-text-muted">
              {date(item.appointmentStartDateTime)} · Relato do paciente: {item.issueReason ? issueLabel[item.issueReason] : "—"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" className="rounded-lg border-divider" isDisabled={busy}
            onPress={() => run(() => releaseIssuePayout(issueId), `Relato da consulta #${item.appointmentId} recusado: repasse liberado.`)}>
            <Unlock size={14} /> Liberar repasse
          </Button>
          <Button size="sm" className="bg-red-600 text-white rounded-lg" isDisabled={busy}
            onPress={() => {
              if (window.confirm(`Estornar ${money(item.amount)} ao paciente? O médico não recebe por esta consulta.`)) {
                run(() => refundIssuePatient(issueId), `Paciente da consulta #${item.appointmentId} estornado.`);
              }
            }}>
            <Undo2 size={14} /> Estornar paciente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-3 px-4 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        {held ? <Lock size={16} className="text-orange-500" /> : <AlertTriangle size={16} className="text-amber-500" />}
        <div>
          <p className="text-sm font-semibold text-text-primary">
            Consulta #{item.appointmentId} · {item.doctorName} · {money(item.amount)}
          </p>
          <p className="text-xs text-text-muted">
            {date(item.appointmentStartDateTime)} ·{" "}
            {held ? `Retido: ${item.holdReason}` : `Passou da data e está "${item.appointmentStatus}": o médico precisa concluir`}
          </p>
        </div>
      </div>

      {held ? (
        <Button size="sm" variant="outline" className="rounded-lg border-divider" isDisabled={busy}
          onPress={() => run(() => releasePayout(item.appointmentId), `Repasse da consulta #${item.appointmentId} liberado.`)}>
          <Unlock size={14} /> Liberar
        </Button>
      ) : (
        <div className="flex items-center gap-2">
          <input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Motivo da retenção"
            className="px-2 py-1.5 rounded-lg border border-divider bg-surface text-sm w-56"
          />
          <Button size="sm" className="bg-orange-500 text-white rounded-lg" isDisabled={busy || !reason.trim()}
            onPress={() => run(() => holdPayout(item.appointmentId, reason.trim()), `Repasse da consulta #${item.appointmentId} retido.`)}>
            <Lock size={14} /> Reter
          </Button>
        </div>
      )}
    </div>
  );
}

function Section({ title, subtitle, action, children }: { title: string; subtitle: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="bg-surface-alt rounded-xl border border-divider shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-divider flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-text-primary">{title}</h2>
          <p className="text-xs text-text-muted">{subtitle}</p>
        </div>
        {action}
      </div>
      <div className="overflow-x-auto">{children}</div>
    </section>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="px-4 py-6 text-center text-sm text-text-muted">{text}</p>;
}

function Th({ children, right }: { children: React.ReactNode; right?: boolean }) {
  return <th className={`px-4 py-2 font-semibold ${right ? "text-right" : "text-left"}`}>{children}</th>;
}

function Td({ children, right }: { children: React.ReactNode; right?: boolean }) {
  return <td className={`px-4 py-2 text-text-primary ${right ? "text-right" : "text-left"}`}>{children}</td>;
}
