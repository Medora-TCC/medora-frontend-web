export type WeekFlowPeriod = "Last7Days" | "Last14Days" | "Last30Days";

export interface WeekFlowDayDto {
  dayOfWeek: number;
  count: number;
}

export interface WeekFlowDto {
  period: WeekFlowPeriod;
  days: WeekFlowDayDto[];
}