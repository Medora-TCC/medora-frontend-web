const toYearMonth = (value: string) => {
  const [year, month] = value.split("-").map(Number);
  return { year, month: month || 1 };
};

export const formatMonthYear = (value: string) => {
  const { year, month } = toYearMonth(value);
  const name = new Date(year, month - 1, 1).toLocaleDateString("pt-BR", { month: "short" });
  return `${name.replace(".", "")} ${year}`;
};

export const countMonths = (start: string, end?: string | null, now = new Date()) => {
  const from = toYearMonth(start);
  const to = end ? toYearMonth(end) : { year: now.getFullYear(), month: now.getMonth() + 1 };
  return Math.max(1, (to.year - from.year) * 12 + (to.month - from.month) + 1);
};

export const yearsSince = (start: string, now = new Date()) =>
  Math.floor(countMonths(start, undefined, now) / 12);

const duration = (start: string, end?: string | null) => {
  const total = countMonths(start, end);
  const years = Math.floor(total / 12);
  const months = total % 12;

  return [
    years > 0 && `${years} ${years === 1 ? "ano" : "anos"}`,
    months > 0 && `${months} ${months === 1 ? "mês" : "meses"}`,
  ]
    .filter(Boolean)
    .join(" ");
};

export const formatPeriod = (start: string, end?: string | null, withDuration = false) => {
  const range = `${formatMonthYear(start)} – ${end ? formatMonthYear(end) : "o momento"}`;
  return withDuration ? `${range} · ${duration(start, end)}` : range;
};