import { useEffect, useState } from "react";
import { Spinner } from "@heroui/react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { getWeekFlow } from "../../api/services/DoctorService";
import type { WeekFlowDayDto, WeekFlowPeriod } from "../../api/dtos/Doctors/WeekFlowDto";

const DAY_LABELS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

const PERIOD_OPTIONS: { value: WeekFlowPeriod; label: string; description: string }[] = [
  { value: "Last7Days", label: "7 dias", description: "nos últimos 7 dias" },
  { value: "Last14Days", label: "14 dias", description: "nos últimos 14 dias" },
  { value: "Last30Days", label: "30 dias", description: "nos últimos 30 dias" },
];

export default function WeeklyFlowCard() {
  const [period, setPeriod] = useState<WeekFlowPeriod>("Last7Days");
  const [days, setDays] = useState<WeekFlowDayDto[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let ignore = false;
    setIsLoading(true);
    setErrorMessage("");

    getWeekFlow(period)
      .then((data) => { if (!ignore) setDays(data.days); })
      .catch((error) => { if (!ignore) setErrorMessage(error instanceof Error ? error.message : "Erro ao carregar."); })
      .finally(() => { if (!ignore) setIsLoading(false); });

    return () => { ignore = true; };
  }, [period]);

  const chartData = (days ?? []).map((d) => ({
    label: DAY_LABELS[d.dayOfWeek - 1],
    count: d.count,
  }));

  const isEmpty = chartData.every((d) => d.count === 0);
  const description = PERIOD_OPTIONS.find((o) => o.value === period)?.description;

  return (
    <div className="bg-surface-alt p-3 rounded-xl border border-divider shadow-sm">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <h3 className="font-bold text-base">Fluxo Semanal de Consultas</h3>
          <p className="text-xs text-text-muted">Atendimentos realizados por dia da semana {description}</p>
        </div>

        <div className="flex gap-1 bg-surface rounded-lg p-0.5 border border-divider">
          {PERIOD_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setPeriod(option.value)}
              className={`px-2 py-1 text-[11px] font-semibold rounded-md transition-colors ${
                period === option.value
                  ? "bg-primary-color text-text-inverse"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-40">
        {isLoading ? (
          <div className="h-full flex items-center justify-center"><Spinner /></div>
        ) : errorMessage ? (
          <p className="h-full flex items-center justify-center text-xs text-danger-text">{errorMessage}</p>
        ) : isEmpty ? (
          <p className="h-full flex items-center justify-center text-xs text-text-muted">Nenhum atendimento realizado no período.</p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="var(--border)" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
              <Tooltip
                cursor={{ fill: "var(--surface-raised)" }}
                contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: "var(--text-primary)", fontWeight: 600 }}
                formatter={(value) => [value, "Atendimentos"]}
              />
              <Bar dataKey="count" fill="var(--primary)" radius={[4, 4, 0, 0]} maxBarSize={36} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}