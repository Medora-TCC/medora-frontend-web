import type { IConsulta } from "@medora_web/shared";

export default function openConsultaModal(c: IConsulta) {
      alert('Nome: ' + c.pacienteNome + " data: " + c.dataHorario)
}