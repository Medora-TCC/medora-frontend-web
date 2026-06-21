import { useOverlayState } from "@heroui/react";
import {
  Wallet,
  TrendingUp,
  Receipt,
  Users,
  Building2,
  CheckCircle2,
  Clock,
  ArrowDownRight,
} from "lucide-react";
import { BankAccountModal } from "./BankModal";


const transactions = [
  { id: "1", patient: "Carlos Mendes",  date: "18/06/2026", value: 280, status: "Confirmado" },
  { id: "2", patient: "Mariana Costa",  date: "17/06/2026", value: 350, status: "Confirmado" },
  { id: "3", patient: "Arnaldo Vieira", date: "17/06/2026", value: 280, status: "Pendente"   },
  { id: "4", patient: "Julia Mattos",   date: "16/06/2026", value: 420, status: "Confirmado" },
  { id: "5", patient: "Ricardo Souza",  date: "15/06/2026", value: 280, status: "Pendente"   },
];


export default function FinancialManagement() {
  const modal = useOverlayState({ defaultOpen: false });

  return (
    <div className="min-h-screen bg-surface font-[Inter,system-ui,sans-serif]">
      <main className="max-w-7xl mx-auto px-6 py-6">

        <header className="flex justify-between items-start flex-wrap gap-3 mb-6">
          <div>
            <h1 className="m-0 text-[22px] font-bold text-text-primary">
              Gestão Financeira
            </h1>
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

        <div className="grid gap-3 mb-5" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
          <StatBox
            icon={<Wallet size={20} color="#10B981" />}
            label="Saldo Recebido"
            value="R$ 1.230,00"
            subtext="Esse mês"
            iconBg="#ECFDF5"
            iconBorder="#D1FAE5"
          />
          <StatBox
            icon={<TrendingUp size={20} color="#3B82F6" />}
            label="Total a Receber"
            value="R$ 1.610,00"
            subtext="Próximos 30 dias"
            iconBg="#EFF6FF"
            iconBorder="#BFDBFE"
          />
          <StatBox
            icon={<Users size={20} color="#8B5CF6" />}
            label="Consultas Realizadas"
            value="42"
            subtext="Neste mês"
            iconBg="#F5F3FF"
            iconBorder="#DDD6FE"
          />
        </div>

        <div className="grid gap-4 items-start" style={{ gridTemplateColumns: "1fr" }}>

          <div className="bg-surface-alt rounded-xl border border-ring overflow-hidden shadow-sm">
            <div className="px-4 py-3.5 border-b border-ring flex justify-between items-center">
              <div>
                <p className="m-0 text-[15px] font-bold text-text-primary">
                  Histórico de Transações
                </p>
                <p className="mt-0.5 mb-0 text-xs text-text-secondary">
                  Últimos recebimentos de consultas
                </p>
              </div>
              <button className="bg-transparent border-none text-accent text-xs font-semibold cursor-pointer px-2 py-1 rounded-md hover:bg-surface-alt transition-colors">
                Ver todas
              </button>
            </div>

            {transactions.map((t, i) => (
              <TransactionItem
                key={t.id}
                transaction={t}
                isLast={i === transactions.length - 1}
              />
            ))}
          </div>
        </div>
      </main>

      <BankAccountModal isOpen={modal.isOpen} onOpenChange={modal.setOpen} />
    </div>
  );
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

function TransactionItem({
  transaction,
  isLast,
}: {
  transaction: { patient: string; date: string; value: number; status: string };
  isLast: boolean;
}) {
  const { patient, date, value, status } = transaction;
  const ok = status === "Confirmado";

  return (
    <div
      className={[
        "flex items-center justify-between px-4 py-3",
        isLast ? "" : "border-b border-ring",
      ].join(" ")}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-[9px] shrink-0 flex items-center justify-center"
          style={{
            background: ok ? "#ECFDF5" : "#FFF7ED",
            border: `1px solid ${ok ? "#D1FAE5" : "#FED7AA"}`,
          }}
        >
          {ok
            ? <ArrowDownRight size={16} color="#10B981" />
            : <Clock size={16} color="#F97316" />
          }
        </div>
        <div>
          <p className="m-0 text-[13px] font-semibold text-text-primary">{patient}</p>
          <p className="mt-0.5 mb-0 text-[11px] text-text-secondary">{date}</p>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <span
          className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-[0.04em] flex items-center gap-0.5"
          style={{
            background: ok ? "#ECFDF5" : "#FFF7ED",
            color: ok ? "#059669" : "#F97316",
          }}
        >
          {ok && <CheckCircle2 size={10} />}
          {status}
        </span>
        <span className="text-[13px] font-bold text-text-primary min-w-19 text-right">
          R$ {value.toFixed(2).replace(".", ",")}
        </span>
      </div>
    </div>
  );
}

function FeeRow({ label, value }: { label: string; value: string }) {
  return (
    <li className="flex justify-between items-center">
      <span className="text-xs text-text-secondary">{label}</span>
      <span className="text-[13px] font-semibold text-text-secondary">{value}</span>
    </li>
  );
}
