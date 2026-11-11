import type { EducationType } from "../../dtos/Doctors/types";

export interface DoctorPublicPageDto {
  id: string;
  name: string;
  registrations: { id: number; councilType: string; councilNumber: string; councilState: string }[];
  specialties: { name: string; rqe: string; priority: number }[];
  bio: string | null;
  languages: string[];
  rating: { total: number; average: number | null };
  modalities: { inPerson: boolean; telemedicine: boolean };
  teleconsultationPrice: number | null;
  address: { city: string | null; state: string | null } | null;
  educations: {
    id: number;
    type: EducationType;
    course: string;
    institution: string;
    startDate: string;
    endDate: string | null;
    disclaimer: string | null;
  }[];
  experiences: {
    id: number;
    position: string;
    organization: string;
    location: string | null;
    startDate: string;
    endDate: string | null;
    description: string | null;
  }[];
}

export interface UpdateAboutDto {
  bio: string | null;
  languages: string[];
}

export type PublicEducation = DoctorPublicPageDto["educations"][number];
export type PublicExperience = DoctorPublicPageDto["experiences"][number];

export interface EducationRequestDto {
  type: EducationType;
  institution: string;
  course: string;
  startDate: string;
  endDate: string | null;
}

export interface ExperienceRequestDto {
  position: string;
  organization: string;
  location: string | null;
  startDate: string;
  endDate: string | null;
  description: string | null;
}