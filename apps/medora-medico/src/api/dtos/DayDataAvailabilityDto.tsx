export interface DayDataAvailabilityDto {
     id: number;
    date: string;
    start: string;
    end: string;
    duration: number;
    slots: number;
    isSeries: boolean;
}