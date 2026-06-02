import { http, HttpResponse, delay } from "msw";
import { type RegisterDoctorDto } from "../../src/api/dtos/RegisterDoctorDto";

export const registerHandlers = [
  http.post("/doctors/register", async ({ request }) => {
    await delay(600);
    const body = (await request.json()) as RegisterDoctorDto;

    // regra de mock -> CRM começando com "0" é rejeitado
    if (body.crm.trim().startsWith("0")) {
      return HttpResponse.json(
        { reason: "O CRM informado não confere com o nome, a UF e o CPF do cadastro." },
        { status: 422 }
      );
    }

    return HttpResponse.json({ message: "Cadastro aprovado" }, { status: 201 });
  }),
];
