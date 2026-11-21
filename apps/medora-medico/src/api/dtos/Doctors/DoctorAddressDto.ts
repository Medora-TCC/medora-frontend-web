export interface DoctorAddressRequestDto {
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  // só números, 8 dígitos
  postalCode: string;
  complement: string | null;
}

export interface DoctorAddressDto extends DoctorAddressRequestDto {
  // true quando o endereço foi achado no mapa: o médico aparece na busca por distância do app
  located: boolean;
}
