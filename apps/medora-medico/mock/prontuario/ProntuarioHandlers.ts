import { type MedicalRecordDTO } from "../../src/api/dtos/MedicalRecord/MedicalRecordDTO";
import { delay, http, HttpResponse } from "msw";

const mockListMedicalRecord: MedicalRecordDTO[] = [
  {
    id: "medrec-1",
    tipoConsulta: "Consulta Cardiológica",
    pacientId: "pac-123",
    doctorId: "doc-345",
    medicalRecord:
      '{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Teste número 1","type":"text","version":1}],"direction":null,"format":"","indent":0,"type":"paragraph","version":1,"textFormat":0,"textStyle":""}],"direction":null,"format":"","indent":0,"type":"root","version":1}}',
    date: "12/07/2025",
    status: "Inativado",
  },
  {
    id: "medrec-2",
    tipoConsulta: "Consulta Cardiológica",
    pacientId: "pac-123",
    doctorId: "doc-345",
    medicalRecord:
      '{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Teste 2","type":"text","version":1}],"direction":null,"format":"","indent":0,"type":"heading","version":1,"tag":"h1"}],"direction":null,"format":"","indent":0,"type":"root","version":1}}',
    date: "12/08/2025",
    status: "Ativo",
  },
  {
    id: "medrec-3",
    tipoConsulta: "Retorno",
    pacientId: "pac-123",
    doctorId: "doc-345",
    medicalRecord:
      '{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Teste 3","type":"text","version":1}],"direction":null,"format":"","indent":0,"type":"heading","version":1,"tag":"h2"}],"direction":null,"format":"","indent":0,"type":"root","version":1}}',
    date: "12/09/2025",
    status: "Finalizado",
  },
  {
    id: "medrec-4",
    tipoConsulta: "Consulta Cardiológica",
    pacientId: "pac-123",
    doctorId: "doc-345",
    medicalRecord:
      '{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Teste 3","type":"text","version":1}],"direction":null,"format":"","indent":0,"type":"heading","version":1,"tag":"h2"}],"direction":null,"format":"","indent":0,"type":"root","version":1}}',

    date: "12/10/2025",
    status: "Finalizado",
  },
  {
    id: "medrec-5",
    tipoConsulta: "Retorno",
    pacientId: "pac-123",
    doctorId: "doc-345",
    medicalRecord:
      '{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Teste 3","type":"text","version":1}],"direction":null,"format":"","indent":0,"type":"heading","version":1,"tag":"h2"}],"direction":null,"format":"","indent":0,"type":"root","version":1}}',
    date: "12/11/2025",
    status: "Finalizado",
  },
];

export const prontuarioHandler = [
  http.get("/api/prontuario", async () => {
    await delay(1500);
    return HttpResponse.json(mockListMedicalRecord);
  }),

  http.get("/api/prontuario/:id", ({ params }) => {
    const consulta = mockListMedicalRecord.find((mr) => mr.id === params.id);

    if (!consulta) {
      return HttpResponse.json(
        { message: "Consulta não encontrada" },
        { status: 404 },
      );
    }

    return HttpResponse.json(consulta);
  }),

  http.post("/api/prontuario", async ({ request }) => {
    const body = (await request.json()) as Omit<MedicalRecordDTO, "id">;

    const nova: MedicalRecordDTO = {
      ...body,
      id: `medrec-${Date.now}`,
    };

    mockListMedicalRecord.push(nova);
    return HttpResponse.json(nova, { status: 201 });
  }),
];
