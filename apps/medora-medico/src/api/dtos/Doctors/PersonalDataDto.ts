export type Sex = "Unknown" | "Male" | "Female" | "Intersex";
export type Race = "None" | "White" | "Black" | "Yellow" | "Brown" | "Indigenous";

export interface ForeignerDataDto {
  birthCountry: string;
  naturalizationDate: string | null;
  passportNumber: string | null;
  passportIssuerCountry: string | null;
  passportIssueDate: string;
  passportExpirationDate: string;
}

export interface PersonalDataDto {
  fullName: string;
  birthDate: string;
  sex: Sex;
  nationality: string | null;
  cpf: string | null;
  email: string;

  phone: string;
  phone2: string | null;
  socialName: string | null;
  gender: string | null;
  race: Race;
  timeZoneId: string | null;

  isMotherUnknown: boolean | null;
  mothersName: string | null;
  birthCity: string | null;
  birthState: string | null;
  rg: string | null;
  rgIssuer: string | null;
  rgIssuerState: string | null;
  rgIssueDate: string | null;

  foreigner: ForeignerDataDto | null;
}

export interface UpdateContactDto {
  phone: string;
  phone2: string | null;
  socialName: string | null;
  gender: string | null;
  race: Race;
  timeZoneId: string | null;
}

export interface UpdateComplementaryDto {
  isMotherUnknown: boolean;
  mothersName: string | null;
  birthCity: string | null;
  birthState: string | null;
  rg: string | null;
  rgIssuer: string | null;
  rgIssuerState: string | null;
  rgIssueDate: string | null;
}

export interface UpdatePassportDto {
  passportNumber: string;
  passportIssuerCountry: string;
  passportIssueDate: string;
  passportExpirationDate: string;
}