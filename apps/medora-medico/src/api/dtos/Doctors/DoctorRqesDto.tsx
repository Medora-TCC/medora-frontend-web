export interface RqeItemDto {
  specialtyId: number;
  specialtyName: string;
  rqeCode: string;
  priority: number | null;
}

export interface DoctorRqesDto {
  doctorName: string;
  rqes: RqeItemDto[];
}

export interface UpdateRqePrioritiesDto {
  specialtyIds: number[];
}