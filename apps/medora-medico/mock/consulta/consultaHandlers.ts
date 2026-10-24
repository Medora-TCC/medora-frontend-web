import type {
  IConsultaDetailed,
  ITeleConsultaDetailed,
} from "@medora_web/shared";
import { http, HttpResponse } from "msw";

export const mockConsultaList: Array<
  IConsultaDetailed | ITeleConsultaDetailed
> = [
    // 1. Teleconsulta - Agendada para o futuro (Termos pendentes do paciente)
    {
      id: 1,
      patientNome: "João Guilherme",
      healthInsurance: "Unimed Curitiba",
      startDateTime: "2026-06-23T09:00:00.000-03:00",
      endDateTime: "2026-06-23T10:00:00.000-03:00",
      locationAdress: "Sala Virtual",
      status: "agendado",
      type: "teleconsulta",
      tags: ["primeira-consulta", "psiquiatria"],
      meetingUrl: "V1StGXR8_Z5",
      platform: "Medora",
      doctorTermsAccepted: true,
      patientTermsAccepted: false,
    },

    // 2. Presencial - Em Atendimento (acontecendo agora)
    {
      id: 2,
      patientNome: "Maria Souza",
      healthInsurance: "Particular",
      startDateTime: "2026-06-20T16:30:00.000-03:00",
      endDateTime: "2026-06-20T17:15:00.000-03:00",
      locationAdress: "Rua Vicente Machado, 1234 - Curitiba, PR",
      status: "em_atendimento",
      type: "presencial",
      platform: "Medora",
      patientTermsAccepted: true,
      tags: ["retorno", "exames-prontos"],
    },

    // 3. Teleconsulta - Em Espera (Ambos aceitaram os termos, paciente aguardando)
    {
      id: 3,
      patientNome: "Carlos Mendes",
      healthInsurance: "MedSenior",
      startDateTime: "2026-06-20T17:30:00.000-03:00",
      endDateTime: "2026-06-20T18:15:00.000-03:00",
      locationAdress: "Sala Virtual",
      status: "confirmado",
      type: "teleconsulta",
      tags: ["geriatria", "acompanhamento"],
      meetingUrl: "bL4x9T_Qp2",
      platform: "Medora",
      doctorTermsAccepted: true,
      patientTermsAccepted: true,
    },

    // 4. Teleconsulta - Finalizada
    {
      id: 4,
      patientNome: "Ana Pereira",
      healthInsurance: "Amil",
      startDateTime: "2026-06-18T10:00:00.000-03:00",
      endDateTime: "2026-06-18T10:45:00.000-03:00",
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
      id: 5,
      patientNome: "Pedro Pedroso",
      healthInsurance: "Bradesco Saúde",
      startDateTime: "2026-06-19T11:00:00.000-03:00",
      endDateTime: "2026-06-19T11:30:00.000-03:00",
      locationAdress: "Av. República Argentina, 500 - Curitiba, PR",
      status: "cancelado",
      type: "presencial",
      platform: "Medora",
      patientTermsAccepted: true,
    },

    // 6. Teleconsulta - Cancelada (Paciente não aceitou termos / No-show)
    {
      id: 6,
      patientNome: "Lucia Oliveira",
      healthInsurance: "Particular",
      startDateTime: "2026-06-17T08:00:00.000-03:00",
      endDateTime: "2026-06-17T08:45:00.000-03:00",
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
      id: 7,
      patientNome: "Marcos Antônio",
      healthInsurance: "SulAmérica",
      startDateTime: "2026-06-25T13:00:00.000-03:00",
      endDateTime: "2026-06-25T14:00:00.000-03:00",
      locationAdress: "Rua Vicente Machado, 1234 - Curitiba, PR",
      status: "agendado",
      type: "presencial",
      platform: "Medora",
      patientTermsAccepted: true,
      tags: ["risco-cirurgico"],
    },

    // 8. Teleconsulta - Em Atendimento (Ambos na sala virtual, acontecendo agora)
    {
      id: 8,
      patientNome: "Beatriz Lima",
      healthInsurance: "Unimed Curitiba",
      startDateTime: "2026-06-23T00:00:00.000-03:00",
      endDateTime: "2026-06-20T17:45:00.000-03:00",
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
      id: 9,
      patientNome: "Rafael Costa",
      healthInsurance: "Cassi",
      startDateTime: "2026-06-15T09:00:00.000-03:00",
      endDateTime: "2026-06-15T09:20:00.000-03:00",
      locationAdress: "Av. República Argentina, 500 - Curitiba, PR",
      status: "finalizado",
      type: "presencial",
      platform: "Medora",
      patientTermsAccepted: true,
      tags: ["leitura-exames"],
    },

    // 10. Teleconsulta - Agendada (Médico ainda não aceitou os termos)
    {
      id: 10,
      patientNome: "Juliana Dias",
      healthInsurance: "Particular",
      startDateTime: "2026-06-22T15:00:00.000-03:00",
      endDateTime: "2026-06-22T15:45:00.000-03:00",
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
    const consulta = mockConsultaList.find((tc) => tc.id === Number(params.id));

    if (!consulta) {
      return HttpResponse.json(
        { message: "Consulta não encontrada" },
        { status: 404 },
      );
    }

    return HttpResponse.json(consulta);
  }),

  http.get("/api/consultas/details/:id", ({ params }) => {
    const consulta = mockConsultaList.find((tc) => tc.id === Number(params.id));

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
      id: Date.now(),
    };

    return HttpResponse.json(nova, { status: 201 });
  }),

  // PATCH /api/consultas/:id — atualiza parcialmente
  http.patch("/api/consultas/:id", async ({ params, request }) => {
    const consulta = mockConsultaList.find((tc) => tc.id === Number(params.id));

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
    const existe = mockConsultaList.some((tc) => tc.id === Number(params.id));

    if (!existe) {
      return HttpResponse.json(
        { message: "Consulta não encontrada" },
        { status: 404 },
      );
    }

    return new HttpResponse(null, { status: 204 });
  }),
];
