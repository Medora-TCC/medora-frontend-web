import { todayIso } from "../../../api/mappers/personLabels";

export const currentMonth = () => todayIso().slice(0, 7);

export function sortCareer<T extends { startDate: string; endDate: string | null }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    if (a.endDate === null && b.endDate !== null) return -1;
    if (b.endDate === null && a.endDate !== null) return 1;
    if (a.endDate !== b.endDate) return (b.endDate ?? "").localeCompare(a.endDate ?? "");
    return b.startDate.localeCompare(a.startDate);
  });
}

export function mergeDraft<T extends { key: string | number }>(saved: T[], draft: T | null): T[] {
  if (!draft) return saved;
  return saved.some((item) => item.key === draft.key)
    ? saved.map((item) => (item.key === draft.key ? draft : item))
    : [draft, ...saved];
}

export function validatePeriod(startDate: string, endDate: string, ongoing: boolean): string | null {
  if (!startDate) return "Informe o mês de início.";
  if (startDate > currentMonth()) return "O início não pode ser no futuro.";
  if (!ongoing && !endDate) return "Informe o mês de término, ou marque como atual.";
  if (!ongoing && endDate < startDate) return "O término não pode ser antes do início.";
  return null;
}