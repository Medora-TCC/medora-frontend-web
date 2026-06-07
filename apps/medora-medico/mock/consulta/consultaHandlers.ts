import type {
  IConsultaDetailed,
  ITeleConsultaDetailed,
} from "@medora_web/shared";
import { http, HttpResponse } from "msw";

const mockConsultaListEmpty: IConsultaDetailed[] = [];

export const mockConsultaList: Array<
  IConsultaDetailed | ITeleConsultaDetailed
> = [
  // 1. Teleconsulta - Agendada para o futuro (Termos pendentes do paciente)
  {
    id: "V1StGXR8_Z5",
    doctorName: "Dra. Camila Moraes",
    patientNome: "João Guilherme",
    healthInsurance: "Unimed Curitiba",
    startDateTime: "2026-06-10T09:00:00.000-03:00",
    endDateTime: "2026-06-10T10:00:00.000-03:00",
    locationAdress: "Sala Virtual",
    status: "agendado",
    type: "teleconsulta",
    tags: ["primeira-consulta", "psiquiatria"],
    meetingUrl: "V1StGXR8_Z5",
    platform: "Medora",
    doctorTermsAccepted: true,
    patientTermsAccepted: false,
  },

  // 2. Presencial - Em Atendimento
  {
    id: "x9K2mPq4_A1",
    doctorName: "Dr. Roberto Silva",
    patientNome: "Maria Souza",
    healthInsurance: "Particular",
    startDateTime: "2026-06-07T14:30:00.000-03:00",
    endDateTime: "2026-06-07T15:15:00.000-03:00",
    locationAdress: "Rua Vicente Machado, 1234 - Curitiba, PR",
    status: "em_atendimento",
    type: "presencial",
    tags: ["retorno", "exames-prontos"],
  },

  // 3. Teleconsulta - Em Espera (Ambos aceitaram os termos, paciente aguardando)
  {
    id: "bL4x9T_Qp2",
    doctorName: "Dr. Fernando Santos",
    patientNome: "Carlos Mendes",
    healthInsurance: "MedSenior",
    startDateTime: "2026-06-07T16:00:00.000-03:00",
    endDateTime: "2026-06-07T16:45:00.000-03:00",
    locationAdress: "Sala Virtual",
    status: "em_espera",
    type: "teleconsulta",
    tags: ["geriatria", "acompanhamento"],
    meetingUrl: "bL4x9T_Qp2",
    platform: "Medora",
    doctorTermsAccepted: true,
    patientTermsAccepted: true,
  },

  // 4. Teleconsulta - Finalizada (Sem URL da sala, pois já encerrou)
  {
    id: "zP9_mK2xT1",
    doctorName: "Dra. Camila Moraes",
    patientNome: "Ana Pereira",
    healthInsurance: "Amil",
    startDateTime: "2026-06-05T10:00:00.000-03:00",
    endDateTime: "2026-06-05T10:45:00.000-03:00",
    locationAdress: "Sala Virtual",
    status: "finalizado",
    type: "teleconsulta",
    tags: ["receita-renovada"],
    platform: "Medora",
    doctorTermsAccepted: true,
    patientTermsAccepted: true,
  },

  // 5. Presencial - Cancelada
  {
    id: "qW1_8mVcR",
    doctorName: "Dra. Aline Franco",
    patientNome: "Pedro Pedroso",
    healthInsurance: "Bradesco Saúde",
    startDateTime: "2026-06-06T11:00:00.000-03:00",
    endDateTime: "2026-06-06T11:30:00.000-03:00",
    locationAdress: "Av. República Argentina, 500 - Curitiba, PR",
    status: "cancelado",
    type: "presencial",
  },

  // 6. Teleconsulta - Cancelada (Paciente não aceitou termos / No-show)
  {
    id: "tC_9xLp4Z",
    doctorName: "Dr. Fernando Santos",
    patientNome: "Lucia Oliveira",
    healthInsurance: "Particular",
    startDateTime: "2026-06-04T08:00:00.000-03:00",
    endDateTime: "2026-06-04T08:45:00.000-03:00",
    locationAdress: "Sala Virtual",
    status: "cancelado",
    type: "teleconsulta",
    tags: ["falta-paciente"],
    platform: "Medora",
    doctorTermsAccepted: true,
    patientTermsAccepted: false,
  },

  // 7. Presencial - Agendada
  {
    id: "pS_3bN8mX",
    doctorName: "Dr. Roberto Silva",
    patientNome: "Marcos Antônio",
    healthInsurance: "SulAmérica",
    startDateTime: "2026-06-15T13:00:00.000-03:00",
    endDateTime: "2026-06-15T14:00:00.000-03:00",
    locationAdress: "Rua Vicente Machado, 1234 - Curitiba, PR",
    status: "agendado",
    type: "presencial",
    tags: ["risco-cirurgico"],
  },

  // 8. Teleconsulta - Em Atendimento (Ambos na sala virtual)
  {
    id: "yT_1mV8xQ",
    doctorName: "Dra. Camila Moraes",
    patientNome: "Beatriz Lima",
    healthInsurance: "Unimed Curitiba",
    startDateTime: "2026-06-07T11:30:00.000-03:00",
    endDateTime: "2026-06-07T12:15:00.000-03:00",
    locationAdress: "Sala Virtual",
    status: "em_atendimento",
    type: "teleconsulta",
    tags: ["urgencia", "triagem"],
    meetingUrl: "yT_1mV8xQ",
    platform: "Medora",
    doctorTermsAccepted: true,
    patientTermsAccepted: true,
  },

  // 9. Presencial - Finalizada
  {
    id: "kL_5nP2xR",
    doctorName: "Dra. Aline Franco",
    patientNome: "Rafael Costa",
    healthInsurance: "Cassi",
    startDateTime: "2026-06-01T09:00:00.000-03:00",
    endDateTime: "2026-06-01T09:20:00.000-03:00",
    locationAdress: "Av. República Argentina, 500 - Curitiba, PR",
    status: "finalizado",
    type: "presencial",
    tags: ["leitura-exames"],
  },

  // 10. Teleconsulta - Agendada (Médico ainda não aceitou os termos)
  {
    id: "wR_8xP9mB",
    doctorName: "Dr. Fernando Santos",
    patientNome: "Juliana Dias",
    healthInsurance: "Particular",
    startDateTime: "2026-06-12T15:00:00.000-03:00",
    endDateTime: "2026-06-12T15:45:00.000-03:00",
    locationAdress: "Sala Virtual",
    status: "agendado",
    type: "teleconsulta",
    tags: ["terapia-semanal"],
    meetingUrl: "wR_8xP9mB",
    platform: "Medora",
    doctorTermsAccepted: false,
    patientTermsAccepted: true,
  },
];

export const consultaHandlers = [
  // GET /api/consultas — lista todas
  http.get("/api/consultas", async () => {
    return HttpResponse.json(mockConsultaList);
  }),

  // GET /api/consultas/:id — busca por id
  http.get("/api/consultas/:id", ({ params }) => {
    const consulta = mockConsultaList.find((tc) => tc.id === params.id);

    if (!consulta) {
      return HttpResponse.json(
        { message: "Consulta não encontrada" },
        { status: 404 },
      );
    }

    return HttpResponse.json(consulta);
  }),

  http.get("/api/consultas/details/:id", ({ params }) => {
    const consulta = mockConsultaList.find((tc) => tc.id === params.id);

    if (!consulta) {
      return HttpResponse.json(
        { message: "Consulta não encontrada" },
        { status: 404 },
      );
    }

    return HttpResponse.json(consulta);
  }),

  // POST /api/consultas — cria nova
  http.post("/api/consultas", async ({ request }) => {
    const body = (await request.json()) as Omit<IConsultaDetailed, "id">;

    const nova: IConsultaDetailed = {
      ...body,
      id: `tc-${Date.now()}`,
    };

    return HttpResponse.json(nova, { status: 201 });
  }),

  // PATCH /api/consultas/:id — atualiza parcialmente
  http.patch("/api/consultas/:id", async ({ params, request }) => {
    const consulta = mockConsultaList.find((tc) => tc.id === params.id);

    if (!consulta) {
      return HttpResponse.json(
        { message: "Consulta não encontrada" },
        { status: 404 },
      );
    }

    const body = (await request.json()) as Partial<IConsultaDetailed>;
    const atualizada: IConsultaDetailed = { ...consulta, ...body };

    return HttpResponse.json(atualizada);
  }),

  // DELETE /api/consultas/:id — cancela/remove
  http.delete("/api/consultas/:id", ({ params }) => {
    const existe = mockConsultaList.some((tc) => tc.id === params.id);

    if (!existe) {
      return HttpResponse.json(
        { message: "Consulta não encontrada" },
        { status: 404 },
      );
    }

    return new HttpResponse(null, { status: 204 });
  }),
];
