export type EducationType =
  | "Graduation"
  | "MedicalResidency"
  | "LatoSensu"
  | "Masters"
  | "Doctorate"
  | "Postdoctorate";

export interface PreviewEducation {
  key: string | number;
  type: EducationType;
  course: string;
  institution: string;
  startDate: string;
  endDate: string | null;
  isDraft?: boolean;
}

export interface PreviewExperience {
  key: string | number;
  position: string;
  organization: string;
  location: string | null;
  startDate: string;
  endDate: string | null;
  description: string | null;
  isDraft?: boolean;
}

export interface DoctorProfilePreviewData {
  name: string;
  registrations: { councilType: string; councilNumber: string; councilState: string }[];
  specialties: { name: string; rqe: string }[];
  bio: string | null;
  languages: string[];
  rating: { average: number | null; total: number };
  address: { city: string | null; state: string | null } | null;
  educations: PreviewEducation[];
  experiences: PreviewExperience[];
}