import { useOutletContext } from "react-router";
import type { DoctorRqesDto } from "../../api/dtos/Doctors/DoctorRqesDto";

export interface MainLayoutContext {
  doctorRqes: DoctorRqesDto | null;
  openSpecialtiesModal: () => void;
  // endereço local (blob:) da foto do médico; null sem foto ou enquanto carrega
  photoUrl: string | null;
  // troca a foto mostrada no layout depois de enviar (Blob) ou remover (null)
  setPhoto: (photo: Blob | null) => void;
}

export function useMainLayout() {
  return useOutletContext<MainLayoutContext>();
}