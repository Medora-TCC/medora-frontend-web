export interface RegisterDoctorDto {
    fullName: string;
    email: string;
    password: string;
    nationality: string;
    birthDate: string;
    sex: number;
    phone: string;
    cpf?: string;
    gender?: string;
    isMotherUnknown?: boolean;
    mothersName?: string;
    crm: string;
    crmState: string;
    foreigner?: ForeignerDto;
}

export interface ForeignerDto {
    birthCountry: string;
    naturalizationDate?: string;
    passportNumber: string;
    passportIssuerCountry: string;
    passportIssueDate: string;
    passportExpirationDate: string;
}