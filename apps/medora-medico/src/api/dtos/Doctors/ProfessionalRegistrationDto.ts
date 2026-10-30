export type DoctorStatus = "Pending" | "Approved" | "Rejected";

export interface ProfessionalRegistrationDto {
  id: number;
  councilType: string;
  councilNumber: string;
  councilState: string;
}

export interface ProfessionalDataDto {
  status: DoctorStatus;
  registrations: ProfessionalRegistrationDto[];
}