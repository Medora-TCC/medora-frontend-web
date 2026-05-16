import { type DailyAvailabilitySlotDTO } from "@medora_web/shared";
import { Endpoints } from "../enums/endpoints";


async function GetDailyAvailabilityByDoctorId(doctorId: string, token: string): Promise<DailyAvailabilitySlotDTO> {
    try {
        const response = await fetch(`${Endpoints.GET_DAILY_AVAILABILITY}?doctorId=${doctorId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data as DailyAvailabilitySlotDTO;
    }
    catch (error) {
        console.error("Error fetching data:", error);
        throw error;
    }
}

async function DeleteAvailabilityById(availabilityId: string, token: string) {
    try {
        const response = await fetch(`${Endpoints.DELETE_DAILY_AVAILABILITY}/${availabilityId}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    }
    catch (error) {
        console.error("Error fetching data:", error);
        throw error;
    }
}

async function ApproveAvailabilityById(availabilityId: string, token: string) {
    try {
        const response = await fetch(`${Endpoints.DELETE_DAILY_AVAILABILITY}/${availabilityId}/approve`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    }
    catch (error) {
        console.error("Error fetching data:", error);
        throw error;
    }
}

async function GetAllAvailabilityByRangeDateAndDoctorId(doctorId: string, startDate: string, endDate: string, token: string) {
    try {
        const response = await fetch(`${Endpoints.GET_DAILY_AVAILABILITY}?doctorId=${doctorId}&startDate=${startDate}&endDate=${endDate}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data as DailyAvailabilitySlotDTO[];
    }
    catch (error) {
        console.error("Error fetching data:", error);
        throw error;
    }
}

async function CreateDailyAvailability(body: any, token: string) {  
  try {
    const response = await fetch(Endpoints.CREATE_DAILY_AVAILABILITY, {
    method: "POST",
        headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
    body: JSON.stringify(body),
    });
    const data = await response.json();
    return data;
    }catch (error) {
    console.error("Error fetching data:", error);
    throw error;
    }
}

export type AvailabilityService = {
    GetDailyAvailabilityByDoctorId: typeof GetDailyAvailabilityByDoctorId;
    DeleteAvailabilityById: typeof DeleteAvailabilityById;
    ApproveAvailabilityById: typeof ApproveAvailabilityById;
    GetAllAvailabilityByRangeDateAndDoctorId: typeof GetAllAvailabilityByRangeDateAndDoctorId;
    CreateDailyAvailability: typeof CreateDailyAvailability;
}

const AvailabilityService: AvailabilityService = {
    GetDailyAvailabilityByDoctorId,
    DeleteAvailabilityById,
    ApproveAvailabilityById,
    GetAllAvailabilityByRangeDateAndDoctorId,
    CreateDailyAvailability
}

export default AvailabilityService;

 