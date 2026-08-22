export interface DayDataAvailabilityDto {
    id: string;
    date: string;
    scheduleId: number;
    start: string;
    end: string;
    duration: number;
    slots: number;
}