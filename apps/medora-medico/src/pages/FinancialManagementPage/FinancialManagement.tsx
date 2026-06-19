import { useState } from "react";
import { Button, Input } from "@heroui/react";
import {
  Wallet,
  TrendingUp,
  Receipt,
  Users,
  CreditCard,
  Building2,
  CheckCircle2,
  Clock,
  ArrowDownRight,
  ArrowUpRight,
} from "lucide-react";

// ─── Tipos ──────────────────────────────────────────────────────────────────

interface Transaction {
  id: string;
  patient: string;
  date: string;
  value: number;
  status: "Confirmado" | "Pendente";
}

// ─── Mock data ──────────────────────────────────────────────────────────────
// REMINDER: substituir por chamada real à API (ex: GET /financeiro/resumo, /financeiro/transacoes)

const transactions: Transaction[] = [
  { id: "1", patient: "Carlos Mendes", date: "18/06/2026", value: 280, status: "Confirmado" },
  { id: "2", patient: "Mariana Costa", date: "17/06/2026", value: 350, status: "Confirmado" },
  { id: "3", patient: "Arnaldo Vieira", date: "17/06/2026", value: 280, status: "Pendente" },
  { id: "4", patient: "Julia Mattos", date: "16/06/2026", value: 420, status: "Confirmado" },
  { id: "5", patient: "Ricardo Souza", date: "15/06/2026", value: 280, status: "Pendente" },
];

// ─── Página ─────────────────────────────────────────────────────────────────

export default function FinancialManagement() {
  const [bankData, setBankData] = useState({
    banco: "",
    agencia: "",
    conta: "",
    tipoConta: "corrente",
    titular: "",
    cpfCnpj: "",
  });
  const [saving, setSaving] = useState(false);

  function handleSave() {
    setSaving(true);
    // REMINDER: substituir por chamada real — await api.post('/financeiro/dados-bancarios', bankData)
    setTimeout(() => setSaving(false), 900);
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <main className="py-3 px-6 space-y-3 max-w-7xl mx-auto w-full">

        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="text-xl font-bold text-text-primary">Gestão Financeira</h1>
            <p className="text-xs text-text-muted">
              Saldo disponível para saque: <span className="font-bold text-primary-color">R$ 4.230,00</span>
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              className="bg-primary-color text-white font-semibold h-8.5 text-xs"
            >
              Solicitar Saque
            </Button>
          </div>
        </header>

        {/* Cards de métricas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <StatBox
            icon={<Wallet size={20} className="text-green-500" />}
            label="Saldo Disponível"
            value="R$ 4.230,00"
            subtext="Pronto para saque"
          />
          <StatBox
            icon={<TrendingUp size={20} className="text-blue-500" />}
            label="Total a Receber"
            value="R$ 1.610,00"
            subtext="Próximos 30 dias"
          />
          <StatBox
            icon={<Users size={20} className="text-purple-500" />}
            label="Consultas Realizadas"
            value="42"
            subtext="Neste mês"
          />
          <StatBox
            icon={<Receipt size={20} className="text-orange-500" />}
            label="Taxas Pagas"
            value="R$ 312,80"
            subtext="Taxa administrativa (4%)"
          />
        </div>

        {/* Bloco principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5">

          {/* Coluna esquerda — Histórico de transações */}
          <div className="lg:col-span-2 space-y-3">
            <div className="bg-surface-alt rounded-xl shadow-sm border border-divider overflow-hidden">
              <div className="p-3 border-b border-divider flex justify-between items-center">
                <div>
                  <h2 className="font-bold text-base">Histórico de Transações</h2>
                  <p className="text-xs text-text-muted">Últimos recebimentos de consultas</p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-primary-color font-semibold border-none hover:bg-primary/10 h-7 text-xs"
                >
                  Ver todas
                </Button>
              </div>
              <div className="divide-y divide-divider">
                {transactions.map((t) => (
                  <TransactionItem key={t.id} transaction={t} />
                ))}
              </div>
            </div>
          </div>

          {/* Coluna direita — Configuração bancária */}
          <div className="space-y-3">
            <div className="bg-surface-alt p-3 rounded-xl border border-divider shadow-sm">
              <div className="flex items-center gap-1.5 mb-3">
                <Building2 size={16} className="text-primary-color" />
                <h3 className="font-bold text-sm">Dados Bancários</h3>
              </div>

              <div className="space-y-2.5">
                <Input
                  placeholder="Ex: Banco do Brasil"
                  value={bankData.banco}
                  onChange={(e) => setBankData((s) => ({ ...s, banco: e.target.value }))}
                />

                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="0001"
                    value={bankData.agencia}
                    onChange={(e) => setBankData((s) => ({ ...s, agencia: e.target.value }))}
                  />
                  <Input
                    placeholder="00000-0"
                    value={bankData.conta}
                    onChange={(e) => setBankData((s) => ({ ...s, conta: e.target.value }))}
                  />
                </div>

                <Input
                  placeholder="Nome completo"
                  value={bankData.titular}
                  onChange={(e) => setBankData((s) => ({ ...s, titular: e.target.value }))}
                />

                <Input
                  placeholder="000.000.000-00"
                  value={bankData.cpfCnpj}
                  onChange={(e) => setBankData((s) => ({ ...s, cpfCnpj: e.target.value }))}
                />

                <Button
                  size="sm"
                  isDisabled={saving}
                  onPress={handleSave}
                  className="bg-primary-color text-white font-semibold w-full h-8.5 text-xs mt-1"
                >
                  <CreditCard size={14} />
                  {saving ? "Salvando…" : "Salvar Alterações"}
                </Button>
              </div>
            </div>

            {/* Resumo de taxas */}
            <div className="bg-surface-alt p-3 rounded-xl border border-divider shadow-sm">
              <h3 className="font-bold text-sm mb-2">Resumo de Taxas</h3>
              <ul className="text-xs space-y-1.5">
                <li className="flex justify-between items-center text-text-muted">
                  <span>Taxa administrativa</span>
                  <span className="font-semibold text-text-primary">4%</span>
                </li>
                <li className="flex justify-between items-center text-text-muted">
                  <span>Taxa de transferência</span>
                  <span className="font-semibold text-text-primary">R$ 2,50</span>
                </li>
                <li className="flex justify-between items-center text-text-muted pt-1.5 border-t border-divider mt-1.5">
                  <span>Total descontado (mês)</span>
                  <span className="font-bold text-orange-500">R$ 312,80</span>
                </li>
              </ul>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

// ─── Componentes auxiliares ──────────────────────────────────────────────────

function StatBox({ icon, label, value, subtext }: any) {
  return (
    <div className="bg-surface-alt p-3 rounded-xl border border-divider flex items-center gap-3 shadow-sm hover:border-gray-300 transition-all">
      <div className="p-2 bg-surface rounded-lg border border-divider shadow-sm shrink-0">{icon}</div>
      <div>
        <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider leading-none">{label}</p>
        <p className="text-xl font-bold text-text-primary my-0.5">{value}</p>
        {subtext && <p className="text-[10px] text-text-muted/80 leading-none">{subtext}</p>}
      </div>
    </div>
  );
}

function TransactionItem({ transaction }: { transaction: Transaction }) {
  const { patient, date, value, status } = transaction;
  const isConfirmed = status === "Confirmado";

  return (
    <div className="flex items-center justify-between py-2 px-3 hover:bg-surface/50 transition-colors">
      <div className="flex items-center gap-3">
        <div
          className={`flex items-center justify-center rounded-lg h-9 w-9 shrink-0 border ${
            isConfirmed
              ? "bg-green-50 border-green-100"
              : "bg-orange-50 border-orange-100"
          }`}
        >
          {isConfirmed ? (
            <ArrowDownRight size={16} className="text-green-600" />
          ) : (
            <Clock size={16} className="text-orange-500" />
          )}
        </div>
        <div>
          <p className="font-semibold text-sm text-text-primary leading-tight">{patient}</p>
          <span className="text-[10px] text-text-muted mt-0.5 block">{date}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span
          className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide hidden sm:inline-block ${
            isConfirmed ? "bg-green-100 text-green-600" : "bg-orange-100 text-orange-600"
          }`}
        >
          {status === "Confirmado" && <CheckCircle2 size={10} className="inline mr-0.5 -mt-0.5" />}
          {status}
        </span>
        <span className="font-bold text-sm text-text-primary w-20 text-right">
          R$ {value.toFixed(2).replace(".", ",")}
        </span>
      </div>
    </div>
  );
}