import type { EducationType } from "../../../../api/dtos/Doctors/types";

export const EDUCATION_TYPE_LABEL: Record<EducationType, string> = {
  Graduation: "Graduação",
  MedicalResidency: "Residência médica",
  LatoSensu: "Pós-graduação lato sensu",
  Masters: "Mestrado",
  Doctorate: "Doutorado",
  Postdoctorate: "Pós-doutorado",
};