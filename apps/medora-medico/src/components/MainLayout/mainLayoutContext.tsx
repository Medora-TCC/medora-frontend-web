import { useOutletContext } from "react-router";
import type { DoctorRqesDto } from "../../api/dtos/Doctors/DoctorRqesDto";

export interface MainLayoutContext {
  doctorRqes: DoctorRqesDto | null;
  openSpecialtiesModal: () => void;
}

export function useMainLayout() {
  return useOutletContext<MainLayoutContext>();
}