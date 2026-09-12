
export interface RegisterDoctorDto {
    fullName: string;
    email: string;
    password: string;
    nationality: string;
    birthDate: Date;
    sex: number;
    race: number;
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
    naturalizationDate?: Date;
    passportNumber: string;
    passportIssuerCountry: string;
    passportIssueDate: Date;
    passportExpirationDate: Date;
}