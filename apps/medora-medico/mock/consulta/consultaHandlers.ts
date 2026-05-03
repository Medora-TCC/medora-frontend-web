

import type { IConsulta } from "@medora_web/shared"
import { delay, http, HttpResponse } from "msw";

const mockConsulta: IConsulta = {
    id: "tc-001",
    pacienteId: "pac-123",
    pacienteNome: "João Silva",
    medicoId: "med-456",
    dataHorario: "2026-05-10T14:00:00.000Z",
    status: "agendado",
    observacoes: "Paciente com histórico de hipertensão",
    tags: ["hipertensão", "retorno"],
};

const mockConsultaList: IConsulta[] = [
    mockConsulta,
    {
        id: "tc-002",
        pacienteId: "pac-789",
        pacienteNome: "Maria Souza",
        medicoId: "med-456",
        dataHorario: "2026-05-11T09:00:00.000Z",
        status: 'em_espera',
        // observacoes e tags ausentes — campos opcionais
    },
    {
        id: "tc-003",
        pacienteId: "pac-321",
        pacienteNome: "Carlos Mendes",
        medicoId: "med-456",
        dataHorario: "2026-05-08T10:30:00.000Z",
        status: 'finalizado',
        tags: ["primeira-consulta"],
        // salaVirtualUrl ausente — sala já encerrada
    },
    {
        id: "tc-004",
        pacienteId: "pac-404",
        pacienteNome: "Ana Pereira",
        medicoId: "med-789",
        dataHorario: "2026-05-12T16:00:00.000Z",
        status: "cancelado",
        observacoes: "Paciente com diabetes tipo 2",
        tags: ["diabetes", "acompanhamento"],
    },
    {
        id: "tc-005",
        pacienteId: "pac-505",
        pacienteNome: "Roberto Lima",
        medicoId: "med-789",
        dataHorario: "2026-05-07T08:00:00.000Z",
        status: "finalizado",
        observacoes: "Pós-operatório",
        tags: ["cirurgia", "retorno"],
    },
];

export const consultaHandlers = [
    // GET /api/consultas — lista todas
    http.get("/api/consultas", async () => {
        await delay(1500)
        return HttpResponse.json(mockConsultaList);
    }),

    // GET /api/consultas/:id — busca por id
    http.get("/api/consultas/:id", ({ params }) => {
        const consulta = mockConsultaList.find((tc) => tc.id === params.id);

        if (!consulta) {
            return HttpResponse.json(
                { message: "Consulta não encontrada" },
                { status: 404 }
            );
        }

        return HttpResponse.json(consulta);
    }),

    // POST /api/consultas — cria nova
    http.post("/api/consultas", async ({ request }) => {
        const body = (await request.json()) as Omit<IConsulta, "id">;

        const nova: IConsulta = {
            ...body,
            id: `tc-${Date.now()}`
        };

        return HttpResponse.json(nova, { status: 201 });
    }),

    // PATCH /api/consultas/:id — atualiza parcialmente
    http.patch("/api/consultas/:id", async ({ params, request }) => {
        const consulta = mockConsultaList.find((tc) => tc.id === params.id);

        if (!consulta) {
            return HttpResponse.json(
                { message: "Consulta não encontrada" },
                { status: 404 }
            );
        }

        const body = (await request.json()) as Partial<IConsulta>;
        const atualizada: IConsulta = { ...consulta, ...body };

        return HttpResponse.json(atualizada);
    }),

    // DELETE /api/consultas/:id — cancela/remove
    http.delete("/api/consultas/:id", ({ params }) => {
        const existe = mockConsultaList.some((tc) => tc.id === params.id);

        if (!existe) {
            return HttpResponse.json(
                { message: "Consulta não encontrada" },
                { status: 404 }
            );
        }

        return new HttpResponse(null, { status: 204 });
    }),
];