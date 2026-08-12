import { type DailyAvailabilitySlotDTO } from "@medora_web/shared";
import { Endpoints } from "../enums/endpoints";


async function DeleteAvailabilityById(id: number, token: string) {
    try {
        const response = await fetch(`${Endpoints.DELETE_DAILY_AVAILABILITY}/${id}`, {
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

async function ApproveAvailabilityById(id: number, token: string) {
    try {
        const response = await fetch(`${Endpoints.DELETE_DAILY_AVAILABILITY}/${id}/approve`, {
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

async function GetDailyAvailabilityByDate(doctorId: string, date: string, token: string) {
    try {
        const response = await fetch(`${Endpoints.GET_DAILY_AVAILABILITY}?doctorId=${doctorId}&date=${date}`, {
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

async function UpdateDailyAvailabilityType(id: number, type: 'inPerson' | 'online' | 'any', token: string) {  
  try {
    const response = await fetch(`${Endpoints.UPDATE_DAILY_AVAILABILITY_TYPE}/${id}/type`, {
    method: "PATCH",
        headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
    body: JSON.stringify({ type }),
    });
    const data = await response.json();
    return data;
    }catch (error) {
    console.error("Error fetching data:", error);
    throw error;
    }
}

export type AvailabilityService = {
    DeleteAvailabilityById: typeof DeleteAvailabilityById;
    ApproveAvailabilityById: typeof ApproveAvailabilityById;
    GetDailyAvailabilityByDate: typeof GetDailyAvailabilityByDate;
    CreateDailyAvailability: typeof CreateDailyAvailability;
    UpdateDailyAvailabilityType: typeof UpdateDailyAvailabilityType;
}

const AvailabilityService: AvailabilityService = {
    DeleteAvailabilityById,
    ApproveAvailabilityById,
    GetDailyAvailabilityByDate,
    CreateDailyAvailability,
    UpdateDailyAvailabilityType
}

export default AvailabilityService;

 