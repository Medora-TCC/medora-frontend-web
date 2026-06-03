import { http, HttpResponse, delay } from "msw";
import { type ProfessionalProfileDTO } from "../../src/api/dtos/ProfessionalProfileDTO";

let mockProfile: ProfessionalProfileDTO = {
  name: "Dr. Pedro Silva",
  email: "pedro.silva@medora.com",
  phone: "(11) 91234-5678",
  specialty: "Cardiologia",
  crm: "12345-SP",
  rqe: "65432",
  cpf: "123.456.789-00",
  state: "SP",
};

export const profileHandlers = [
  http.get("/doctors/profile", async () => {
    await delay(500);
    return HttpResponse.json(mockProfile);
  }),

  http.put("/doctors/profile", async ({ request }) => {
    await delay(500);
    const body = (await request.json()) as ProfessionalProfileDTO;
    mockProfile = { ...mockProfile, ...body };
    return HttpResponse.json(mockProfile);
  }),
];
