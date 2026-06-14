import { type ProfessionalProfileDTO } from "../dtos/ProfessionalProfileDTO";
import { Endpoints } from "../enums/endpoints";

async function GetProfessionalProfile(doctorId: string, token: string): Promise<ProfessionalProfileDTO> {
  try {
    const response = await fetch(`${Endpoints.GET_DOCTOR_PROFILE}?doctorId=${doctorId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data as ProfessionalProfileDTO;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
}

async function UpdateProfessionalProfile(data: ProfessionalProfileDTO, token: string): Promise<ProfessionalProfileDTO> {
  try {
    const response = await fetch(Endpoints.UPDATE_DOCTOR_PROFILE, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const updated = await response.json();
    return updated as ProfessionalProfileDTO;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
}

export type ProfileService = {
  GetProfessionalProfile: typeof GetProfessionalProfile;
  UpdateProfessionalProfile: typeof UpdateProfessionalProfile;
};

const ProfileService: ProfileService = {
  GetProfessionalProfile,
  UpdateProfessionalProfile,
};

export default ProfileService;
