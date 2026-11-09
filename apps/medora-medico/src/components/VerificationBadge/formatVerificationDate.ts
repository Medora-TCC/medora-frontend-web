const MS_PER_DAY = 24 * 60 * 60 * 1000;

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function formatVerificationDate(isoDate: string, now = new Date()): string | null {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return null;

  const absolute = date.toLocaleDateString("pt-BR");
  const days = Math.round((startOfDay(date).getTime() - startOfDay(now).getTime()) / MS_PER_DAY);
  const rtf = new Intl.RelativeTimeFormat("pt-BR", { numeric: "auto" });

  let relative: string;
  if (Math.abs(days) < 30) relative = rtf.format(days, "day");
  else if (Math.abs(days) < 365) relative = rtf.format(Math.trunc(days / 30), "month");
  else relative = rtf.format(Math.trunc(days / 365), "year");

  return `${absolute} (${relative})`;
}
