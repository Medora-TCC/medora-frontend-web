// mocks/browser.ts
import { setupWorker } from "msw/browser";
import { consultaHandlers } from "./consulta/consultaHandlers";
import { prontuarioHandler } from "./prontuario/ProntuarioHandlers";

export const worker = setupWorker(...consultaHandlers, ...prontuarioHandler);
